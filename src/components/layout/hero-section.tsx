import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/contexts/translation-context'

const dashboardExamples = [
  {
    title: 'smartID HUB',
    subtitle: 'SMK Bukit Jelutong',
    icon: '👥',
    color: 'from-blue-500 via-indigo-600 to-purple-600',
    stats: [
      { value: '1,247', label: 'Total Users', color: 'green' },
      { value: '98.5%', label: 'Present Today', color: 'blue' }
    ],
    activities: [
      {
        icon: '👤',
        text: 'New user added: Sarah Tan',
        time: '1 minute ago',
        color: 'from-green-400 to-emerald-500'
      },
      {
        icon: '🖐️',
        text: 'Ahmad enrolled in Palm ID',
        time: '3 minutes ago',
        color: 'from-blue-400 to-indigo-500'
      },
      {
        icon: '📅',
        text: 'Siti requesting Annual Leave',
        time: '5 minutes ago',
        color: 'from-purple-400 to-pink-500'
      },
      {
        icon: '✅',
        text: 'Ali checked in with Palm - 08:15 AM',
        time: '7 minutes ago',
        color: 'from-orange-400 to-red-500'
      }
    ]
  },
  {
    title: 'smartID POS',
    subtitle: 'Cafeteria Management',
    icon: '🏪',
    color: 'from-emerald-500 via-green-600 to-teal-600',
    stats: [
      { value: 'RM 2,450', label: 'Today Sales', color: 'emerald' },
      { value: '156', label: 'Orders Today', color: 'blue' }
    ],
    isPOS: true,
    menuItems: [
      { name: 'Chicken Rice', price: 'RM 6.50', emoji: '🍚', selected: false },
      { name: 'Nasi Lemak', price: 'RM 5.00', emoji: '🍛', selected: true },
      { name: 'Milo Ice', price: 'RM 2.50', emoji: '🥤', selected: true },
      { name: 'Roti Canai', price: 'RM 2.00', emoji: '🥖', selected: false }
    ],
    cartItems: [
      { name: 'Nasi Lemak', price: 'RM 5.00', qty: 1 },
      { name: 'Milo Ice', price: 'RM 2.50', qty: 1 }
    ],
    cartTotal: 'RM 7.50',
    activities: [
      {
        icon: '🔍',
        text: 'Searching menu...',
        time: 'Customer browsing',
        color: 'from-blue-400 to-indigo-500'
      },
      {
        icon: '🍛',
        text: 'Nasi Lemak added',
        time: 'RM 5.00',
        color: 'from-emerald-400 to-green-500'
      },
      {
        icon: '🥤',
        text: 'Milo Ice added',
        time: 'RM 2.50',
        color: 'from-emerald-400 to-green-500'
      },
      {
        icon: '🖐️',
        text: 'Pay with Palm ID',
        time: 'Total: RM 7.50',
        color: 'from-purple-400 to-pink-500'
      }
    ]
  },
  {
    title: 'smartID PAY',
    subtitle: 'Mobile e-Wallet',
    icon: '💳',
    color: 'from-purple-500 via-pink-500 to-red-600',
    stats: [
      { value: 'RM 850.00', label: 'Wallet Balance', color: 'purple' },
      { value: '45', label: 'Transactions', color: 'orange' }
    ],
    activities: [
      {
        icon: '↗️',
        text: 'Top up: RM 200.00',
        time: '2 hours ago',
        color: 'from-green-400 to-emerald-500'
      },
      {
        icon: '🏪',
        text: 'Cafeteria purchase: RM 12.50',
        time: '4 hours ago',
        color: 'from-purple-400 to-pink-500'
      }
    ]
  }
]

