import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')

    const skip = (page - 1) * limit

    const entries = await prisma.leaderboard.findMany({
      where: { category },
      select: {
        id: true,
        userId: true,
        rank: true,
        score: true,
        problemsSolved: true,
        solutionsShared: true,
        user: {
          select: {
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { rank: 'asc' },
      skip,
      take: limit,
    })

    const total = await prisma.leaderboard.count({
      where: { category },
    })

    return apiResponse({
      entries: entries.map((e) => ({
        id: e.id,
        userId: e.userId,
        displayName: e.user.displayName,
        avatarUrl: e.user.avatarUrl,
        rank: e.rank,
        score: e.score,
        problemsSolved: e.problemsSolved,
        solutionsShared: e.solutionsShared,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return apiError('Failed to fetch leaderboard', 500)
  }
}
