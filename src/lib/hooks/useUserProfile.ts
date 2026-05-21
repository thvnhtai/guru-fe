'use client'

import { useState, useEffect } from 'react'
import type { UserProfile, Badge } from '@/types/user'
import { getUserProfile, getUserBadges, toggleFollow } from '@/lib/api/users'
import { useUserStore } from '@/stores/userStore'

export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const currentUser = useUserStore((state) => state.user)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getUserProfile(userId)
        setProfile(data)

        // Fetch badges
        try {
          const badgesData = await getUserBadges(userId)
          setBadges(badgesData)
        } catch (err) {
          console.warn('Failed to fetch badges:', err)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  const handleToggleFollow = async () => {
    if (!currentUser || userId === currentUser.id) return
    try {
      const result = await toggleFollow(userId)
      setIsFollowing(result.following)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle follow')
    }
  }

  return {
    profile,
    badges,
    loading,
    error,
    isFollowing,
    handleToggleFollow,
  }
}
