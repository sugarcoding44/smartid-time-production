'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { UserPlus, Hand, CreditCard, Zap, Calendar, Settings, Users, FileText, Clock, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { QuickAddUserModal } from '@/components/features/quick-add-user-modal'
import { QuickUserModal } from '@/components/features/quick-user-modal'
import { PalmEnrollmentModal } from '@/components/features/palm-enrollment-modal'
import { CardIssuanceModal } from '@/components/features/card-issuance-modal'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

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
    { title: 'Total Users', value: dashboardData.users.total.toLocaleString(), icon: '👥', gradient: 'from-blue-500 to-blue-600' },
    { title: 'Teachers', value: dashboardData.users.teacher.toLocaleString(), icon: '👨‍🏫', gradient: 'from-green-500 to-green-600' },
    { title: 'Staff Members', value: dashboardData.users.staff.toLocaleString(), icon: '👩‍💼', gradient: 'from-purple-500 to-purple-600' },
    { title: 'Students', value: dashboardData.users.student.toLocaleString(), icon: '🎓', gradient: 'from-orange-500 to-orange-600' },
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
  
  // Show loading state if auth is still loading
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    )
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
              {/* Welcome Header */}
              <div className="bg-white dark:bg-gradient-to-br dark:from-violet-900 dark:to-purple-900 rounded-2xl p-6 border-0 shadow-lg dark:border dark:border-purple-800/50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back, {loading ? '...' : (profile?.full_name || user?.email?.split('@')[0] || 'Admin')} 👋</h1>
                    <p className="text-gray-600 dark:text-purple-200/90">Institution Admin • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="flex gap-8 mt-4 lg:mt-0">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{dataLoading ? '...' : dashboardData.users.total}</div>
                      <div className="text-sm text-gray-500 dark:text-purple-200/70">Total Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{dataLoading ? '...' : `${dashboardData.enrollment.rate}%`}</div>
                      <div className="text-sm text-gray-500 dark:text-purple-200/70">Enrollment Rate</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="relative overflow-hidden bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700 hover:shadow-xl dark:hover:bg-slate-700 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">{dataLoading ? '...' : stat.value}</p>
                          {!dataLoading && parseInt(stat.value) > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                              <span className="text-xs text-gray-500 dark:text-slate-400">Active users</span>
                            </div>
                          )}
                        </div>
                        <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center text-white text-xl shadow-lg`}>
                          {stat.icon}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

        {/* Quick Actions */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-slate-50 flex items-center gap-2">
              <Zap className="w-6 h-6 text-indigo-600" />
              Quick Actions
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-slate-400">One-click actions for common tasks</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Add New User */}
              <div className="group cursor-pointer" onClick={() => setShowAddUserModal(true)}>
                <div className="flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-100 text-center">Add New User</span>
                </div>
              </div>

              {/* Enroll Palm Biometric */}
              <div className="group cursor-pointer" onClick={() => setShowPalmUserModal(true)}>
                <div className="flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                    <Hand className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-100 text-center">Enroll Palm</span>
                </div>
              </div>

              {/* Issue Smart Card */}
              <div className="group cursor-pointer" onClick={() => setShowCardUserModal(true)}>
                <div className="flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-100 text-center">Issue Smart Card</span>
                </div>
              </div>

              {/* User Management (Page Link) */}
              <Link href="/simple-users" className="group">
                <div className="flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-100 text-center">User Management</span>
                </div>
              </Link>

              {/* Attendance */}
              <Link href="/attendance" className="group">
                <div className="flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-100 text-center">Attendance</span>
                </div>
              </Link>

              {/* System Settings */}
              <Link href="/profile" className="group">
                <div className="flex flex-col items-center p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md transition-all duration-200 cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform">
                    <Settings className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-100 text-center">Settings</span>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-slate-50">Enrollment Overview</CardTitle>
                  <div className="text-sm text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                    This Month
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Chart Placeholder */}
                <div className="h-64 bg-gradient-to-br from-indigo-50 to-purple-50 dark:bg-slate-900 dark:border-2 dark:border-dashed dark:border-slate-700 rounded-2xl flex items-center justify-center mb-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-gray-600 dark:text-slate-400">Enrollment Progress Chart</p>
                    <p className="text-sm text-gray-500 dark:text-slate-500">Last 7 days comparison</p>
                  </div>
                </div>
                
                {/* Progress Bars */}
                <div className="space-y-4">
                  {progressData.map((item, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-slate-900 dark:border-l-4 dark:border-indigo-500 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700 dark:text-slate-300 text-sm">{item.label}</span>
                        <span className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                          {item.value}% ({item.completed}/{item.total})
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-slate-50 flex items-center gap-2">
                  <span>🔔 Recent Activity</span>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {dataLoading ? (
                      <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                        Loading activities...
                      </div>
                    ) : dashboardData.recentActivities.length > 0 ? (
                      dashboardData.recentActivities.map((activity: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                          <div className={`w-10 h-10 ${activity.color} rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 shadow-md`}>
                            {activity.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{activity.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                        No recent activities
                      </div>
                    )}
                  </div>
              </CardContent>
            </Card>

            {/* SmartID NFC Card Info */}
            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">💳</div>
                  <h3 className="font-semibold text-lg mb-2">SmartID NFC Card</h3>
                  <p className="text-indigo-100 text-sm mb-3">
                    Encrypted NFC technology with built-in eWallet for cafeteria payments.
                  </p>
                  <div className="bg-white/20 rounded-lg p-3 mb-4">
                    <div className="text-2xl font-bold">RM10</div>
                    <div className="text-sm opacity-90">per card</div>
                    <div className="text-xs mt-1">Min. order: 100 cards</div>
                  </div>
                  <button className="bg-white/90 text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/80 transition-colors">
                    Order Cards
                  </button>
                </div>
              </CardContent>
            </Card>
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
