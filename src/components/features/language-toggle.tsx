'use client'

import { useState, useEffect } from 'react'
import type { Language } from '@/lib/translations'

const languages = [
  { code: 'en' as Language, name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'ms' as Language, name: 'Malay', native: 'Bahasa Malaysia', flag: '🇲🇾' },
  { code: 'zh' as Language, name: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'ta' as Language, name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' }
]

export function LanguageToggle() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0])
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load saved language or default to English
    const saved = localStorage.getItem('selectedLanguage') as Language
    if (saved) {
      const lang = languages.find(l => l.code === saved)
      if (lang) setSelectedLanguage(lang)
    }
  }, [])

  const handleLanguageChange = (language: typeof languages[0]) => {
    setSelectedLanguage(language)
    setIsOpen(false)
    if (mounted) {
      localStorage.setItem('selectedLanguage', language.code)
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('languageChange', { detail: language.code }))
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
        aria-label="Change language"
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
          </svg>
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
          {selectedLanguage.native}
        </span>
        <span className="text-lg hidden sm:block">{selectedLanguage.flag}</span>
        <svg className={`w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl backdrop-blur-xl overflow-hidden">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-3 py-2">
                Select Language
              </div>
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                    selectedLanguage.code === language.code
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-lg flex-shrink-0">{language.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{language.native}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{language.name}</div>
                  </div>
                  {selectedLanguage.code === language.code && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
