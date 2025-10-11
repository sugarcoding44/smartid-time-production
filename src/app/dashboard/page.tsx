'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { UserPlus, Hand, CreditCard, Zap, Calendar, Settings, Users, FileText, Clock, UserCheck, Activity, BarChart3, Bell, Crown, CalendarClock } from 'lucide-react'
import Link from 'next/link'
import { QuickAddUserModal } from '@/components/features/quick-add-user-modal'
import { QuickUserModal } from '@/components/features/quick-user-modal'
import { PalmEnrollmentModal } from '@/components/features/palm-enrollment-modal'
import { CardIssuanceModal } from '@/components/features/card-issuance-modal'
import { CompactEnrollmentChart } from '@/components/charts/compact-enrollment-chart'
import { AttendanceChart } from '@/components/charts/attendance-chart'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { HeaderSkeleton, StatCardSkeleton, ChartSkeleton } from '@/components/ui/loading-skeletons'

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  
  // Dashboard data states
  const [dashboardData, setDashboardData] = useState<any>({
    users: { total: 0, teacher: 0, staff: 0, student: 0, admin: 0 },
    enrollment: { rate: 0, enrolled: 0, total: 0 },
    attendance: { today: 0, rate: 0 },
    recentActivities: []
  })
  const [dataLoading, setDataLoading] = useState(true)
  
  // Quick action modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showPalmUserModal, setShowPalmUserModal] = useState(false)
  const [showCardUserModal, setShowCardUserModal] = useState(false)
  const [showPalmEnrollModal, setShowPalmEnrollModal] = useState(false)
  const [showCardIssueModal, setShowCardIssueModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  
  useEffect(() => {
    fetchDashboardData()
  }, [])
  
  const fetchDashboardData = async () => {
    try {
      setDataLoading(true)
      const response = await fetch('/api/dashboard/stats')
      const result = await response.json()
      
      if (result.success) {
        setDashboardData(result.stats)
      } else {
        console.error('Failed to fetch dashboard data:', result.error)
        toast.error('Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setDataLoading(false)
    }
  }
  
  // Transform data for display
  const stats = [
    { title: 'Total Users', value: dashboardData.users.total.toLocaleString(), icon: Users, color: 'bg-blue-600', textColor: 'text-blue-600 dark:text-blue-400' },
    { title: 'Teachers', value: dashboardData.users.teacher.toLocaleString(), icon: UserCheck, color: 'bg-green-600', textColor: 'text-green-600 dark:text-green-400' },
    { title: 'Staff Members', value: dashboardData.users.staff.toLocaleString(), icon: FileText, color: 'bg-purple-600', textColor: 'text-purple-600 dark:text-purple-400' },
    { title: 'Students', value: dashboardData.users.student.toLocaleString(), icon: UserPlus, color: 'bg-orange-600', textColor: 'text-orange-600 dark:text-orange-400' },
  ]
  
  const progressData = [
    { 
      label: 'Palm Recognition Enrollment', 
      value: dashboardData.enrollment.rate, 
      total: dashboardData.enrollment.total, 
      completed: dashboardData.enrollment.enrolled 
    },
    { 
      label: 'Smart Card Distribution', 
      value: 0, // Will be updated when we have smart card data
      total: dashboardData.users.total, 
      completed: 0 
    },
    { 
      label: 'Today\'s Attendance', 
      value: dashboardData.attendance.rate, 
      total: dashboardData.users.total, 
      completed: dashboardData.attendance.today 
    },
  ]

  // Quick action handlers
  const handlePalmUserSelect = (user: any) => {
    setSelectedUser({
      id: user.id,
      full_name: user.full_name,
      employee_id: user.employee_id,
      role: user.primary_role,
      palm_id: null,
      isReEnrollment: false
    })
    setShowPalmEnrollModal(true)
  }

  const handleCardUserSelect = (user: any) => {
    setSelectedUser({
      id: user.id,
      fullName: user.full_name,
      employeeId: user.employee_id,
      userType: user.primary_role
    })
    setShowCardIssueModal(true)
  }

  const handlePalmEnrollment = (userId: string, palmId: string) => {
    console.log('Palm enrollment completed:', { userId, palmId })
    // In a real implementation, this would update the database
  }

  const handleCardIssuance = (userId: string, cardId: string) => {
    console.log('Card issuance completed:', { userId, cardId })
    // In a real implementation, this would update the database
  }

  const handleUserAdded = () => {
    // Refresh user stats or show success message
    console.log('New user added successfully')
    fetchDashboardData() // Refresh dashboard data
  }
  
  // Derive a name from whatever we have available; don't block on loading
  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section with Alipay+ Style */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-lg md:min-h-[220px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full text-blue-600 text-sm font-medium">
                ✨ Dashboard Overview
              </div>
              
              <div className="space-y-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-snug">
                  Welcome back,
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {userName}
                  </span>
                </h1>
                
                <p className="text-base text-gray-600 dark:text-gray-300 leading-normal">
                  Your institution is running smoothly. Here's what's happening today.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  {dataLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {dashboardData.users?.total || 0}
                    </div>
                  )}
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
                </div>
                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  {dataLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {dashboardData.enrollment?.rate || 0}%
                    </div>
                  )}
                  <div className="text-sm text-gray-600 dark:text-gray-400">Enrolled</div>
                </div>
              </div>
            </div>

            {/* Right Visual - Animated Dashboard Card */}
            <div className="relative lg:ml-8">
              <div className="relative">
                {/* Main Dashboard Card */}
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-2xl mb-3">
                    <div className="text-lg font-bold mb-1">smartID TIME</div>
                    <div className="text-sm opacity-90">Live Dashboard</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-xs">
                          ✓
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white text-sm">Attendance Active</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Real-time tracking</div>
                        </div>
                      </div>
                      <div className="text-green-600 font-semibold text-sm">Live</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-xs">
                          📊
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white text-sm">Analytics Ready</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Updated 2min ago</div>
                        </div>
                      </div>
                      <div className="text-blue-600 font-semibold text-sm">View</div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl hidden md:flex items-center justify-center text-white text-base font-bold shadow-lg transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                  🎯
                </div>
                
                <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl hidden md:flex items-center justify-center text-white shadow-md transform rotate-12 hover:rotate-6 transition-transform duration-300">
                  ⚡
                </div>
              </div>
            </div>
          </div>

          {/* Background Decorations */}
          <div className="absolute top-10 right-16 w-16 h-16 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full opacity-20 blur-lg"></div>
          <div className="absolute bottom-12 left-12 w-12 h-12 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 blur-lg"></div>
        </div>

              {/* Stats Grid - Alipay+ Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {/* Total Users Card */}
                <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-600/5"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                        <div className="text-2xl text-white">👥</div>
                      </div>
                      <div className="text-right">
                        {dataLoading ? (
                          <Skeleton className="h-9 w-20 mb-1" />
                        ) : (
                          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {dashboardData.users?.total || 0}
                          </div>
                        )}
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        +{dashboardData.users?.new || 0} this month
                      </div>
                      <div className="text-2xl opacity-20 group-hover:opacity-40 transition-opacity">📈</div>
                    </div>
                  </div>
                </div>

                {/* Active Today Card */}
                <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-600/5"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                        <div className="text-2xl text-white">✅</div>
                      </div>
                      <div className="text-right">
                        {dataLoading ? (
                          <Skeleton className="h-9 w-20 mb-1" />
                        ) : (
                          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {dashboardData.users?.active || 0}
                          </div>
                        )}
                        <div className="text-sm text-gray-500 dark:text-gray-400">Active Today</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        {dashboardData.users?.activePercentage || 0}% of total
                      </div>
                      <div className="text-2xl opacity-20 group-hover:opacity-40 transition-opacity">⚡</div>
                    </div>
                  </div>
                </div>

                {/* Enrollment Rate Card */}
                <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-600/5"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                        <div className="text-2xl text-white">📋</div>
                      </div>
                      <div className="text-right">
                        {dataLoading ? (
                          <Skeleton className="h-9 w-20 mb-1" />
                        ) : (
                          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {dashboardData.enrollment?.rate || 0}%
                          </div>
                        )}
                        <div className="text-sm text-gray-500 dark:text-gray-400">Enrollment</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full h-3 transition-all duration-1000 ease-out" 
                          style={{ width: `${dashboardData.enrollment?.rate || 0}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Target: 85% completion
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leave Requests Card */}
                <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-600/5"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-lg">
                        <div className="text-2xl text-white">📝</div>
                      </div>
                      <div className="text-right">
                        {dataLoading ? (
                          <Skeleton className="h-9 w-20 mb-1" />
                        ) : (
                          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                            {dashboardData.leaves?.pending || 0}
                          </div>
                        )}
                        <div className="text-sm text-gray-500 dark:text-gray-400">Leave Requests</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        {dashboardData.leaves?.approved || 0} approved
                      </div>
                      <div className="text-2xl opacity-20 group-hover:opacity-40 transition-opacity">📊</div>
                    </div>
                  </div>
                </div>
              </div>

        {/* Quick Actions - Alipay+ Style */}
        <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-indigo-600/5 rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400">Access frequently used features instantly</p>
              </div>
              <div className="hidden md:block text-4xl opacity-20">⚡</div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {/* Add New User */}
              <div className="group cursor-pointer" onClick={() => setShowAddUserModal(true)}>
                <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex flex-col items-center space-y-3">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <UserPlus className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-center leading-tight">Add New User</span>
                  </div>
                </div>
              </div>

              {/* Enroll Palm Biometric */}
              <div className="group cursor-pointer" onClick={() => setShowPalmUserModal(true)}>
                <div className="relative bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-emerald-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex flex-col items-center space-y-3">
                    <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Hand className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-center leading-tight">Enroll Palm</span>
                  </div>
                </div>
              </div>

              {/* Issue Smart Card */}
              <div className="group cursor-pointer" onClick={() => setShowCardUserModal(true)}>
                <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex flex-col items-center space-y-3">
                    <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <CreditCard className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-center leading-tight">Issue Card</span>
                  </div>
                </div>
              </div>

              {/* User Management */}
              <Link href="/simple-users-v2" className="group">
                <div className="relative bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-2xl p-6 border border-indigo-200/50 dark:border-indigo-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-indigo-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex flex-col items-center space-y-3">
                    <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-center leading-tight">User Mgmt</span>
                  </div>
                </div>
              </Link>

              {/* Attendance */}
              <Link href="/attendance" className="group">
                <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-6 border border-orange-200/50 dark:border-orange-700/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex flex-col items-center space-y-3">
                    <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-center leading-tight">Attendance</span>
                  </div>
                </div>
              </Link>

              {/* System Settings */}
              <Link href="/profile" className="group">
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/20 dark:to-gray-600/20 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-500/0 to-gray-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex flex-col items-center space-y-3">
                    <div className="w-14 h-14 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Settings className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white text-center leading-tight">Settings</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid - Alipay+ Style */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enrollment Overview Section */}
          <div className="lg:col-span-2">
            {dataLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-center py-12 space-x-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
                  <span className="text-gray-600 dark:text-gray-300 text-lg">Loading enrollment data...</span>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <CompactEnrollmentChart 
                  data={{
                    users: dashboardData.users,
                    enrollment: dashboardData.enrollment
                  }}
                />
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Recent Activity - Alipay+ Style */}
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-600/5 rounded-full transform -translate-x-16 -translate-y-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                        <div className="text-lg">🔔</div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                      <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg"></div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">Latest system updates</p>
                  </div>
                </div>

                {/* Activities List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {dataLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
                      <span className="text-gray-500 dark:text-gray-400">Loading activities...</span>
                    </div>
                  ) : dashboardData.recentActivities.length > 0 ? (
                    dashboardData.recentActivities.map((activity: any, index: number) => (
                      <div key={index} className="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-800/20 transition-all duration-300 cursor-pointer">
                        <div className={`w-12 h-12 ${activity.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                          <span className="text-sm font-bold">{activity.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                        </div>
                        <div className="text-gray-300 dark:text-gray-600 group-hover:text-green-400 transition-colors">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="text-gray-500 dark:text-gray-400 text-lg">No recent activities</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Activities will appear here as they happen</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Attendance Analytics Section - Alipay+ Style */}
        <div className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-indigo-600/5 rounded-full transform translate-x-24 -translate-y-24"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Analytics</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 ml-12">Real-time insights and trends</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Data
              </div>
            </div>
            {dataLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                <span className="text-gray-600 dark:text-gray-300 text-lg">Loading attendance data...</span>
              </div>
            ) : (
              <AttendanceChart 
                data={{
                  todayStats: {
                    present: dashboardData.attendance.today,
                    late: Math.round(dashboardData.attendance.today * 0.2), // Demo calculation
                    absent: dashboardData.users.total - dashboardData.attendance.today,
                    total: dashboardData.users.total,
                    rate: dashboardData.attendance.rate
                  },
                  weeklyTrend: [
                    { day: 'Mon', present: dashboardData.attendance.today + 2, late: 2, absent: 2, rate: dashboardData.attendance.rate + 5 },
                    { day: 'Tue', present: dashboardData.attendance.today + 1, late: 3, absent: 2, rate: dashboardData.attendance.rate + 2 },
                    { day: 'Wed', present: dashboardData.attendance.today + 3, late: 1, absent: 2, rate: dashboardData.attendance.rate + 8 },
                    { day: 'Thu', present: dashboardData.attendance.today, late: 4, absent: 2, rate: dashboardData.attendance.rate },
                    { day: 'Fri', present: dashboardData.attendance.today - 2, late: 5, absent: 3, rate: dashboardData.attendance.rate - 10 },
                    { day: 'Sat', present: dashboardData.attendance.today + 4, late: 1, absent: 1, rate: dashboardData.attendance.rate + 15 },
                    { day: 'Sun', present: dashboardData.attendance.today, late: 3, absent: 3, rate: dashboardData.attendance.rate }
                  ],
                  timeDistribution: [
                    { hour: '7:00', checkIns: 2 },
                    { hour: '7:30', checkIns: 5 },
                    { hour: '8:00', checkIns: Math.round(dashboardData.attendance.today * 0.5) || 8 },
                    { hour: '8:30', checkIns: Math.round(dashboardData.attendance.today * 0.3) || 5 },
                    { hour: '9:00', checkIns: 3 },
                    { hour: '9:30', checkIns: 1 },
                    { hour: '10:00', checkIns: 0 }
                  ]
                }}
              />
            )}
          </div>
        </div>

      </div>

      {/* Quick Action Modals */}
      <QuickAddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onUserAdded={handleUserAdded}
      />

      <QuickUserModal
        isOpen={showPalmUserModal}
        onClose={() => setShowPalmUserModal(false)}
        onUserSelect={handlePalmUserSelect}
        title="Select User for Palm Enrollment"
        description="Choose a user to enroll their palm biometric"
        filterCondition={(user) => true} // Could filter users without palm enrollment
      />

      <QuickUserModal
        isOpen={showCardUserModal}
        onClose={() => setShowCardUserModal(false)}
        onUserSelect={handleCardUserSelect}
        title="Select User for Card Issuance"
        description="Choose a user to issue a smart card"
        filterCondition={(user) => true} // Could filter users without cards
      />

      <PalmEnrollmentModal
        isOpen={showPalmEnrollModal}
        onClose={() => setShowPalmEnrollModal(false)}
        user={selectedUser}
        onEnrollmentComplete={handlePalmEnrollment}
      />

      <CardIssuanceModal
        isOpen={showCardIssueModal}
        onClose={() => setShowCardIssueModal(false)}
        user={selectedUser}
        onIssuanceComplete={handleCardIssuance}
      />
    </DashboardLayout>
  )
}
