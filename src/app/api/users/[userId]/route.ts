import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        email: true,
        bio: true,
        avatarUrl: true,
        reputation: true,
        isPublic: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
        badges: {
          select: {
            id: true,
            badgeType: true,
            earnedAt: true,
          },
        },
      },
    })

    if (!user) {
      return apiError('User not found', 404)
    }

    // Don't reveal email if not public
    if (!user.isPublic && user.id !== userId) {
      return apiError('User profile is private', 403)
    }

    return apiResponse({
      ...user,
      email: user.id === userId ? user.email : undefined,
      followerCount: user._count.followers,
      followingCount: user._count.following,
      _count: undefined,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return apiError('Failed to fetch user profile', 500)
  }
}
