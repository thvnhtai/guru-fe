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
    const { voteType } = await request.json()

    // Validation
    if (voteType !== 'upvote' && voteType !== 'downvote') {
      return apiError('Invalid vote type. Must be "upvote" or "downvote"', 400)
    }

    // Check if solution exists
    const solution = await prisma.solution.findUnique({
      where: { id },
    })

    if (!solution) {
      return apiError('Solution not found', 404)
    }

    // Check if user already voted
    const existingVote = await prisma.solutionVote.findUnique({
      where: {
        userId_solutionId: {
          userId,
          solutionId: id,
        },
      },
    })

    if (existingVote) {
      // Same vote type: remove vote
      if (existingVote.voteType === voteType) {
        await prisma.solutionVote.delete({
          where: {
            userId_solutionId: {
              userId,
              solutionId: id,
            },
          },
        })

        // Update upvote count
        const delta = voteType === 'upvote' ? -1 : 0
        const updated = await prisma.solution.update({
          where: { id },
          data: {
            upvotes: Math.max(0, solution.upvotes + delta),
          },
        })

        return apiResponse({
          voteRemoved: true,
          upvotes: updated.upvotes,
        })
      } else {
        // Different vote type: update vote
        await prisma.solutionVote.update({
          where: {
            userId_solutionId: {
              userId,
              solutionId: id,
            },
          },
          data: { voteType },
        })

        // Update upvote count (old was downvote, new is upvote)
        const updated = await prisma.solution.update({
          where: { id },
          data: {
            upvotes: solution.upvotes + 2,
          },
        })

        return apiResponse({
          voteChanged: true,
          upvotes: updated.upvotes,
        })
      }
    } else {
      // New vote
      await prisma.solutionVote.create({
        data: {
          userId,
          solutionId: id,
          voteType,
        },
      })

      // Update upvote count
      const delta = voteType === 'upvote' ? 1 : 0
      const updated = await prisma.solution.update({
        where: { id },
        data: {
          upvotes: solution.upvotes + delta,
        },
      })

      return apiResponse({
        voteAdded: true,
        voteType,
        upvotes: updated.upvotes,
      })
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return apiError('Unauthorized', 401)
    }
    console.error('Error voting on solution:', error)
    return apiError('Failed to vote on solution', 500)
  }
}
