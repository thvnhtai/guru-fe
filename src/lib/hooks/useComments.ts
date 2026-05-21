'use client'

import { useState, useCallback } from 'react'
import type { Comment, CommentsResponse } from '@/types/discussion'
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
} from '@/lib/api/discussion'

export function useComments(problemSlug: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  const fetch = useCallback(
    async (page: number = 1, sortBy: 'newest' | 'mostLiked' = 'newest') => {
      setLoading(true)
      setError(null)
      try {
        const data = await getComments(problemSlug, page, 20, sortBy)
        setComments(data.comments)
        setPagination(data.pagination)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch comments')
      } finally {
        setLoading(false)
      }
    },
    [problemSlug]
  )

  const createNew = useCallback(
    async (content: string, parentCommentId?: string) => {
      try {
        const newComment = await createComment(problemSlug, { content, parentCommentId })
        setComments((prev) => [newComment, ...prev])
        return newComment
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create comment'
        setError(message)
        throw err
      }
    },
    [problemSlug]
  )

  const update = useCallback(async (commentId: string, content: string) => {
    try {
      const updated = await updateComment(commentId, { content })
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updated : c))
      )
      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update comment'
      setError(message)
      throw err
    }
  }, [])

  const delete_ = useCallback(async (commentId: string) => {
    try {
      await deleteComment(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete comment'
      setError(message)
      throw err
    }
  }, [])

  const like = useCallback(async (commentId: string) => {
    try {
      const result = await likeComment(commentId)
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, likes: result.likes } : c
        )
      )
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to like comment'
      setError(message)
      throw err
    }
  }, [])

  return {
    comments,
    loading,
    error,
    pagination,
    fetch,
    createNew,
    update,
    delete: delete_,
    like,
  }
}
