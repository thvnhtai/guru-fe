// User profile types
export interface UserProfile {
  id: string
  email: string
  displayName: string
  bio?: string
  avatarUrl?: string
  reputation: number
  isPublic: boolean
  followerCount: number
  followingCount: number
  createdAt: string
}

// Badge types
export type BadgeType = 'first_solution' | '10_solutions' | 'helpful_comment' | 'top_contributor'

export interface Badge {
  id: string
  userId: string
  badgeType: BadgeType
  earnedAt: string
}

export const BADGE_INFO: Record<BadgeType, { name: string; description: string; icon: string }> = {
  first_solution: {
    name: 'First Solution',
    description: 'Submitted your first code solution',
    icon: '🎯',
  },
  '10_solutions': {
    name: '10 Solutions',
    description: 'Solved 10 problems',
    icon: '🏅',
  },
  helpful_comment: {
    name: 'Helpful Comment',
    description: 'Comment received 5+ likes',
    icon: '💬',
  },
  top_contributor: {
    name: 'Top Contributor',
    description: 'Ranked in top 10 this month',
    icon: '⭐',
  },
}

// Leaderboard types
export type LeaderboardCategory = 'global' | 'python' | 'javascript' | 'java' | 'cpp'

export interface LeaderboardEntry {
  id: string
  userId: string
  displayName: string
  avatarUrl?: string
  rank: number
  score: number
  problemsSolved: number
  solutionsShared: number
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Follow types
export interface FollowUser {
  id: string
  displayName: string
  avatarUrl?: string
  bio?: string
  reputation: number
  isFollowing?: boolean
}

export interface FollowersResponse {
  followers: FollowUser[]
  pagination: {
    page: number
    limit: number
    total: number
  }
}

// User profile response
export interface UserProfileResponse extends UserProfile {
  badges: Badge[]
  isFollowing?: boolean
  isFollowedBy?: boolean
}

// Update profile request
export interface UpdateProfileRequest {
  bio?: string
  isPublic?: boolean
}
