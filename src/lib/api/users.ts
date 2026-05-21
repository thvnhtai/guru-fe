import type { UserProfile, UpdateProfileRequest, Badge } from '@/types/user'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

async function handleResponse(response: Response) {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || `Error: ${response.status}`)
  }
  return data
}

// User Profile API
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`)
  return handleResponse(response)
}

export async function updateProfile(
  payload: UpdateProfileRequest
): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/api/users/me/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return handleResponse(response)
}

export async function getUserBadges(userId: string): Promise<Badge[]> {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/badges`)
  const data = await handleResponse(response)
  return data.badges
}

// Following API
export async function toggleFollow(userId: string): Promise<{ following: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/follow`, {
    method: 'POST',
    credentials: 'include',
  })
  return handleResponse(response)
}

export async function getFollowers(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/followers?${params}`)
  return handleResponse(response)
}

export async function getFollowing(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/following?${params}`)
  return handleResponse(response)
}

// Stats API (for dashboard)
export async function getUserStats() {
  const response = await fetch(`${API_BASE_URL}/api/users/me/stats`, {
    credentials: 'include',
  })
  return handleResponse(response)
}
