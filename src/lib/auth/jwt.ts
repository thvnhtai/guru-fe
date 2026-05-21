import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
const JWT_EXPIRY = '7d'

export interface TokenPayload {
  sub: string
  iat?: number
  exp?: number
}

/**
 * Generate a new JWT token for a user
 */
export function generateToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

/**
 * Extract user ID from token payload
 */
export function extractUserIdFromToken(token: string): string | null {
  const payload = verifyToken(token)
  return payload?.sub || null
}
