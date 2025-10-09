import React from 'react'
import { Metadata } from 'next'
import { Header } from '@/components/layout/header'

export const metadata: Metadata = {
  title: 'Case Studies | smartID',
  description: 'Success stories and case studies from smartID customers',
}

export default function CaseStudiesPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
              Case Studies
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover how organizations worldwide are transforming their operations with smartID solutions.
            </p>
          </div>

          <div className="mt-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We're preparing detailed case studies showcasing real-world implementations and success stories.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}