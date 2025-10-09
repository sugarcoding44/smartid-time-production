import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation | smartID',
  description: 'Comprehensive guides and API documentation for smartID products',
}

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive guides, API documentation, and tutorials to help you get the most out of smartID products.
          </p>
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
            <span className="text-2xl">📚</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            We're working on comprehensive documentation. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  )
}