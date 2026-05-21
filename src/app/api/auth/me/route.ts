import { requireAuth, apiResponse, apiError } from '@/lib/utils/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const userId = await requireAuth()

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
      },
    })

    if (!user) {
      return apiError('User not found', 404)
    }

    return apiResponse({ user })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    console.error('Error fetching current user:', error)
    return apiError('Failed to fetch user', 500)
  }
}
