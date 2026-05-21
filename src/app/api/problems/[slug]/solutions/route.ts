import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const userId = await requireAuth()
    const { code, language, explanation } = await request.json()

    // Validation
    if (!code || code.trim().length === 0) {
      return apiError('Code is required', 400)
    }

    if (!language) {
      return apiError('Language is required', 400)
    }

    // Create solution
    const solution = await prisma.solution.create({
      data: {
        authorId: userId,
        problemSlug: slug,
        code: code.trim(),
        language,
        explanation: explanation ? explanation.trim() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    })

    return apiResponse(solution)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    console.error('Error creating solution:', error)
    return apiError('Failed to create solution', 500)
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'newest'

    const skip = (page - 1) * limit

    const solutions = await prisma.solution.findMany({
      where: {
        problemSlug: slug,
        isApproved: true,
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: {
        ...(sortBy === 'mostUpvoted' ? { upvotes: 'desc' } : { createdAt: 'desc' }),
      },
      skip,
      take: limit,
    })

    // Get total count
    const total = await prisma.solution.count({
      where: {
        problemSlug: slug,
        isApproved: true,
      },
    })

    return apiResponse({
      solutions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching solutions:', error)
    return apiError('Failed to fetch solutions', 500)
  }
}
