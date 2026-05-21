import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    // Check if user exists and is public
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

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      select: {
        follower: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            reputation: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.follow.count({
      where: { followingId: userId },
    })

    return apiResponse({
      followers: followers.map((f) => f.follower),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching followers:', error)
    return apiError('Failed to fetch followers', 500)
  }
}
