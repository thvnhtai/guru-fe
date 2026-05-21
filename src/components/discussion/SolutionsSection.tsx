'use client'

import { useEffect, useState } from 'react'
import { useSolutions } from '@/lib/hooks/useSolutions'
import { useUserStore } from '@/stores/userStore'
import { SolutionForm } from './SolutionForm'
import { SolutionItem } from './SolutionItem'

interface SolutionsSectionProps {
  problemSlug: string
}

export function SolutionsSection({ problemSlug }: SolutionsSectionProps) {
  const {
    solutions,
    loading,
    error,
    pagination,
    fetch,
    createNew,
    vote,
  } = useSolutions(problemSlug)

  const [sortBy, setSortBy] = useState<'newest' | 'mostUpvoted'>('mostUpvoted')
  const [showForm, setShowForm] = useState(false)
  const [userVotes, setUserVotes] = useState<Record<string, 'upvote' | 'downvote' | null>>({})
  const user = useUserStore((state) => state.user)

  useEffect(() => {
    fetch(1, sortBy)
  }, [problemSlug, sortBy, fetch])

  const handleShareSolution = async (code: string, language: string, explanation?: string) => {
    await createNew(code, language, explanation)
    setShowForm(false)
  }

  const handleVote = async (solutionId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) return

    const currentVote = userVotes[solutionId]

    // Toggle or change vote
    try {
      await vote(solutionId, voteType)
      setUserVotes((prev) => ({
        ...prev,
        [solutionId]: currentVote === voteType ? null : voteType,
      }))
    } catch (err) {
      console.error('Vote failed:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Share form */}
      {user && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium hover:bg-green-100 text-sm"
        >
          + Share Your Solution
        </button>
      )}

      {showForm && (
        <SolutionForm
          onSubmit={handleShareSolution}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Sort and filters */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Solutions ({pagination.total})</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'mostUpvoted')}
          className="px-3 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="mostUpvoted">Most Upvoted</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Solutions list */}
      <div className="space-y-3">
        {loading && <p className="text-gray-500">Loading solutions...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && solutions.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No solutions shared yet. Be the first to share yours!
          </p>
        )}

        {solutions.map((solution) => (
          <SolutionItem
            key={solution.id}
            solution={solution}
            onUpvote={() => handleVote(solution.id, 'upvote')}
            onDownvote={() => handleVote(solution.id, 'downvote')}
            userVote={userVotes[solution.id] || null}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => fetch(Math.max(1, pagination.page - 1), sortBy)}
            disabled={pagination.page === 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => fetch(Math.min(pagination.pages, pagination.page + 1), sortBy)}
            disabled={pagination.page === pagination.pages}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
