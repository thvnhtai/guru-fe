import { apiResponse } from '@/lib/utils/auth'

export async function GET() {
  const categories = [
    { id: 'global', label: 'Global', description: 'All problems' },
    { id: 'python', label: 'Python', description: 'Python problems' },
    { id: 'javascript', label: 'JavaScript', description: 'JavaScript problems' },
    { id: 'java', label: 'Java', description: 'Java problems' },
    { id: 'cpp', label: 'C++', description: 'C++ problems' },
  ]

  return apiResponse({ categories })
}
