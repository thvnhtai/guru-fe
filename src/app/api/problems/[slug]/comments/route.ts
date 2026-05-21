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
    const { content, parentCommentId } = await request.json()

    // Validation
    if (!content || content.trim().length === 0) {
      return apiError('Comment content is required', 400)
    }

    if (content.length > 2000) {
      return apiError('Comment must be less than 2000 characters', 400)
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        authorId: userId,
        problemSlug: slug,
        content: content.trim(),
        parentCommentId: parentCommentId || null,
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

    return apiResponse(comment)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    console.error('Error creating comment:', error)
    return apiError('Failed to create comment', 500)
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
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'newest'

    const skip = (page - 1) * limit

    // Get only top-level comments (no parentCommentId)
    const comments = await prisma.comment.findMany({
      where: {
        problemSlug: slug,
        parentCommentId: null,
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        replies: {
          take: 3, // Show only first 3 replies
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        ...(sortBy === 'mostLiked' ? { likes: 'desc' } : { createdAt: 'desc' }),
      },
      skip,
      take: limit,
    })

    // Get total count
    const total = await prisma.comment.count({
      where: {
        problemSlug: slug,
        parentCommentId: null,
      },
    })

    return apiResponse({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return apiError('Failed to fetch comments', 500)
  }
}
