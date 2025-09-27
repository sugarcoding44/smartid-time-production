'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/features/theme-toggle'
import { LanguageToggle } from '@/components/features/language-toggle'
import { useTranslation } from '@/contexts/translation-context'

export function Header() {
  const { t } = useTranslation()
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-800/20 z-50">
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white transition-colors">
          <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-lg">
            S
          </div>
          <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
            smartID
          </span>
        </Link>
        
        <ul className="hidden md:flex items-center gap-8 text-gray-600 dark:text-gray-300 font-medium">
          <li>
            <Link href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
              {t('features')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link href="#how-it-works" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
              {t('howItWorks')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
              {t('pricing')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
          <li>
            <Link href="#support" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group">
              {t('support')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </li>
        </ul>
        
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <Link href="/auth">{t('hubPortal')}</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <Link href="/pos/signin">{t('posPortal')}</Link>
            </Button>
          </div>
          <Button asChild className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <Link href="/auth">{t('startFree')}</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
