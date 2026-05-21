'use client'

import { useEffect, useState } from 'react'
import { useComments } from '@/lib/hooks/useComments'
import { useUserStore } from '@/stores/userStore'
import { CommentForm } from './CommentForm'
import { CommentItem } from './CommentItem'

interface CommentsSectionProps {
  problemSlug: string
}

export function CommentsSection({ problemSlug }: CommentsSectionProps) {
  const {
    comments,
    loading,
    error,
    pagination,
    fetch,
    createNew,
    update,
    delete: deleteComment,
    like,
  } = useComments(problemSlug)

  const [sortBy, setSortBy] = useState<'newest' | 'mostLiked'>('newest')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const user = useUserStore((state) => state.user)

  useEffect(() => {
    fetch(1, sortBy)
  }, [problemSlug, sortBy, fetch])

  const handlePostComment = async (content: string) => {
    await createNew(content, replyingTo || undefined)
    setReplyingTo(null)
  }

  return (
    <div className="space-y-6">
      {/* Comment form */}
      {user && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold mb-4">Add a comment</h3>
          <CommentForm
            onSubmit={handlePostComment}
            placeholder={replyingTo ? 'Write a reply...' : 'Share your thoughts...'}
            parentId={replyingTo || undefined}
            onCancel={replyingTo ? () => setReplyingTo(null) : undefined}
          />
        </div>
      )}

      {/* Sort and filters */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Comments ({pagination.total})</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'mostLiked')}
          className="px-3 py-1 border border-gray-300 rounded text-sm"
        >
          <option value="newest">Newest</option>
          <option value="mostLiked">Most Liked</option>
        </select>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {loading && <p className="text-gray-500">Loading comments...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && comments.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}

        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={() => setReplyingTo(comment.id)}
            onEdit={update}
            onDelete={deleteComment}
            onLike={like}
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
