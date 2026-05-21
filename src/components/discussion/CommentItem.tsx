'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { Comment } from '@/types/discussion'
import { useUserStore } from '@/stores/userStore'

interface CommentItemProps {
  comment: Comment
  onReply?: (parentId: string) => void
  onEdit?: (id: string, content: string) => void
  onDelete?: (id: string) => void
  onLike?: (id: string) => void
  showReplies?: boolean
  onLoadReplies?: (commentId: string) => void
  isLoadingReplies?: boolean
}

export function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  showReplies = false,
  onLoadReplies,
  isLoadingReplies = false,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const user = useUserStore((state) => state.user)

  const isAuthor = user?.id === comment.authorId
  const initials = comment.author.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent !== comment.content) {
      try {
        await onEdit?.(comment.id, editContent)
        setIsEditing(false)
      } catch (err) {
        console.error('Failed to edit comment:', err)
      }
    }
  }

  const handleDelete = async () => {
    if (confirm('Delete this comment?')) {
      try {
        await onDelete?.(comment.id)
      } catch (err) {
        console.error('Failed to delete comment:', err)
      }
    }
  }

  return (
    <div className="border-l-2 border-gray-200 pl-4 py-3">
      {/* Comment header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
          <div>
            <p className="font-medium text-sm">{comment.author.displayName}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              {comment.isEdited && ' (edited)'}
            </p>
          </div>
        </div>

        {/* Actions menu */}
        {isAuthor && (
          <div className="flex gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Comment content */}
      <div className="mt-2">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(comment.content)
                }}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-2 flex gap-4 text-xs">
        <button
          onClick={() => onLike?.(comment.id)}
          className="text-gray-600 hover:text-red-500 flex items-center gap-1"
        >
          ❤️ {comment.likes}
        </button>
        {onReply && (
          <button
            onClick={() => onReply(comment.id)}
            className="text-gray-600 hover:text-blue-500"
          >
            Reply
          </button>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onLike={onLike}
            />
          ))}
        </div>
      )}
    </div>
  )
}
