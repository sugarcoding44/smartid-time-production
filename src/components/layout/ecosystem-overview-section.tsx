'use client'

import React from 'react'

export function EcosystemOverviewSection() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-gray-900 dark:to-indigo-950/40 overflow-hidden transition-colors duration-300">
      {/* Background decorations */}
      <div className="absolute top-10 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/15 via-indigo-500/15 to-purple-600/15 dark:from-blue-400/10 dark:via-indigo-500/10 dark:to-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-emerald-400/15 via-teal-500/15 to-green-600/15 dark:from-emerald-400/10 dark:via-teal-500/10 dark:to-green-600/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm mb-6">
            <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Flexible Implementation Options</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            Choose Your <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Path</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Two powerful systems designed to work independently or together. Build the solution that fits your institution's exact needs.
          </p>
        </div>

        {/* Implementation Options */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* TIME Only */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-indigo-500/20 to-purple-600/20 rounded-3xl transform rotate-1 scale-105 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg"></div>
            <div className="relative bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-slate-700/60 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-3xl">🏫</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">smartID TIME</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Complete School Management</p>
                
                <div className="space-y-3 text-sm text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Student & Staff Enrollment</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Academic Records</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 dark:text-amber-400 text-xs">★</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">Premium: Advanced Attendance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-xs">+</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">Optional: Device Integration</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* POS Only */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-green-500/20 to-teal-600/20 rounded-3xl transform -rotate-1 scale-105 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg"></div>
            <div className="relative bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-slate-700/60 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-3xl">🏪</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">smartID POS</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Complete POS System</p>
                
                <div className="space-y-3 text-sm text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">F&B Operations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Inventory Management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Multiple Payment Methods</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-xs">+</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">Optional: Device Integration</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Solution */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-500/20 to-red-600/20 rounded-3xl transform rotate-0.5 scale-105 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg"></div>
            <div className="relative bg-white/80 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-slate-700/60 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-3xl">🔗</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Full Integration</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Complete Ecosystem</p>
                
                <div className="space-y-3 text-sm text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">TIME + POS Combined</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Seamless Data Flow</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Unified User Experience</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">★</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Maximum Efficiency</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Device Integration */}
        <div className="relative bg-gradient-to-br from-white to-blue-50/80 dark:from-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl rounded-3xl p-12 border border-gray-200/40 dark:border-slate-600/60 shadow-2xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-slate-600/60 shadow-sm mb-6">
              <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Optional Hardware</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Unlock <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">Contactless</span> Experiences
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Choose either smartID Palm, smartID Card, or both devices to unlock advanced biometric and NFC capabilities across your TIME and POS systems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* smartID Palm */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-500/20 to-red-600/20 rounded-2xl transform rotate-1 scale-105 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg"></div>
              <div className="relative text-center p-8 bg-white dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-slate-600/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23,11H21V9A4,4 0 0,0 17,5H15V4A2,2 0 0,0 13,2H11A2,2 0 0,0 9,4V5H7A4,4 0 0,0 3,9V11H1A1,1 0 0,0 0,12V20A2,2 0 0,0 2,22H22A2,2 0 0,0 24,20V12A1,1 0 0,0 23,11M11,4H13V11H11V4M5,9A2,2 0 0,1 7,7H9V11H5V9M19,11H15V7H17A2,2 0 0,1 19,9V11Z" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">smartID Palm</h4>
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Contactless attendance marking (TIME)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Secure access control</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Palm payment processing (POS)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">★</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">99.9% recognition accuracy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* smartID Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-indigo-500/20 to-purple-600/20 rounded-2xl transform -rotate-1 scale-105 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-lg"></div>
              <div className="relative text-center p-8 bg-white dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-slate-600/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="6" width="20" height="12" rx="2" ry="2" />
                    <path d="M2 10h20" />
                    <path d="M6 14h4" />
                    <path d="M14 14h4" />
                    <circle cx="18" cy="17" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">smartID Card</h4>
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">NFC-enabled attendance (TIME)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Encrypted & secure technology</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-xs">✓</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">NFC payment processing (POS)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">★</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Cannot be duplicated or cloned</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}