'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { HeaderSkeleton, StatCardSkeleton, ChartSkeleton, ActivityFeedSkeleton } from '@/components/ui/loading-skeletons'

// Mock data for components that don't have real data yet
const recentAlerts = [
  { id: 1, type: 'warning', title: 'Low card stock', message: 'Only 45 smart cards remaining in inventory', time: '2 hours ago' },
  { id: 2, type: 'info', title: 'Scheduled maintenance', message: 'Biometric scanner will be offline tomorrow 2-4 PM', time: '4 hours ago' },
  { id: 3, type: 'success', title: 'Backup completed', message: 'Daily database backup completed successfully', time: '8 hours ago' },
  { id: 4, type: 'error', title: 'Failed enrollments', message: '5 palm scans failed in the last hour', time: '1 day ago' }
]


const alertIcons = {
  warning: '⚠️',
  info: 'ℹ️',
  success: '✅',
  error: '❌'
}

export default function AnalyticsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('6months')
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      setLoading(true)
      
      // Get current user from Supabase auth
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        toast.error('Please sign in to view analytics')
        return
      }
      
      // Get user profile data
      const { data: currentUser } = await supabase
        .from('users')
        .select('*')
        .or(`auth_user_id.eq.${authUser.id},id.eq.${authUser.id}`)
        .single()
      
      console.log('👤 Found current user for Analytics:', currentUser)
      
      if (currentUser) {
        setCurrentUser(currentUser)
        if (currentUser.institution_id) {
          await loadAnalyticsData(currentUser.institution_id)
        }
      }
    } catch (error) {
      console.error('Error initializing analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const loadAnalyticsData = async (institutionId: string) => {
    try {
      console.log('Loading analytics data for institution:', institutionId)
      
      // Use the dashboard stats API that already exists
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics data')
      }
      
      console.log('Analytics data loaded:', data)
      setAnalyticsData(data.stats)
    } catch (error) {
      console.error('Error loading analytics data:', error)
      toast.error('Failed to load analytics data')
      // Set fallback data
      setAnalyticsData({
        users: { total: 0, teacher: 0, staff: 0, student: 0 },
        enrollment: { rate: 0, enrolled: 0, total: 0 },
        attendance: { today: 0, rate: 0 },
        recentActivities: []
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <HeaderSkeleton />
          
          {/* Controls Skeleton */}
          <div className="flex justify-end gap-3">
            <div className="h-10 w-48 bg-gray-200 dark:bg-slate-700 animate-pulse rounded" />
            <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 animate-pulse rounded" />
          </div>
          
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          
          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton />
            <ActivityFeedSkeleton />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!analyticsData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load analytics data</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Gradient Header */}
        <div className="rounded-2xl p-8 border-0 shadow-lg header-card">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics & Insights 📈</h1>
              <p className="opacity-90">SMK Bukit Jelutong • Track enrollment progress, user patterns, and system performance</p>
            </div>
            <div className="flex gap-6 mt-4 lg:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold">{analyticsData.enrollment.rate}%</div>
                <div className="text-sm opacity-70">Enrollment Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{analyticsData.users.total}</div>
                <div className="text-sm opacity-70">Total Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-end gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              📊 Export Report
            </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Enrollment Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">{analyticsData.enrollment.rate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{analyticsData.enrollment.enrolled} enrolled</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-xl">
                  ✋
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Attendance Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">{analyticsData.attendance.rate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{analyticsData.attendance.today} today</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl">
                  💳
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">{analyticsData.users.total}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-slate-400">All user types</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-xl">
                  ✅
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Activities</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">{analyticsData.recentActivities.length}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-slate-400">Recent activity</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white text-xl">
                  ⏱️
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enrollment Trends Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-slate-50">Enrollment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current User Statistics */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 text-sm text-gray-500 dark:text-slate-400">Students</div>
                      <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${analyticsData.users.total > 0 ? (analyticsData.users.student / analyticsData.users.total) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="w-16 text-sm text-gray-600 dark:text-slate-300 text-right">{analyticsData.users.student}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-16 text-sm text-gray-500 dark:text-slate-400">Teachers</div>
                      <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${analyticsData.users.total > 0 ? (analyticsData.users.teacher / analyticsData.users.total) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="w-16 text-sm text-gray-600 dark:text-slate-300 text-right">{analyticsData.users.teacher}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-16 text-sm text-gray-500 dark:text-slate-400">Staff</div>
                      <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${analyticsData.users.total > 0 ? (analyticsData.users.staff / analyticsData.users.total) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="w-16 text-sm text-gray-600 dark:text-slate-300 text-right">{analyticsData.users.staff}</div>
                    </div>
                  </div>
                  
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.users.total}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{analyticsData.enrollment.enrolled}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Enrolled</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* User Distribution */}
            <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-slate-50">User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-gray-700 dark:text-slate-300">Students</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-slate-100">{analyticsData.users.student}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{((analyticsData.users.student / analyticsData.users.total) * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-gray-700 dark:text-slate-300">Teachers</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-slate-100">{analyticsData.users.teacher}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{((analyticsData.users.teacher / analyticsData.users.total) * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-gray-700 dark:text-slate-300">Staff</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-slate-100">{analyticsData.users.staff}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{((analyticsData.users.staff / analyticsData.users.total) * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
                
                {/* Visual representation */}
                <div className="mt-6 h-4 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-purple-500 transition-all duration-500"
                    style={{ width: `${(analyticsData.users.student / analyticsData.users.total) * 100}%` }}
                  />
                  <div 
                    className="bg-green-500 transition-all duration-500"
                    style={{ width: `${(analyticsData.users.teacher / analyticsData.users.total) * 100}%` }}
                  />
                  <div 
                    className="bg-blue-500 transition-all duration-500"
                    style={{ width: `${(analyticsData.users.staff / analyticsData.users.total) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-slate-50 flex items-center gap-2">
                  System Alerts
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 rounded-xl border bg-gray-50/50 dark:bg-slate-700/30 hover:bg-gray-100/50 dark:hover:bg-slate-700 dark:border-slate-600 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="text-lg flex-shrink-0">
                          {alertIcons[alert.type as keyof typeof alertIcons]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-slate-100 text-sm">{alert.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">{alert.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-slate-50">System Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{analyticsData.users.total}</div>
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Total Users</div>
                <div className="text-xs text-blue-500 dark:text-blue-400">System-wide</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{analyticsData.enrollment.enrolled}</div>
                <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Enrolled</div>
                <div className="text-xs text-green-500 dark:text-green-400">{analyticsData.enrollment.rate}% completion</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{analyticsData.recentActivities.length}</div>
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Activities</div>
                <div className="text-xs text-purple-500 dark:text-purple-400">Recent events</div>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">{analyticsData.users.student + analyticsData.users.teacher + analyticsData.users.staff}</div>
                <div className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Active Users</div>
                <div className="text-xs text-amber-500 dark:text-amber-400">All roles</div>
              </div>
            </div>
            
            {/* Quick stats */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-slate-700/30 rounded-xl">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Quick Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-slate-400">Students:</span>
                  <span className="ml-2 font-semibold text-purple-600 dark:text-purple-400">{analyticsData.users.student}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-slate-400">Teachers:</span>
                  <span className="ml-2 font-semibold text-green-600 dark:text-green-400">{analyticsData.users.teacher}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-slate-400">Staff:</span>
                  <span className="ml-2 font-semibold text-blue-600 dark:text-blue-400">{analyticsData.users.staff}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
