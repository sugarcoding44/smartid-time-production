import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | smartID',
  description: 'Learn about smartID\'s mission, vision, and commitment to digital transformation',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            About smartID
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're on a mission to transform how organizations manage attendance, payments, and digital identity through innovative technology solutions.
          </p>
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Our Story
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Founded with a vision to digitize traditional processes, smartID combines cutting-edge biometric technology with user-friendly software to create seamless experiences for schools, businesses, and enterprises.
          </p>
        </div>
      </div>
    </div>
  )
}