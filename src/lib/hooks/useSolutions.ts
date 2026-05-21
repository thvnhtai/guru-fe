'use client'

import { useState, useCallback } from 'react'
import type { Solution, SolutionsResponse } from '@/types/discussion'
import { getSolutions, createSolution, voteSolution } from '@/lib/api/discussion'

export function useSolutions(problemSlug: string) {
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  const fetch = useCallback(
    async (page: number = 1, sortBy: 'newest' | 'mostUpvoted' = 'newest') => {
      setLoading(true)
      setError(null)
      try {
        const data = await getSolutions(problemSlug, page, 10, sortBy)
        setSolutions(data.solutions)
        setPagination(data.pagination)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch solutions')
      } finally {
        setLoading(false)
      }
    },
    [problemSlug]
  )

  const createNew = useCallback(
    async (code: string, language: string, explanation?: string) => {
      try {
        const newSolution = await createSolution(problemSlug, {
          code,
          language,
          explanation,
        })
        setSolutions((prev) => [newSolution, ...prev])
        return newSolution
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create solution'
        setError(message)
        throw err
      }
    },
    [problemSlug]
  )

  const vote = useCallback(
    async (solutionId: string, voteType: 'upvote' | 'downvote') => {
      try {
        const result = await voteSolution(solutionId, { voteType })
        setSolutions((prev) =>
          prev.map((s) =>
            s.id === solutionId ? { ...s, upvotes: result.upvotes } : s
          )
        )
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to vote'
        setError(message)
        throw err
      }
    },
    []
  )

  return {
    solutions,
    loading,
    error,
    pagination,
    fetch,
    createNew,
    vote,
  }
}
