import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPublic: true },
    })

    if (!user) {
      return apiError('User not found', 404)
    }

    if (!user.isPublic) {
      return apiError('User profile is private', 403)
    }

    const badges = await prisma.badge.findMany({
      where: { userId },
      select: {
        id: true,
        badgeType: true,
        earnedAt: true,
      },
      orderBy: { earnedAt: 'desc' },
    })

    return apiResponse({ badges })
  } catch (error) {
    console.error('Error fetching badges:', error)
    return apiError('Failed to fetch badges', 500)
  }
}
