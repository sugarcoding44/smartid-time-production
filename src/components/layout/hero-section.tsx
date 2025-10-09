import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/contexts/translation-context'

const dashboardExamples = [
  {
    title: 'smartID TIME',
    subtitle: 'SMK Bukit Jelutong',
    icon: '👥',
    color: 'from-blue-500 via-indigo-600 to-purple-600',
    deviceType: 'desktop',
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
    icon: '🏦',
    color: 'from-emerald-500 via-green-600 to-teal-600',
    deviceType: 'tablet',
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
    deviceType: 'phone',
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
  // Updated with Alipay+ style design
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
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 pt-20 pb-16 overflow-hidden">
      {/* Alipay+ Style Background Decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.08),transparent_50%)]" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-br from-blue-400/15 via-indigo-500/15 to-purple-600/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 via-blue-500/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
        <div className="space-y-12">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
              <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-sm"></span>
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">{t('completeEcosystem')}</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] text-gray-900 dark:text-white">
              {t('modernSmartID').split(' ')[0]}{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
                SmartID
              </span>
              <br />
              <span className="text-4xl lg:text-5xl text-gray-600 dark:text-gray-300 font-bold">
                {t('forSchools')}
              </span>
            </h1>
          </div>
          
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
            {t('heroDescription')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-600/5"></div>
              <div className="relative p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-white text-2xl">👥</span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('hub')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('schoolManagementSystem')}</div>
              </div>
            </div>
            <div className="group relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-600/5"></div>
              <div className="relative p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-white text-2xl">🏪</span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('pos')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('pointOfSale')}</div>
              </div>
            </div>
            <div className="group relative overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-600/5"></div>
              <div className="relative p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-white text-2xl">💳</span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('pay')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('mobileEWallet')}</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <Button size="lg" asChild className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-500 px-10 py-6 text-lg font-semibold rounded-2xl">
              <Link href="/auth/signup" className="relative z-10">
                <span className="flex items-center gap-2">
                  {t('accessSmartIDTIME')}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="group relative overflow-hidden border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 bg-white/80 dark:bg-gray-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/30 backdrop-blur-sm transition-all duration-500 px-10 py-6 text-lg font-semibold rounded-2xl">
              <Link href="#features" className="relative z-10 text-blue-700 dark:text-blue-300">
                <span className="flex items-center gap-2">
                  {t('seeFeatures')}
                  <svg className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-6 pt-8">
            <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-600/5"></div>
              <div className="relative">
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-2">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium">{t('schools')}</div>
              </div>
            </div>
            <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-green-600/5"></div>
              <div className="relative">
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-2">250K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium">{t('users')}</div>
              </div>
            </div>
            <div className="group relative overflow-hidden bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-600/5"></div>
              <div className="relative">
                <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mb-2">99.9%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-medium">{t('uptime')}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative">
          {/* Main dashboard mockup */}
          <div className="relative w-full max-w-lg mx-auto">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl hover:shadow-3xl overflow-hidden transition-all duration-1000 hover:scale-105">
            
              {/* Header */}
              <div className={`bg-gradient-to-r ${currentDash.color} p-8 text-white transition-all duration-1000 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{currentDash.title}</h3>
                    <p className="text-white/90 text-sm font-medium">{currentDash.subtitle}</p>
                  </div>
                  <div className="w-16 h-16 bg-white/25 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-3xl">{currentDash.icon}</span>
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
            <div className="flex justify-center gap-3 mt-8">
              {dashboardExamples.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentExample(index)}
                  className={`relative w-4 h-4 rounded-full transition-all duration-500 group ${
                    index === currentExample 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125 shadow-lg' 
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-400 dark:hover:bg-blue-500 hover:scale-110'
                  }`}
                  aria-label={`Switch to ${dashboardExamples[index].title}`}
                >
                  {index === currentExample && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-75"></div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Enhanced Floating elements */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce hover:scale-110 transition-transform cursor-pointer">
              <span className="text-white text-2xl">⚙️</span>
            </div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer">
              <span className="text-white text-lg">🚀</span>
            </div>
            <div className="absolute top-1/2 -right-4 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse hover:scale-110 transition-transform cursor-pointer">
              <span className="text-white text-lg">⚡</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
