import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await requireAuth()
    const { content } = await request.json()

    // Validation
    if (!content || content.trim().length === 0) {
      return apiError('Comment content is required', 400)
    }

    if (content.length > 2000) {
      return apiError('Comment must be less than 2000 characters', 400)
    }

    // Get comment and check ownership
    const comment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!comment) {
      return apiError('Comment not found', 404)
    }

    if (comment.authorId !== userId) {
      return apiError('Unauthorized', 401)
    }

    // Update comment
    const updated = await prisma.comment.update({
      where: { id },
      data: {
        content: content.trim(),
        isEdited: true,
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

    return apiResponse(updated)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    console.error('Error updating comment:', error)
    return apiError('Failed to update comment', 500)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await requireAuth()

    // Get comment and check ownership
    const comment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!comment) {
      return apiError('Comment not found', 404)
    }

    if (comment.authorId !== userId) {
      return apiError('Unauthorized', 401)
    }

    // Delete comment (cascades to replies and likes)
    await prisma.comment.delete({
      where: { id },
    })

    return apiResponse({ message: 'Comment deleted successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    console.error('Error deleting comment:', error)
    return apiError('Failed to delete comment', 500)
  }
}
