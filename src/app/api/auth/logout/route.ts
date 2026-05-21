import { apiResponse } from '@/lib/utils/auth'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    // Clear the access token cookie
    const cookieStore = await cookies()
    cookieStore.delete('accessToken')

    return apiResponse({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return apiResponse({ message: 'Logged out' })
  }
}
