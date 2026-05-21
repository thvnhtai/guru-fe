'use client'

import { useState, useEffect } from 'react'
import type { LeaderboardEntry, LeaderboardCategory } from '@/types/user'
import { getLeaderboard, getUserRank, getLeaderboardCategories } from '@/lib/api/leaderboards'

interface LeaderboardState {
  entries: LeaderboardEntry[]
  userRank: number | null
  loading: boolean
  error: string | null
  page: number
  total: number
  pages: number
}

export function useLeaderboard(category: LeaderboardCategory) {
  const [state, setState] = useState<LeaderboardState>({
    entries: [],
    userRank: null,
    loading: true,
    error: null,
    page: 1,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const data = await getLeaderboard(category, state.page, 100)
        setState((prev) => ({
          ...prev,
          entries: data.entries,
          total: data.pagination.total,
          pages: data.pagination.pages,
          loading: false,
        }))

        // Fetch user's rank
        try {
          const rank = await getUserRank(category)
          setState((prev) => ({
            ...prev,
            userRank: rank.rank,
          }))
        } catch (err) {
          console.warn('Failed to fetch user rank:', err)
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to fetch leaderboard',
          loading: false,
        }))
      }
    }

    fetchLeaderboard()
  }, [category, state.page])

  const goToPage = (page: number) => {
    setState((prev) => ({ ...prev, page }))
  }

  return {
    ...state,
    goToPage,
  }
}

export function useLeaderboardCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getLeaderboardCategories()
        setCategories(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  return { categories, loading, error }
}
