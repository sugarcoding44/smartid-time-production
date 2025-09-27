'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { translations, type Language, type TranslationKey, getTranslation } from '@/lib/translations'

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load saved language or default to English
    const saved = localStorage.getItem('selectedLanguage') as Language
    if (saved && translations[saved]) {
      setLanguage(saved)
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('selectedLanguage', language)
    }
  }, [language, mounted])

  useEffect(() => {
    // Listen for language change events from the language toggle
    const handleLanguageChange = (event: CustomEvent<Language>) => {
      setLanguage(event.detail)
    }

    window.addEventListener('languageChange', handleLanguageChange as EventListener)
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange as EventListener)
    }
  }, [])

  const t = (key: TranslationKey): string => {
    return getTranslation(language, key)
  }

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />
  }

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}
