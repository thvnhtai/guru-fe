import { requireAuth } from '@/lib/utils/auth'
import { prisma } from '@/lib/prisma'
import { apiResponse, apiError } from '@/lib/utils/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await requireAuth()

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!comment) {
      return apiError('Comment not found', 404)
    }

    // Check if user already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId: id,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_commentId: {
            userId,
            commentId: id,
          },
        },
      })

      // Decrement like count
      const updated = await prisma.comment.update({
        where: { id },
        data: {
          likes: Math.max(0, comment.likes - 1),
        },
      })

      return apiResponse({
        liked: false,
        likes: updated.likes,
      })
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId,
          commentId: id,
        },
      })

      // Increment like count
      const updated = await prisma.comment.update({
        where: { id },
        data: {
          likes: comment.likes + 1,
        },
      })

      return apiResponse({
        liked: true,
        likes: updated.likes,
      })
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    console.error('Error toggling like:', error)
    return apiError('Failed to toggle like', 500)
  }
}
