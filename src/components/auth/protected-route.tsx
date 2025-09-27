'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  requirePremium?: boolean
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  requirePremium = false 
}: ProtectedRouteProps) {
  const { user, profile, loading, hasRole, hasPremiumAccess } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth')
        return
      }

      if (user && !profile) {
        // User exists but no profile - needs email verification
        router.push('/auth/confirm-email')
        return
      }

      if (requiredRoles.length > 0 && !hasRole(requiredRoles as any)) {
        router.push('/unauthorized')
        return
      }

      if (requirePremium && !hasPremiumAccess()) {
        router.push('/upgrade')
        return
      }
    }
  }, [user, profile, loading, router, requiredRoles, requirePremium, hasRole, hasPremiumAccess])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || (user && !profile)) {
    return null
  }

  if (requiredRoles.length > 0 && !hasRole(requiredRoles as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-300">
            You don't have the required permissions to access this page.
          </p>
        </div>
      </div>
    )
  }

  if (requirePremium && !hasPremiumAccess()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Premium Feature</h1>
          <p className="text-gray-600 dark:text-gray-300">
            This feature requires a premium subscription.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
