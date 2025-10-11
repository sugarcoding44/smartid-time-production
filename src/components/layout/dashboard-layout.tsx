'use client'

import React, { useCallback, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/features/theme-toggle'
import { SmartIDLogo } from '@/components/ui/smartid-logo'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import '@/styles/sidebar-optimizations.css'
import {
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  UsersRound,
  CalendarDays,
  Hand,
  CreditCard,
  TrendingUp,
  ShoppingCart,
  Crown,
  LogOut,
  ChevronRight,
  Settings,
  BarChart3,
  Bell
} from 'lucide-react'

type NavigationItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  premium?: boolean
  category?: string
}

// Memoized navigation item to prevent unnecessary re-renders
const NavigationLink = React.memo(({ item, isActive }: { item: NavigationItem; isActive: boolean }) => {
  const IconComponent = item.icon
  
  return (
    <Link
      href={item.href}
      prefetch={true}
      className={`sidebar-nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors duration-75 group ${
        isActive
          ? 'bg-purple-600 text-white shadow-lg'
          : 'text-gray-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700/50'
      }`}
    >
      <IconComponent className={`sidebar-icon w-5 h-5 transition-colors duration-75 ${
        isActive 
          ? 'text-white' 
          : 'text-gray-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
      }`} />
      <span className="text-sm">{item.name}</span>
      {item.premium && !isActive && (
        <Crown className="w-3 h-3 text-yellow-500 ml-auto" />
      )}
      {isActive && (
        <ChevronRight className="w-4 h-4 text-white ml-auto" />
      )}
    </Link>
  )
})

NavigationLink.displayName = 'NavigationLink'

const navigationSections = {
  core: {
    title: 'Core Features',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'User Management', href: '/simple-users-v2', icon: Users },
    ] as NavigationItem[]
  },
  premium: {
    title: 'SmartID TIME (Premium)',
    items: [
      { name: 'Attendance', href: '/attendance-v2', icon: Clock, premium: true },
      { name: 'Leave Management', href: '/leave', icon: Calendar, premium: true },
      { name: 'Leave Types', href: '/leave-types', icon: Settings, premium: true },
      { name: 'Work Groups', href: '/work-groups', icon: UsersRound, premium: true },
      { name: 'Holidays', href: '/holidays', icon: CalendarDays, premium: true },
    ] as NavigationItem[]
  },
  biometric: {
    title: 'Biometric & Cards',
    items: [
      { name: 'Palm Management', href: '/dashboard/palm', icon: Hand },
      { name: 'smartID Card', href: '/smartid-cards', icon: CreditCard },
      { name: 'Order Cards', href: '/dashboard/order-cards', icon: ShoppingCart },
    ] as NavigationItem[]
  },
  analytics: {
    title: 'Analytics & Reports',
    items: [
      { name: 'Attendance Analytics', href: '/analytics', icon: BarChart3, premium: true },
      { name: 'System Analytics', href: '/dashboard/analytics', icon: TrendingUp },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Profile Settings', href: '/profile', icon: Settings },
    ] as NavigationItem[]
  }
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()

  // Memoize navigation sections for better performance
  const memoizedNavigationSections = useMemo(() => navigationSections, [])
  
  // Optimized click handler for navigation
  const handleNavClick = useCallback((href: string, event: React.MouseEvent) => {
    // Don't prevent default - let Next.js handle the navigation
    // The Link component already handles prefetching and client-side routing
  }, [])

  const handleSignOut = async () => {
    try {
      console.log('🔄 Starting logout process...')
      
      // Set a timeout for the logout process
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Logout timeout')), 5000)
      })
      
      const logoutPromise = supabase.auth.signOut()
      
      try {
        const result = await Promise.race([logoutPromise, timeoutPromise]) as { error: any } | undefined
        console.log('🚪 Supabase signOut result:', result)
        
        if (result?.error) {
          console.error('❌ Logout error:', result.error)
          toast.error(`Error signing out: ${result.error.message}`)
          // Still redirect even if there's an error
        } else {
          console.log('✅ Logout successful!')
          toast.success('Signed out successfully')
        }
      } catch (timeoutError) {
        console.warn('⏰ Logout timed out, proceeding with redirect anyway')
        toast.warning('Logout taking too long, redirecting...')
      }
      
      console.log('🧽 Clearing all auth cookies...')
      // Clear all auth-related cookies
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=')
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        if (name.includes('supabase') || name.includes('sb-')) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
        }
      })
      
      console.log('🚀 Redirecting to signin page...')
      // Add a small delay to ensure cookies are cleared
      setTimeout(() => {
        window.location.href = '/auth/signin'
      }, 500)
      
    } catch (error) {
      console.error('❌ Unexpected logout error:', error)
      toast.error('Redirecting to signin page...')
      // Force redirect even on error
      window.location.href = '/auth/signin'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-500">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl border-r border-gray-200 dark:bg-slate-800 dark:border-slate-700 hidden lg:flex lg:flex-col">
        {/* Logo */}
        <div className="flex items-center border-b border-gray-200 dark:border-slate-700 flex-shrink-0 relative py-8">
          <div className="w-full flex items-center justify-start px-4">
            <div className="transition-opacity duration-300 ease-out">
              <img 
                src="/logos/time-logo-light.svg" 
                alt="SmartID TIME" 
                className="h-14 w-auto dark:hidden"
              />
              <img 
                src="/logos/time-logo-dark.svg" 
                alt="SmartID TIME" 
                className="h-14 w-auto hidden dark:block"
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto min-h-0 sidebar-scroll">
          <div className="space-y-6 pb-4 sidebar-nav-container">
            {Object.entries(memoizedNavigationSections).map(([key, section]) => (
              <div key={key} className="space-y-2">
                {/* Section Title */}
                <div className="flex items-center gap-2 px-3 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                  {section.title.includes('Premium') && (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                </div>
                
                {/* Section Items */}
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    
                    return (
                      <li key={item.name}>
                        <NavigationLink item={item} isActive={isActive} />
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* User Profile & Sign Out */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-700">
          <div className="space-y-3">
            {/* Theme Toggle */}
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                A
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Admin User</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">School Administrator</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-extrabold">
              S
            </div>
            <span className="text-lg font-bold text-gray-900">SmartID Registry</span>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-2">
          <div className="flex gap-1 overflow-x-auto pb-2">
            {Object.values(memoizedNavigationSections).flatMap(section => section.items).map((item) => {
              const isActive = pathname === item.href
              const IconComponent = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-75 whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{item.name}</span>
                  {item.premium && (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
