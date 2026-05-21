'use client'

import Link from 'next/link'
import type { LeaderboardEntry } from '@/types/user'
import { useUserStore } from '@/stores/userStore'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  userRank?: number | null
  loading?: boolean
}

export function LeaderboardTable({ entries, userRank, loading }: LeaderboardTableProps) {
  const currentUser = useUserStore((state) => state.user)

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading leaderboard...</div>
  }

  if (entries.length === 0) {
    return <div className="p-8 text-center text-gray-500">No leaderboard entries yet</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-300 bg-gray-50">
            <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">Rank</th>
            <th className="px-4 py-3 text-left font-semibold text-sm text-gray-700">User</th>
            <th className="px-4 py-3 text-center font-semibold text-sm text-gray-700">Score</th>
            <th className="px-4 py-3 text-center font-semibold text-sm text-gray-700">Problems Solved</th>
            <th className="px-4 py-3 text-center font-semibold text-sm text-gray-700">Solutions Shared</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isCurrentUser = currentUser?.id === entry.userId
            const initials = entry.displayName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()

            return (
              <tr
                key={entry.id}
                className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                  isCurrentUser ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  <span className="text-base">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/users/${entry.userId}`}>
                    <div className="flex items-center gap-3 hover:opacity-80 transition">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        {initials}
                      </div>
                      <span className={`text-sm font-medium ${isCurrentUser ? 'text-blue-600' : 'text-gray-900'}`}>
                        {entry.displayName}
                        {isCurrentUser && ' (You)'}
                      </span>
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">{entry.score}</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">{entry.problemsSolved}</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">{entry.solutionsShared}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {userRank && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-center">
          <p className="text-sm text-blue-900">
            Your current rank: <span className="font-semibold">#{userRank}</span>
          </p>
        </div>
      )}
    </div>
  )
}
