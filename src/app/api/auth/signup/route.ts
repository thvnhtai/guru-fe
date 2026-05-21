import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth/jwt'
import { hashPassword } from '@/lib/auth/password'
import { apiResponse, apiError } from '@/lib/utils/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, displayName } = body

    // Validation
    if (!email || !password || !displayName) {
      return apiError('Email, password, and display name are required', 400)
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return apiError('Invalid email format', 400)
    }

    // Password length validation
    if (password.length < 8) {
      return apiError('Password must be at least 8 characters', 400)
    }

    // Display name length validation
    if (displayName.length > 32) {
      return apiError('Display name must be 32 characters or less', 400)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return apiError('Email already registered', 409)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName,
      },
    })

    // Generate token
    const token = generateToken(user.id)

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return apiResponse(
      {
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt,
        },
      },
      201
    )
  } catch (error) {
    console.error('Signup error:', error)
    return apiError('Failed to create account', 500)
  }
}
