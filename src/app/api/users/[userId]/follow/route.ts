import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params
    const currentUserId = await requireAuth()

    // Can't follow yourself
    if (currentUserId === targetUserId) {
      return apiError('Cannot follow yourself', 400)
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    })

    if (!targetUser) {
      return apiError('User not found', 404)
    }

    // Check if already following
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    })

    if (existing) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        },
      })

      return apiResponse({ following: false })
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      })

      return apiResponse({ following: true })
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    console.error('Error toggling follow:', error)
    return apiError('Failed to toggle follow', 500)
  }
}
