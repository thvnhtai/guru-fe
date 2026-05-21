// Comment types
export interface CommentAuthor {
  id: string
  displayName: string
  email: string
}

export interface Comment {
  id: string
  authorId: string
  problemSlug: string
  content: string
  likes: number
  parentCommentId: string | null
  isEdited: boolean
  createdAt: string
  updatedAt: string
  author: CommentAuthor
  replies?: Comment[]
}

export interface CommentsResponse {
  comments: Comment[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CreateCommentRequest {
  content: string
  parentCommentId?: string
}

export interface UpdateCommentRequest {
  content: string
}

// Solution types
export interface Solution {
  id: string
  authorId: string
  problemSlug: string
  code: string
  language: string
  explanation: string | null
  upvotes: number
  views: number
  isApproved: boolean
  createdAt: string
  updatedAt: string
  author: CommentAuthor
}

export interface SolutionsResponse {
  solutions: Solution[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface CreateSolutionRequest {
  code: string
  language: string
  explanation?: string
}

export interface SolutionVoteRequest {
  voteType: 'upvote' | 'downvote'
}

export interface SolutionVoteResponse {
  voteAdded?: boolean
  voteChanged?: boolean
  voteRemoved?: boolean
  voteType?: 'upvote' | 'downvote'
  upvotes: number
}

// Comment like response
export interface CommentLikeResponse {
  liked: boolean
  likes: number
}
