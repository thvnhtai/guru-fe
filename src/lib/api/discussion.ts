import type {
  Comment,
  CommentsResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
  Solution,
  SolutionsResponse,
  CreateSolutionRequest,
  SolutionVoteRequest,
  SolutionVoteResponse,
  CommentLikeResponse,
} from '@/types/discussion'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

async function handleResponse(response: Response) {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || `Error: ${response.status}`)
  }

  return data
}

// Comments API
export async function getComments(
  problemSlug: string,
  page: number = 1,
  limit: number = 20,
  sortBy: 'newest' | 'mostLiked' = 'newest'
): Promise<CommentsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), sortBy })
  const response = await fetch(`${API_BASE_URL}/api/problems/${problemSlug}/comments?${params}`)
  return handleResponse(response)
}

export async function createComment(
  problemSlug: string,
  payload: CreateCommentRequest
): Promise<Comment> {
  const response = await fetch(`${API_BASE_URL}/api/problems/${problemSlug}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return handleResponse(response)
}

export async function updateComment(
  commentId: string,
  payload: UpdateCommentRequest
): Promise<Comment> {
  const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return handleResponse(response)
}

export async function deleteComment(commentId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  return handleResponse(response)
}

export async function likeComment(commentId: string): Promise<CommentLikeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}/like`, {
    method: 'POST',
    credentials: 'include',
  })
  return handleResponse(response)
}

// Solutions API
export async function getSolutions(
  problemSlug: string,
  page: number = 1,
  limit: number = 10,
  sortBy: 'newest' | 'mostUpvoted' = 'newest'
): Promise<SolutionsResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), sortBy })
  const response = await fetch(`${API_BASE_URL}/api/problems/${problemSlug}/solutions?${params}`)
  return handleResponse(response)
}

export async function createSolution(
  problemSlug: string,
  payload: CreateSolutionRequest
): Promise<Solution> {
  const response = await fetch(`${API_BASE_URL}/api/problems/${problemSlug}/solutions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return handleResponse(response)
}

export async function voteSolution(
  solutionId: string,
  payload: SolutionVoteRequest
): Promise<SolutionVoteResponse> {
  const response = await fetch(`${API_BASE_URL}/api/solutions/${solutionId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  return handleResponse(response)
}
