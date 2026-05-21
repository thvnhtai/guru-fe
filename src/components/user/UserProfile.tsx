'use client'

import Link from 'next/link'
import { useUserProfile } from '@/lib/hooks/useUserProfile'
import { BADGE_INFO } from '@/types/user'
import { useUserStore } from '@/stores/userStore'

interface UserProfileProps {
  userId: string
}

export function UserProfile({ userId }: UserProfileProps) {
  const { profile, badges, loading, error, isFollowing, handleToggleFollow } = useUserProfile(userId)
  const currentUser = useUserStore((state) => state.user)
  const isOwnProfile = currentUser?.id === userId

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>
  }

  if (error || !profile) {
    return <div className="p-8 text-center text-red-600">{error || 'Profile not found'}</div>
  }

  if (!profile.isPublic && !isOwnProfile) {
    return <div className="p-8 text-center text-gray-500">This profile is private</div>
  }

  const initials = profile.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold">
            {initials}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile.displayName}</h1>
            {profile.bio && <p className="text-gray-600 mt-2">{profile.bio}</p>}
            <p className="text-sm text-gray-500 mt-2">Joined {new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Follow button */}
        {!isOwnProfile && currentUser && (
          <button
            onClick={handleToggleFollow}
            className={`px-4 py-2 rounded font-medium ${
              isFollowing
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{profile.reputation}</p>
          <p className="text-sm text-gray-600">Reputation</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{profile.followerCount}</p>
          <p className="text-sm text-gray-600">Followers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{profile.followingCount}</p>
          <p className="text-sm text-gray-600">Following</p>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Badges ({badges.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => {
              const info = BADGE_INFO[badge.badgeType as keyof typeof BADGE_INFO]
              return (
                <div
                  key={badge.id}
                  className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 text-center hover:shadow-md transition"
                >
                  <div className="text-4xl mb-2">{info.icon}</div>
                  <p className="font-semibold text-sm">{info.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{info.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Links */}
      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <Link
          href={`/users/${userId}/followers`}
          className="text-blue-600 hover:underline text-sm"
        >
          View Followers
        </Link>
        <Link
          href={`/users/${userId}/following`}
          className="text-blue-600 hover:underline text-sm"
        >
          View Following
        </Link>
      </div>
    </div>
  )
}
