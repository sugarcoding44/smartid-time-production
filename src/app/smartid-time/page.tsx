'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { 
  Users, 
  GraduationCap,
  Clock,
  BarChart3,
  CheckCircle,
  Star,
  ArrowRight,
  PlayCircle,
  Sparkles,
  Shield,
  Zap,
  Phone,
  Calendar,
  Bell,
  FileText,
  Settings,
  UserCheck,
  TrendingUp
} from 'lucide-react'

export default function SmartIDTIMEPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [currentView, setCurrentView] = useState(0) // 0 = PC, 1 = Mobile
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView(prev => (prev + 1) % 2)
    }, 4000)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-40 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-40 animate-pulse animation-delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-300 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
                    smartID TIME
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Complete school management system with <span className="font-semibold text-indigo-600 dark:text-indigo-400">free basic plan</span> - 
                  Advanced features and biometric integration available with premium plans.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-8">
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <CheckCircle className="w-4 h-4 mr-2" />
                Free Basic Plan
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                <CheckCircle className="w-4 h-4 mr-2" />
                Premium Features Available
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                <CheckCircle className="w-4 h-4 mr-2" />
                Biometric Device Integration
              </Badge>
            </div>
            
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4" asChild>
                  <Link href="/register">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Start with Free Plan
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:border-indigo-400 dark:text-indigo-400 px-8 py-4">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>
            
            {/* Right Mockup - Automatic Alternating Animation */}
            <div className="relative">
              <div className="relative w-full max-w-2xl mx-auto">
                {currentView === 0 ? (
                  /* PC/Desktop Mockup */
                  <div className="relative w-full mx-auto transition-all duration-1000">
                    {/* Monitor */}
                    <div className="bg-gray-800 dark:bg-gray-900 rounded-t-2xl p-6 shadow-2xl">
                      {/* Screen */}
                      <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-inner transition-colors duration-300" style={{aspectRatio: '16/10'}}>
                        {/* Browser chrome */}
                        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="flex-1 bg-white dark:bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-600 dark:text-gray-300 transition-colors duration-300">
                              https://smartid.com/time/admin
                            </div>
                          </div>
                        </div>
                        
                        {/* App content */}
                        <div className="p-4 h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
                          {/* Header */}
                          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-lg p-4 mb-4 text-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-bold">smartID TIME Admin</h3>
                                <p className="text-white/80 text-sm">School Management Dashboard</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold">1,247</div>
                                <div className="text-sm text-white/80">Students</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Stats cards */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                              <div className="text-center">
                                <div className="text-xl font-bold text-green-600 dark:text-green-400">98.5%</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Attendance</div>
                              </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                              <div className="text-center">
                                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">45</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Enrollments</div>
                              </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                              <div className="text-center">
                                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">12</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Leave Requests</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Recent activity */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Admin Activity</h4>
                            <div className="space-y-2">
                              {[
                                { icon: '👤', text: 'Sarah enrolled', time: '1m ago', color: 'text-green-600 dark:text-green-400' },
                                { icon: '🖐️', text: 'Palm enrollment approved', time: '3m ago', color: 'text-blue-600 dark:text-blue-400' },
                                { icon: '📅', text: 'Leave request processed', time: '5m ago', color: 'text-purple-600 dark:text-purple-400' }
                              ].map((activity, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors duration-200">
                                  <div className="w-6 h-6 flex items-center justify-center">
                                    <span className="text-sm">{activity.icon}</span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm text-gray-900 dark:text-white">{activity.text}</div>
                                    <div className={`text-xs ${activity.color}`}>{activity.time}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200">
                                Manage Students
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Monitor base */}
                    <div className="bg-gray-700 dark:bg-gray-800 h-8 rounded-b-lg shadow-lg transition-colors duration-300"></div>
                    <div className="bg-gray-600 dark:bg-gray-700 h-12 w-32 mx-auto rounded-b-xl shadow-md transition-colors duration-300"></div>
                  </div>
                ) : (
                  /* Mobile App Mockup */
                  <div className="relative mx-auto transition-all duration-1000" style={{width: '300px', height: '600px'}}>
                    {/* Phone frame */}
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black rounded-[3rem] p-2 shadow-2xl">
                      {/* Screen */}
                      <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden relative transition-colors duration-300">
                        {/* Status bar */}
                        <div className="flex justify-between items-center px-6 py-2 text-gray-900 dark:text-white text-sm transition-colors duration-300">
                          <span>9:41</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs">•••</span>
                            <span className="text-xs">📶</span>
                            <span className="text-xs">🔋</span>
                          </div>
                        </div>
                        
                        {/* App content */}
                        <div className="px-4 pb-4 h-full">
                          {/* Header */}
                          <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-2xl p-4 mb-4">
                            <div className="flex items-center justify-between text-white">
                              <div>
                                <h3 className="text-lg font-bold">smartID TIME Mobile</h3>
                                <p className="text-white/80 text-sm">Student Portal</p>
                              </div>
                              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <span className="text-xl">🎓</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Quick actions */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-blue-100 dark:bg-blue-500/10 p-3 rounded-xl border border-blue-200 dark:border-blue-500/30 text-center">
                              <div className="text-2xl mb-1">🖐️</div>
                              <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Palm Enrollment</span>
                            </div>
                            <div className="bg-purple-100 dark:bg-purple-500/10 p-3 rounded-xl border border-purple-200 dark:border-purple-500/30 text-center">
                              <div className="text-2xl mb-1">🎩</div>
                              <span className="text-xs font-medium text-purple-700 dark:text-purple-400">Card Enrollment</span>
                            </div>
                          </div>
                          
                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-green-100 dark:bg-green-500/10 p-3 rounded-xl border border-green-200 dark:border-green-500/30">
                              <div className="text-lg font-bold text-green-700 dark:text-green-400">95.2%</div>
                              <div className="text-xs text-green-600 dark:text-green-500">Attendance Rate</div>
                            </div>
                            <div className="bg-orange-100 dark:bg-orange-500/10 p-3 rounded-xl border border-orange-200 dark:border-orange-500/30">
                              <div className="text-lg font-bold text-orange-700 dark:text-orange-400">2</div>
                              <div className="text-xs text-orange-600 dark:text-orange-500">Pending Requests</div>
                            </div>
                          </div>
                          
                          {/* Recent activities */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">My Activities</h4>
                            <div className="space-y-2">
                              {[
                                { icon: '✅', text: 'Check-in successful', time: 'Today 8:15 AM' },
                                { icon: '📅', text: 'Leave request submitted', time: 'Yesterday' },
                                { icon: '🖐️', text: 'Palm ID enrolled', time: '2 days ago' }
                              ].map((activity, index) => (
                                <div key={index} className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs">{activity.icon}</span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-xs font-medium text-gray-900 dark:text-white">{activity.text}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Indicator dots */}
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentView(0)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentView === 0 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 scale-125' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                    aria-label="Switch to Desktop View"
                  />
                  <button
                    onClick={() => setCurrentView(1)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentView === 1 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 scale-125' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                    aria-label="Switch to Mobile View"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Software Subscription Plans */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Software Subscription
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Choose Your
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"> TIME </span>
              Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Start with our free basic plan or upgrade to premium for advanced features and biometric integration.
            </p>
            
            {/* Monthly/Yearly Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center">
                  <button
                    onClick={() => setIsAnnual(false)}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      !isAnnual
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setIsAnnual(true)}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 relative ${
                      isAnnual
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Yearly
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Basic Plan - Featured */}
            <Card className="border-0 shadow-xl relative scale-105 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-2 border-blue-200 dark:border-blue-700">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 text-sm font-semibold shadow-lg">
                  🎉 FREE FOREVER
                </Badge>
              </div>
              <CardHeader className="text-center pt-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">Basic</CardTitle>
                <CardDescription className="text-lg">Essential school management</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">FREE</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Forever • No credit card</p>
                </div>
                
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-500" />
                    <span>Student enrollment & records</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-500" />
                    <span>Staff management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-500" />
                    <span>Basic reporting</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-500" />
                    <span>Parent communication</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-500" />
                    <span>Up to 100 students</span>
                  </li>
                </ul>
                
                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg text-lg py-3" asChild>
                  <Link href="/register">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Start Free
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-0 shadow-lg relative hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription className="text-lg">Advanced features & analytics</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    RM {isAnnual ? '80' : '100'}
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    per {isAnnual ? 'month (billed yearly)' : 'month'}
                  </p>
                  {isAnnual && (
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                      Save RM 240/year!
                    </p>
                  )}
                </div>
                
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-indigo-500" />
                    <span>All Basic features</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-indigo-500" />
                    <span>Advanced attendance tracking</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-indigo-500" />
                    <span>Leave request management</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-indigo-500" />
                    <span>Employee working hours</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-indigo-500" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-indigo-500" />
                    <span>Unlimited students</span>
                  </li>
                </ul>
                
                <div className="space-y-2">
                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700" asChild>
                    <Link href="/register">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Upgrade to Premium
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-0 shadow-lg relative hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription className="text-lg">Full ecosystem + devices</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    RM {isAnnual ? '200' : '250'}
                  </span>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    per {isAnnual ? 'month (billed yearly)' : 'month'}
                  </p>
                  {isAnnual && (
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                      Save RM 600/year!
                    </p>
                  )}
                </div>
                
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-500" />
                    <span>All Premium features</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-500" />
                    <span>Device integration support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-500" />
                    <span>POS system integration</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-500" />
                    <span>Custom reports & analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-500" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-500" />
                    <span>Multi-campus support</span>
                  </li>
                </ul>
                
                <div className="space-y-2">
                  <Button variant="outline" className="w-full border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white dark:border-purple-400 dark:text-purple-400" asChild>
                    <Link href="/register">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Go Enterprise
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Register:</strong> Start with free basic plan instantly</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-3">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">2</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Grow:</strong> Upgrade when you need advanced features</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Scale:</strong> Add devices and POS integration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Device Integration Options */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Optional Device Integration
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Upgrade your TIME system with our biometric devices for contactless attendance and access control
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* smartID Palm */}
            <Card className="border-0 shadow-lg relative hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">smartID Palm</CardTitle>
                <CardDescription className="text-lg">Biometric palm recognition device</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">RM 2,499</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">One-time purchase + installation</p>
                </div>
                
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-500" />
                    <span>Contactless palm recognition</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-500" />
                    <span>99.9% accuracy rate</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-500" />
                    <span>Real-time attendance sync</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-500" />
                    <span>2-year warranty</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-purple-500" />
                    <span>Free installation & training</span>
                  </li>
                </ul>
                
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                  <Phone className="w-4 h-4 mr-2" />
                  Order smartID Palm
                </Button>
              </CardContent>
            </Card>

            {/* smartID Card */}
            <Card className="border-0 shadow-lg relative hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">smartID Card</CardTitle>
                <CardDescription className="text-lg">NFC-enabled encrypted smart cards</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">RM 1,899</span>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Printer/Scanner + 500 cards</p>
                </div>
                
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-500" />
                    <span>NFC-enabled attendance</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-500" />
                    <span>Encrypted & secure</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-500" />
                    <span>Cannot be duplicated</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-500" />
                    <span>Print custom ID cards</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3 text-blue-500" />
                    <span>Real-time sync with TIME</span>
                  </li>
                </ul>
                
                <Button variant="outline" className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400">
                  <Phone className="w-4 h-4 mr-2" />
                  Order smartID Card
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}