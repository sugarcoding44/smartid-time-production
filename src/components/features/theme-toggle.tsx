'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/theme-context'

export function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={`
        relative overflow-hidden transition-all duration-300 hover:scale-105
        ${isDark 
          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/20 hover:bg-yellow-500/30' 
          : 'bg-indigo-500/20 text-indigo-600 border border-indigo-200 hover:bg-indigo-500/30'
        }
      `}
    >
      <div className="flex items-center gap-2">
        <div className={`transition-transform duration-500 ${isDark ? 'rotate-180' : 'rotate-0'}`}>
          {isDark ? '🌙' : '☀️'}
        </div>
        <span className="text-sm font-medium">
          {isDark ? 'Dark' : 'Light'}
        </span>
      </div>
      
      {/* Animated background */}
      <div className={`
        absolute inset-0 -z-10 transition-all duration-500
        ${isDark 
          ? 'bg-gradient-to-r from-indigo-900/20 via-purple-900/20 to-pink-900/20' 
          : 'bg-gradient-to-r from-blue-100/50 via-indigo-100/50 to-purple-100/50'
        }
      `} />
    </Button>
  )
}
