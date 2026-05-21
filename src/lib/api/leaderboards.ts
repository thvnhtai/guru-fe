import type { LeaderboardResponse, LeaderboardCategory } from '@/types/user'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

async function handleResponse(response: Response) {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || `Error: ${response.status}`)
  }
  return data
}

// Leaderboard API
export async function getLeaderboard(
  category: LeaderboardCategory,
  page: number = 1,
  limit: number = 100
): Promise<LeaderboardResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  const response = await fetch(`${API_BASE_URL}/api/leaderboards/${category}?${params}`)
  return handleResponse(response)
}

export async function getUserRank(category: LeaderboardCategory) {
  const response = await fetch(`${API_BASE_URL}/api/leaderboards/${category}/rank`, {
    credentials: 'include',
  })
  return handleResponse(response)
}

export async function getLeaderboardCategories() {
  const response = await fetch(`${API_BASE_URL}/api/leaderboards/categories`)
  const data = await handleResponse(response)
  return data.categories
}
