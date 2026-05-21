'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { Solution } from '@/types/discussion'
import { useUserStore } from '@/stores/userStore'

interface SolutionItemProps {
  solution: Solution
  onUpvote?: (id: string) => Promise<void>
  onDownvote?: (id: string) => Promise<void>
  userVote?: 'upvote' | 'downvote' | null
}

export function SolutionItem({
  solution,
  onUpvote,
  onDownvote,
  userVote,
}: SolutionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const user = useUserStore((state) => state.user)

  const initials = solution.author.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const handleVote = async (type: 'upvote' | 'downvote') => {
    if (!user) return
    setIsVoting(true)
    try {
      if (type === 'upvote') {
        await onUpvote?.(solution.id)
      } else {
        await onDownvote?.(solution.id)
      }
    } catch (err) {
      console.error('Vote failed:', err)
    } finally {
      setIsVoting(false)
    }
  }

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      python: 'bg-blue-100 text-blue-800',
      javascript: 'bg-yellow-100 text-yellow-800',
      typescript: 'bg-purple-100 text-purple-800',
      java: 'bg-orange-100 text-orange-800',
      cpp: 'bg-red-100 text-red-800',
      c: 'bg-gray-100 text-gray-800',
      go: 'bg-cyan-100 text-cyan-800',
    }
    return colors[language.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
            {initials}
          </div>
          <div>
            <p className="font-medium text-sm">{solution.author.displayName}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(solution.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded font-medium ${getLanguageColor(solution.language)}`}>
          {solution.language}
        </span>
      </div>

      {/* Code preview */}
      {!isExpanded && (
        <div className="bg-gray-50 rounded border border-gray-200 p-3 font-mono text-xs overflow-hidden">
          <div className="text-gray-600 line-clamp-4">
            {solution.code.split('\n').slice(0, 4).join('\n')}
          </div>
          {solution.code.split('\n').length > 4 && (
            <p className="text-gray-400 mt-2">... ({solution.code.split('\n').length} lines total)</p>
          )}
        </div>
      )}

      {/* Full code (expanded) */}
      {isExpanded && (
        <div className="bg-gray-50 rounded border border-gray-200 p-3 font-mono text-xs overflow-x-auto max-h-96">
          <pre className="text-gray-700">{solution.code}</pre>
        </div>
      )}

      {/* Explanation */}
      {solution.explanation && !isExpanded && (
        <p className="text-sm text-gray-600 line-clamp-2">{solution.explanation}</p>
      )}

      {isExpanded && solution.explanation && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm font-medium text-blue-900 mb-2">Explanation</p>
          <p className="text-sm text-blue-800 whitespace-pre-wrap">{solution.explanation}</p>
        </div>
      )}

      {/* Footer with actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleVote('upvote')}
            disabled={isVoting || !user}
            className={`text-sm font-medium flex items-center gap-1 ${
              userVote === 'upvote'
                ? 'text-green-600'
                : 'text-gray-600 hover:text-green-600'
            } disabled:opacity-50`}
          >
            👍 {solution.upvotes}
          </button>
          <span className="text-xs text-gray-500">👁️ {solution.views}</span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {isExpanded ? 'Collapse' : 'View Full'}
        </button>
      </div>
    </div>
  )
}
