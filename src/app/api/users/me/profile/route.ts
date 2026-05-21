import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils/auth'

export async function PUT(request: Request) {
  try {
    const userId = await requireAuth()
    const { bio, isPublic } = await request.json()

    // Validation
    if (bio !== undefined && bio.length > 256) {
      return apiError('Bio must be less than 256 characters', 400)
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(bio !== undefined && { bio: bio.trim() || null }),
        ...(isPublic !== undefined && { isPublic }),
      },
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
      },
    })

    return apiResponse({
      ...updated,
      followerCount: updated._count.followers,
      followingCount: updated._count.following,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    console.error('Error updating profile:', error)
    return apiError('Failed to update profile', 500)
  }
}
