import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const { category } = await params
    const userId = await requireAuth()

    const entry = await prisma.leaderboard.findUnique({
      where: {
        userId_category: {
          userId,
          category,
        },
      },
      select: {
        rank: true,
        score: true,
        problemsSolved: true,
        solutionsShared: true,
      },
    })

    if (!entry) {
      return apiResponse({
        rank: null,
        score: 0,
        problemsSolved: 0,
        solutionsShared: 0,
      })
    }

    return apiResponse(entry)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    console.error('Error fetching user rank:', error)
    return apiError('Failed to fetch user rank', 500)
  }
}
