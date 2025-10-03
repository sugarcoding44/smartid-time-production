import React from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/features/theme-toggle'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6 transition-colors duration-300">
      {/* Theme Toggle and Return Button */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <Link 
          href="/" 
          className="px-4 py-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-xl border border-gray-200/20 dark:border-gray-700/20 text-gray-700 dark:text-gray-300 hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-200 text-sm font-medium"
        >
          ← Back to Website
        </Link>
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white transition-colors">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-lg">
              s
            </div>
            smartID TIME
          </Link>
        </div>

        {/* Auth Card */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h1>
            <p className="text-gray-600 dark:text-gray-300">{subtitle}</p>
          </div>

          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; 2025 smartID TIME. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