export function HeroSection() {
  const { t } = useTranslation()
  const [currentExample, setCurrentExample] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample(prev => (prev + 1) % dashboardExamples.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const currentDash = dashboardExamples[currentExample]
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950/30 pt-20 pb-16 overflow-hidden">
      {/* Modern background decorations */}
      <div className="absolute inset-0 bg-[linear-gradient(40deg,transparent_40%,rgba(99,102,241,0.08)_50%,transparent_60%)] dark:bg-[linear-gradient(40deg,transparent_40%,rgba(99,102,241,0.05)_50%,transparent_60%)]" />
      <div className="absolute top-20 -right-32 w-96 h-96 bg-gradient-to-br from-blue-400/20 via-indigo-500/20 to-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 via-purple-500/20 to-pink-600/20 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <span className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('completeEcosystem')}</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] text-gray-900 dark:text-white">
              {t('modernSmartID').split(' ')[0]}{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SmartID
              </span>
              <br />
              <span className="text-4xl lg:text-5xl text-gray-600 dark:text-gray-300 font-semibold">
                {t('forSchools')}
              </span>
            </h1>
          </div>
          
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed font-light">
            {t('heroDescription')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-10 max-w-2xl mx-auto">
            <div className="group relative p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-xl">👥</span>
              </div>
              <div className="text-base font-bold text-gray-900 dark:text-white">{t('hub')}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('schoolManagementSystem')}</div>
            </div>
            <div className="group relative p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-xl">🏪</span>
              </div>
              <div className="text-base font-bold text-gray-900 dark:text-white">{t('pos')}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('pointOfSale')}</div>
            </div>
            <div className="group relative p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-xl">💳</span>
              </div>
              <div className="text-base font-bold text-gray-900 dark:text-white">{t('pay')}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('mobileEWallet')}</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg">
              <Link href="/auth/signup">{t('accessSmartIDHUB')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all duration-300 px-8 py-4 text-lg">
              <Link href="#features">{t('seeFeatures')}</Link>
            </Button>
          </div>
          
          <div className="flex items-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">500+</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('schools')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">250K+</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('users')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">99.9%</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('uptime')}</div>
            </div>
          </div>
        </div>
        
        <div className="relative">
          {/* Main dashboard mockup */}
          <div className="relative w-full max-w-lg mx-auto">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden transition-all duration-1000">
              {/* Header */}
              <div className={`bg-gradient-to-r ${currentDash.color} p-6 text-white transition-all duration-1000`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{currentDash.title}</h3>
                    <p className="text-white/80 text-sm">{currentDash.subtitle}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">{currentDash.icon}</span>
                  </div>
                </div>
              </div>
              
              {/* Content - POS vs Dashboard */}
              <div className="p-6 space-y-4">
                {currentDash.isPOS ? (
                  /* POS Interface */
                  <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Search menu items..." 
                        className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                        readOnly
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-gray-400">🔍</span>
                      </div>
                    </div>

                    {/* Menu Categories */}
                    <div className="flex gap-2 overflow-x-auto">
                      {['All Items', 'Main Dishes', 'Beverages', 'Snacks'].map((category, idx) => (
                        <button key={idx} className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                          idx === 0 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}>
                          {category}
                        </button>
                      ))}
                    </div>

                    {/* Menu Items Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {currentDash.menuItems?.map((item, idx) => (
                        <div key={idx} className={`relative p-3 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                          item.selected 
                            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' 
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-emerald-300'
                        }`}>
                          <div className="text-center">
                            <div className="text-2xl mb-1">{item.emoji}</div>
                            <div className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.name}</div>
                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.price}</div>
                          </div>
                          {item.selected && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Cart Summary */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Current Order</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400"># Order #SF2024-1247</span>
                      </div>
                      
                      <div className="space-y-2">
                        {currentDash.cartItems?.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-gray-700 dark:text-gray-300">{item.qty}x {item.name}</span>
                            <span className="text-gray-900 dark:text-white font-medium">{item.price}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">Total:</span>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{currentDash.cartTotal}</span>
                          </div>
                        </div>
                        
                        <button className="w-full mt-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-green-700 transition-all duration-200">
                          🖐️ Pay with Palm ID
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Regular Dashboard */
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {currentDash.stats.map((stat, index) => {
                        const colorClasses: Record<string, string> = {
                          green: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
                          blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
                          emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
                          orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
                          purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400'
                        }
                        const bgColor = colorClasses[stat.color] || colorClasses.blue
                        return (
                          <div key={index} className={`${bgColor.split(' ').slice(0, 2).join(' ')} p-4 rounded-2xl transition-all duration-1000`}>
                            <div className={`text-2xl font-bold ${bgColor.split(' ').slice(2, 4).join(' ')}`}>{stat.value}</div>
                            <div className={`text-sm ${bgColor.split(' ').slice(2, 4).join(' ')} opacity-80`}>{stat.label}</div>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Recent activity */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h4>
                      <div className="space-y-2">
                        {currentDash.activities.map((activity, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl transition-all duration-1000 opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]" style={{animationDelay: `${index * 0.2}s`}}>
                            <div className={`w-8 h-8 bg-gradient-to-br ${activity.color} rounded-lg flex items-center justify-center`}>
                              <span className="text-white text-sm">{activity.icon}</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{activity.text}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Dashboard Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {dashboardExamples.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentExample(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentExample 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125' 
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Switch to ${dashboardExamples[index].title}`}
                />
              ))}
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
              <span className="text-white text-xl">⚙️</span>
            </div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-sm">🚀</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
