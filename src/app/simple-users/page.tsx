'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SimpleUsersPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Client-side redirect - no page refresh
    router.replace('/simple-users-v2')
  }, [router])
  
  // Show loading spinner while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  )
}
