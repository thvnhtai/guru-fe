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

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: {
        following: {
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
      where: { followerId: userId },
    })

    return apiResponse({
      following: following.map((f) => f.following),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching following:', error)
    return apiError('Failed to fetch following', 500)
  }
}
