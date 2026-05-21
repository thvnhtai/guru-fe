'use client'

import { useState } from 'react'
import { CommentsSection } from './CommentsSection'
import { SolutionsSection } from './SolutionsSection'

interface DiscussionPanelProps {
  problemSlug: string
  commentCount?: number
  solutionCount?: number
}

type Tab = 'comments' | 'solutions'

export function DiscussionPanel({
  problemSlug,
  commentCount = 0,
  solutionCount = 0,
}: DiscussionPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('comments')

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'comments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          💬 Discussion ({commentCount})
        </button>
        <button
          onClick={() => setActiveTab('solutions')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'solutions'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          ✨ Solutions ({solutionCount})
        </button>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'comments' && <CommentsSection problemSlug={problemSlug} />}
        {activeTab === 'solutions' && <SolutionsSection problemSlug={problemSlug} />}
      </div>
    </div>
  )
}
