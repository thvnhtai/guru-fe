'use client'

import { useState } from 'react'
import type { LeaderboardCategory } from '@/types/user'
import { useLeaderboard, useLeaderboardCategories } from '@/lib/hooks/useLeaderboard'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'

export default function LeaderboardsPage() {
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>('global')
  const { categories, loading: categoriesLoading } = useLeaderboardCategories()
  const { entries, userRank, loading, error, page, pages, goToPage } = useLeaderboard(selectedCategory)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">🏆 Leaderboards</h1>
        <p className="text-gray-600 mt-2">Compete with other coders and see where you rank</p>
      </div>

      {/* Category Selector */}
      {!categoriesLoading && categories.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Select Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as LeaderboardCategory)
                  goToPage(1)
                }}
                className={`p-3 rounded-lg border-2 font-medium transition ${
                  selectedCategory === cat.id
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                }`}
              >
                <div className="text-sm">{cat.label}</div>
                <div className="text-xs mt-1 opacity-75">{cat.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded mb-4">{error}</div>}

        <LeaderboardTable entries={entries} userRank={userRank} loading={loading} />

        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 rounded text-sm ${
                      page === pageNum
                        ? 'bg-blue-500 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              {pages > 5 && <span className="px-2 py-1">...</span>}
            </div>

            <button
              onClick={() => goToPage(Math.min(pages, page + 1))}
              disabled={page === pages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{entries.length}</p>
          <p className="text-sm text-gray-600 mt-2">Users on Leaderboard</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6 text-center">
          <p className="text-3xl font-bold text-purple-600">{entries[0]?.score || 0}</p>
          <p className="text-sm text-gray-600 mt-2">Top Score</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6 text-center">
          <p className="text-3xl font-bold text-green-600">{userRank ? `#${userRank}` : 'N/A'}</p>
          <p className="text-sm text-gray-600 mt-2">Your Rank</p>
        </div>
      </div>
    </div>
  )
}
