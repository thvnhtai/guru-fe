import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth/jwt'
import { comparePassword } from '@/lib/auth/password'
import { apiResponse, apiError } from '@/lib/utils/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return apiError('Email and password are required', 400)
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return apiError('Invalid email or password', 401)
    }

    // Verify password
    const passwordMatch = await comparePassword(password, user.password)

    if (!passwordMatch) {
      return apiError('Invalid email or password', 401)
    }

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

    return apiResponse({
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return apiError('Failed to login', 500)
  }
}
