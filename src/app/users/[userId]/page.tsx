'use client'

import { UserProfile } from '@/components/user/UserProfile'

interface UserPageProps {
  params: Promise<{ userId: string }>
}

export default async function UserPage({ params }: UserPageProps) {
  const { userId } = await params

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <UserProfile userId={userId} />
    </div>
  )
}
