# Guru Backend Authentication Setup Guide

This document explains how to set up the backend authentication server for Phase 8: User Authentication & Persistent Accounts.

## Overview

The frontend (guru-fe) is now ready to support user authentication. To fully activate this feature, you need to set up a backend authentication server that handles:

- User signup/login with email and password
- JWT token generation and refresh
- Password hashing with bcrypt
- PostgreSQL database for user storage

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (guru-fe) - Port 3000             │  │
│  │  - Login/Signup Pages                               │  │
│  │  - Auth State Management (Zustand)                  │  │
│  │  - Protected Routes                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│           │                                                 │
│           │ HTTP Requests (with credentials)              │
│           ↓                                                 │
└─────────────────────────────────────────────────────────────┘
           │
           │ POST /auth/signup
           │ POST /auth/login
           │ GET /auth/me
           │ POST /auth/refresh
           │ POST /auth/logout
           ↓
┌─────────────────────────────────────────────────────────────┐
│          Backend Auth Server - Port 3001/3002              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Node.js/Express                                     │  │
│  │  - bcryptjs: Password hashing                        │  │
│  │  - jsonwebtoken: JWT generation                      │  │
│  │  - pg/Prisma: Database ORM                           │  │
│  │  - CORS enabled for localhost:3000                   │  │
│  └──────────────────────────────────────────────────────┘  │
│           │                                                 │
│           ↓                                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                 │  │
│  │  - users table (id, email, password_hash, ...)      │  │
│  │  - refresh_tokens table                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **Node.js** 18+ and npm/pnpm
2. **PostgreSQL** 13+ (local or hosted)
3. **Git** for version control
4. Basic understanding of Node.js/Express

## Setup Instructions

### Step 1: Create Backend Project

```bash
# Create backend directory in parent of guru-fe
cd ..
mkdir guru-backend
cd guru-backend

# Initialize Node project
npm init -y

# Install dependencies
npm install express cors pg jsonwebtoken bcryptjs dotenv
npm install --save-dev nodemon typescript @types/node @types/express
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE guru_auth;

# Connect to the database
\c guru_auth

# Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# Create refresh_tokens table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

### Step 3: Environment Variables

Create `.env` file in `guru-backend`:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/guru_auth

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Admin (for testing)
TEST_EMAIL=test@example.com
TEST_PASSWORD=password123
```

### Step 4: Create Express Server

**File: `guru-backend/src/server.js`**

```javascript
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Helper: Generate JWT
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY }
  );
}

// Helper: Hash password
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

// Helper: Verify password
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Helper: Authenticate middleware
async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}

// ─────────────────────────────────────────────────────────────
// POST /auth/signup
// ─────────────────────────────────────────────────────────────
app.post("/auth/signup", async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Validation
    if (!email || !password || !displayName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    // Check if user exists
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert user
    const result = await pool.query(
      "INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name, created_at",
      [email, passwordHash, displayName]
    );

    const user = result.rows[0];
    const accessToken = generateAccessToken(user);

    res.status(201).json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /auth/login
// ─────────────────────────────────────────────────────────────
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find user
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await verifyPassword(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user);

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /auth/me
// ─────────────────────────────────────────────────────────────
app.get("/auth/me", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, display_name, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Failed to get user" });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /auth/logout
// ─────────────────────────────────────────────────────────────
app.post("/auth/logout", (req, res) => {
  // JWT is stateless, logout happens on client side (clear token)
  res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────
// POST /auth/refresh
// ─────────────────────────────────────────────────────────────
app.post("/auth/refresh", authenticate, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    const accessToken = generateAccessToken(user);

    res.json({ accessToken });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ message: "Token refresh failed" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ Auth server running on http://localhost:${PORT}`);
});
```

### Step 5: Update `package.json` Scripts

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### Step 6: Start Backend Server

```bash
npm run dev
# Should output: ✓ Auth server running on http://localhost:3001
```

## Frontend Configuration

The frontend is already configured to communicate with the backend. Update the environment variable if needed:

**File: `guru-fe/.env.local`**

```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:3001
```

## Testing Authentication Flow

1. **Start backend:**
   ```bash
   cd guru-backend
   npm run dev
   ```

2. **Start frontend:**
   ```bash
   cd guru-fe
   pnpm dev
   ```

3. **Test signup:**
   - Navigate to `http://localhost:3000/auth/signup`
   - Fill in email, name, and password
   - Submit form
   - Should redirect to home page showing logged-in state

4. **Test login:**
   - Refresh page
   - User should remain logged in (persisted in localStorage)
   - Click "Sign out"
   - Should redirect to home with login/signup buttons visible

## Security Considerations

### In Development

- JWTs stored in memory (cleared on refresh)
- CORS allows localhost:3000
- Passwords hashed with bcrypt (10 rounds)

### For Production

1. **Use httpOnly Cookies:**
   - Store JWT in httpOnly, secure, sameSite cookies
   - Never expose tokens in localStorage
   - Backend sets cookie with appropriate flags

2. **HTTPS Only:**
   - All auth requests must use HTTPS
   - Set `secure` flag on cookies

3. **Rate Limiting:**
   ```javascript
   const rateLimit = require("express-rate-limit");
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // Limit each IP to 5 requests per windowMs
   });
   app.post("/auth/login", limiter, ...);
   ```

4. **Environment Variables:**
   - Use strong `JWT_SECRET` (min 32 characters)
   - Never commit `.env` to version control
   - Rotate secrets periodically

5. **Database:**
   - Use strong PostgreSQL passwords
   - Enable SSL for database connections
   - Regular backups

6. **Input Validation:**
   - Validate email format
   - Validate password strength
   - Sanitize all inputs

## Troubleshooting

### "Cannot connect to database"
- Verify PostgreSQL is running: `psql postgres`
- Check DATABASE_URL in `.env`
- Ensure database exists: `createdb guru_auth`

### "CORS error: No 'Access-Control-Allow-Origin' header"
- Backend CORS not configured correctly
- Check `CORS_ORIGIN` in `.env`
- Ensure `cors()` middleware is first in Express

### "Invalid token"
- Check JWT_SECRET matches between signup/login
- Verify token hasn't expired
- Check Authorization header format: `Bearer <token>`

### "Port 3001 already in use"
- Change PORT in `.env` to 3002, 3003, etc.
- Or kill existing process: `lsof -i :3001 | kill -9 <PID>`

## Next Steps

After authentication is working:

1. **Protect Routes:** Add middleware to require authentication for `/room/[roomId]`
2. **User Profiles:** Create `/profile` page to show user stats
3. **Room History:** Track room creation and associate with user
4. **Leaderboards:** Add stats tracking and leaderboard display
5. **Social Features:** Add following/friends system

## Files Created

- `guru-backend/src/server.js` - Express auth server
- `guru-backend/.env` - Environment variables (DO NOT commit)
- `guru-backend/package.json` - Dependencies

## Files Modified (Frontend)

- `src/types/auth.ts` - Auth TypeScript types
- `src/lib/api/auth.ts` - Auth API client
- `src/stores/userStore.ts` - Auth state management
- `src/app/auth/login/page.tsx` - Login page
- `src/app/auth/signup/page.tsx` - Signup page
- `src/app/page.tsx` - Updated home with auth UI

## References

- [JWT Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
