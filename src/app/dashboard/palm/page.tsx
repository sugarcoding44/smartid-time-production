'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PalmEnrollmentModal } from '@/components/features/palm-enrollment-modal'
import { toast } from 'sonner'
import { Users, Hand, CheckCircle, Clock, XCircle, TrendingUp, AlertTriangle } from 'lucide-react'
import type { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

type PalmUser = {
  id: string
  full_name: string
  employee_id: string
  role: string
  email: string
  institution_id: string
  palm_id: string | null
  palm_enrolled_at: string | null
  last_palm_scan: string | null
  palm_scan_count: number
  palm_status: 'active' | 'pending' | 'inactive' | 'expired'
  palm_quality: number | null
  isReEnrollment?: boolean
}

// Data now comes from real Supabase users and palm activity APIs

const statusColors = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-600 dark:text-emerald-100 dark:border-emerald-500',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-600 dark:text-yellow-100 dark:border-yellow-500',
  expired: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-600 dark:text-red-100 dark:border-red-500',
  blocked: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500'
}

const activityIcons = {
  enrollment: '✋',
  scan: '👀',
  failed: '❌',
  're-enrollment': '🔄'
}

const activityColors = {
  enrollment: 'bg-emerald-500',
  scan: 'bg-blue-500',
  failed: 'bg-red-500',
  're-enrollment': 'bg-amber-500'
}

export default function PalmManagementPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [palmData, setPalmData] = useState<PalmUser[]>([])
  const [loading, setLoading] = useState(true)
  const [palmModalOpen, setPalmModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<PalmUser | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [activityLoading, setActivityLoading] = useState(true)
  const [deviceStatus, setDeviceStatus] = useState<{
    isConnected: boolean
    isReady: boolean
    deviceInfo: any
    lastCheck: Date
    error?: string
  } | null>(null)
  const [deviceLoading, setDeviceLoading] = useState(false)

  useEffect(() => {
    initializeData()
    checkDeviceStatus() // Check device status on load
    
    // Set up periodic device status checks
    const deviceCheckInterval = setInterval(checkDeviceStatus, 30000) // Check every 30 seconds
    
    return () => {
      clearInterval(deviceCheckInterval)
    }
  }, [])

  const initializeData = async () => {
    try {
      setLoading(true)
      
      // Get current user info from debug endpoint
      const debugResponse = await fetch('/api/debug/supabase')
      const debugData = await debugResponse.json()
      
      const serviceTest = debugData.tests.find((t: any) => t.name === 'Service Role Client')
      const user = serviceTest?.data?.[0]
      
      if (user) {
        setCurrentUser(user)
        await loadPalmUsers(user.institution_id)
        await loadRecentActivity(user.institution_id)
      }
    } catch (error) {
      console.error('Error initializing palm data:', error)
      toast.error('Failed to load palm management data')
    } finally {
      setLoading(false)
    }
  }

  const loadPalmUsers = async (institutionId: string) => {
    try {
      console.log('Loading palm users for institution:', institutionId)
      
      const response = await fetch(`/api/users?institution_id=${institutionId}&include_palm_data=true`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users')
      }
      
      // Transform the user data to match our PalmUser type
      const palmUsers = (data.data || []).map((user: User) => ({
        id: user.id,
        full_name: user.full_name,
        employee_id: user.employee_id,
        role: user.primary_role || user.smartid_hub_role || 'student',
        email: user.email,
        institution_id: user.institution_id,
        palm_id: user.palm_id || null,
        palm_enrolled_at: user.palm_enrolled_at || null,
        last_palm_scan: user.last_palm_scan || null,
        palm_scan_count: user.palm_scan_count || 0,
        palm_status: user.palm_status || 'pending',
        palm_quality: user.palm_quality || null
      }))
      
      console.log('Palm users loaded:', palmUsers.length)
      setPalmData(palmUsers)
    } catch (error) {
      console.error('Error loading palm users:', error)
      toast.error('Failed to load users')
    }
  }

  const loadRecentActivity = async (institutionId: string) => {
    try {
      setActivityLoading(true)
      console.log('Loading recent palm activity for institution:', institutionId)
      
      const response = await fetch(`/api/palm/activity?institution_id=${institutionId}&limit=10`)
      const data = await response.json()
      
      if (!response.ok) {
        // If it's a database error (table doesn't exist), just show empty state
        if (data.error && (data.error.includes('does not exist') || data.error.includes('relation') || data.error.includes('table'))) {
          console.warn('Palm activity tables not found, showing empty state:', data.error)
          setRecentActivity([])
          return
        }
        throw new Error(data.error || 'Failed to fetch palm activity')
      }
      
      console.log('Recent activity loaded:', data.data?.length || 0, 'activities')
      setRecentActivity(data.data || [])
    } catch (error) {
      console.error('Error loading recent activity:', error)
      // Don't show error toast for activity - just show empty state
      setRecentActivity([])
    } finally {
      setActivityLoading(false)
    }
  }

  const checkDeviceStatus = async () => {
    try {
      setDeviceLoading(true)
      console.log('🔍 Checking palm scanner device status...')
      
      const response = await fetch('/api/palm/scanner/device')
      const data = await response.json()
      
      if (data.success && data.data) {
        setDeviceStatus({
          isConnected: true,
          isReady: data.data.is_ready,
          deviceInfo: data.data,
          lastCheck: new Date(),
          error: undefined
        })
        console.log('✅ Device status updated:', data.data)
      } else {
        setDeviceStatus({
          isConnected: false,
          isReady: false,
          deviceInfo: null,
          lastCheck: new Date(),
          error: data.error || 'Device not available'
        })
        console.log('❌ Device not available:', data.error)
      }
    } catch (error) {
      console.error('Error checking device status:', error)
      setDeviceStatus({
        isConnected: false,
        isReady: false,
        deviceInfo: null,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Connection failed'
      })
    } finally {
      setDeviceLoading(false)
    }
  }

  const initializeDevice = async () => {
    try {
      setDeviceLoading(true)
      console.log('🚀 Initializing palm scanner device...')
      
      const response = await fetch('/api/palm/scanner/device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize' })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Palm scanner initialized successfully')
        await checkDeviceStatus() // Refresh status
      } else {
        toast.error(data.error || 'Failed to initialize palm scanner')
      }
    } catch (error) {
      console.error('Error initializing device:', error)
      toast.error('Failed to initialize palm scanner')
    } finally {
      setDeviceLoading(false)
    }
  }

  const openPalmModal = (user: PalmUser, isReEnrollment: boolean = false) => {
    setSelectedUser({ ...user, isReEnrollment })
    setPalmModalOpen(true)
  }

  const handlePalmEnrollment = async (userId: string, palmId: string) => {
    try {
      const user = palmData.find(u => u.id === userId)
      const isReEnrollment = user?.isReEnrollment || false
      const qualityScore = 95 + Math.floor(Math.random() * 5)

      let response
      if (isReEnrollment) {
        // Use re-enrollment API
        response = await fetch('/api/palm/re-enroll', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            newPalmId: palmId,
            hand_type: 'right',
            quality_score: qualityScore
          })
        })
      } else {
        // Use regular enrollment API
        response = await fetch(`/api/users/${userId}/palm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            palm_id: palmId,
            palm_status: 'active',
            palm_enrolled_at: new Date().toISOString(),
            palm_quality: qualityScore
          })
        })
      }
      
      if (!response.ok) {
        throw new Error(`Failed to ${isReEnrollment ? 're-enroll' : 'enroll'} palm biometric`)
      }
      
      // Update local state
      setPalmData(prevData => prevData.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              palm_id: palmId, 
              palm_status: 'active' as const, 
              palm_enrolled_at: new Date().toISOString(), 
              last_palm_scan: null, 
              palm_scan_count: 0, 
              palm_quality: qualityScore,
              isReEnrollment: false // Reset the flag
            }
          : user
      ))
      
      // Reload activity to show the new enrollment/re-enrollment
      if (currentUser?.institution_id) {
        await loadRecentActivity(currentUser.institution_id)
      }
      
      toast.success(`Palm biometric ${isReEnrollment ? 're-enrolled' : 'enrolled'} successfully!`)
    } catch (error) {
      console.error('Error with palm enrollment:', error)
      const user = palmData.find(u => u.id === userId)
      const isReEnrollment = user?.isReEnrollment || false
      toast.error(`Failed to ${isReEnrollment ? 're-enroll' : 'enroll'} palm biometric`)
    }
  }

  const filteredData = palmData.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.palm_id && user.palm_id.toLowerCase().includes(searchTerm.toLowerCase()))
    
    let matchesStatus = true
    if (filterStatus === 'not_enrolled') {
      matchesStatus = !user.palm_id
    } else if (filterStatus === 'enrolled') {
      matchesStatus = !!user.palm_id
    } else if (filterStatus !== 'all') {
      matchesStatus = user.palm_status === filterStatus
    }
    
    const matchesType = filterType === 'all' || user.role === filterType
    return matchesSearch && matchesStatus && matchesType
  })
  
  // Sort filtered data to prioritize not enrolled users
  .sort((a, b) => {
    // First priority: Not enrolled users (no palm_id)
    if (!a.palm_id && b.palm_id) return -1
    if (a.palm_id && !b.palm_id) return 1
    
    // Second priority: Among enrolled users, active ones first
    if (a.palm_id && b.palm_id) {
      if (a.palm_status === 'active' && b.palm_status !== 'active') return -1
      if (a.palm_status !== 'active' && b.palm_status === 'active') return 1
    }
    
    // Third priority: Alphabetical by name
    return a.full_name.localeCompare(b.full_name)
  })

  const stats = {
    total: palmData.length,
    notEnrolled: palmData.filter(u => !u.palm_id).length,
    active: palmData.filter(u => u.palm_status === 'active' && u.palm_id).length,
    pending: palmData.filter(u => u.palm_status === 'pending' && u.palm_id).length,
    expired: palmData.filter(u => u.palm_status === 'expired').length,
    avgQuality: palmData.filter(u => u.palm_quality).length > 0 
      ? Math.round(palmData.filter(u => u.palm_quality).reduce((sum, u) => sum + u.palm_quality!, 0) / palmData.filter(u => u.palm_quality).length)
      : 0
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Gradient Header with Device Status */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-violet-900 dark:to-purple-900 rounded-2xl p-8 border-0 shadow-lg dark:border dark:border-purple-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Palm Biometric Management 🤚</h1>
                {deviceStatus && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    deviceStatus.isReady 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : deviceStatus.isConnected
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      deviceStatus.isReady ? 'bg-green-500' : deviceStatus.isConnected ? 'bg-yellow-500' : 'bg-red-500'
                    } ${deviceStatus.isReady ? 'animate-pulse' : ''}`}></div>
                    {deviceStatus.isReady ? 'Scanner Ready' : deviceStatus.isConnected ? 'Scanner Connected' : 'Scanner Offline'}
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-purple-200/90">SMK Bukit Jelutong • Monitor and manage palm biometric enrollments and activities</p>
            </div>
            <div className="flex gap-6 mt-4 lg:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.notEnrolled}
                  {stats.notEnrolled > 0 && (
                    <span className="ml-1 text-lg animate-pulse">⚠️</span>
                  )}
                </div>
                <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">Need Enrollment</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</div>
                <div className="text-sm text-gray-500 dark:text-purple-200/70">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgQuality}%</div>
                <div className="text-sm text-gray-500 dark:text-purple-200/70">Avg Quality</div>
              </div>
              
              {/* Device Status and Controls */}
              <div className="text-center border-l border-gray-200 dark:border-purple-700 pl-6">
                <div className="flex flex-col gap-2">
                  {deviceStatus && (
                    <div className="text-xs text-gray-500 dark:text-purple-200/70">
                      {deviceStatus.deviceInfo?.model || 'X-Telcom Scanner'}
                      <br />
                      SDK v{deviceStatus.deviceInfo?.sdk_version || '1.3.41'}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={checkDeviceStatus}
                      disabled={deviceLoading}
                      className="text-xs"
                    >
                      {deviceLoading ? '🔄' : '🔍'} Check
                    </Button>
                    {(!deviceStatus?.isReady) && (
                      <Button
                        size="sm"
                        onClick={initializeDevice}
                        disabled={deviceLoading}
                        className="text-xs bg-blue-600 hover:bg-blue-700"
                      >
                        {deviceLoading ? 'Init...' : '🚀 Init'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
            </CardContent>
          </Card>

          {/* Highlight Not Enrolled - Most Important */}
          <Card className={`border-0 shadow-lg ${stats.notEnrolled > 0 ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 dark:from-orange-900/20 dark:to-red-900/20 dark:border-orange-700' : 'bg-white dark:bg-slate-800'}`}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.notEnrolled}
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                Not Enrolled
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.active}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.expired}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Expired</div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.avgQuality}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Quality</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Palm Records Table */}
          <div className="xl:col-span-2">
            <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900 dark:text-slate-50">Palm Biometric Records</CardTitle>
                {stats.notEnrolled > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFilterStatus('not_enrolled')}
                    className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20"
                  >
                    🗺 Show {stats.notEnrolled} Not Enrolled
                  </Button>
                )}
              </div>
                <div className="flex flex-col lg:flex-row gap-4 mt-4">
                  <Input
                    placeholder="Search by name, ID, or Palm ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="lg:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="not_enrolled">🗺 Not Enrolled ({stats.notEnrolled})</SelectItem>
                      <SelectItem value="enrolled">👍 Enrolled</SelectItem>
                      <SelectItem value="active">✅ Active</SelectItem>
                      <SelectItem value="pending">🔸 Pending</SelectItem>
                      <SelectItem value="expired">❌ Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="lg:w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="teacher">Teachers</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filterStatus === 'not_enrolled' && filteredData.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 dark:bg-orange-900/10 dark:border-orange-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center dark:bg-orange-800">
                        👋
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                          {filteredData.length} user{filteredData.length !== 1 ? 's' : ''} need{filteredData.length === 1 ? 's' : ''} palm biometric enrollment
                        </p>
                        <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                          Click the "🤚 Enroll" button next to each user to start their palm biometric enrollment process.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Palm ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Scans</TableHead>
                      <TableHead>Last Scan</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((user) => {
                      const isNotEnrolled = !user.palm_id
                      return (
                        <TableRow 
                          key={user.id} 
                          className={isNotEnrolled ? 'bg-orange-50 dark:bg-orange-900/10 border-l-4 border-l-orange-400' : ''}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {isNotEnrolled && (
                                <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse flex-shrink-0" />
                              )}
                              <div>
                                <div className={`font-medium ${isNotEnrolled ? 'text-orange-900 dark:text-orange-100' : 'text-gray-900 dark:text-slate-100'}`}>
                                  {user.full_name}
                                  {isNotEnrolled && (
                                    <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full dark:bg-orange-800 dark:text-orange-100">
                                      Needs Enrollment
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-slate-400">{user.employee_id} • {user.role}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.palm_id ? (
                              <span className="font-mono text-sm bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                                {user.palm_id}
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-slate-500">Not enrolled</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[user.palm_status as keyof typeof statusColors]}>
                              {user.palm_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.palm_quality ? (
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  user.palm_quality >= 95 ? 'bg-emerald-400' : 
                                  user.palm_quality >= 90 ? 'bg-yellow-400' : 'bg-red-400'
                                }`} />
                                <span className="text-sm">{user.palm_quality}%</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-slate-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{user.palm_scan_count}</span>
                          </TableCell>
                          <TableCell>
                            {user.last_palm_scan ? (
                              <div className="text-sm">
                                <div>{new Date(user.last_palm_scan).toLocaleDateString()}</div>
                                <div className="text-gray-500 dark:text-slate-400">
                                  {new Date(user.last_palm_scan).toLocaleTimeString()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-slate-500">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {!user.palm_id ? (
                                <Button 
                                  size="sm" 
                                  onClick={() => openPalmModal(user)}
                                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                                >
                                  🤚 Enroll
                                </Button>
                              ) : (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => openPalmModal(user, true)}
                                    className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
                                  >
                                    🔄 Re-enroll
                                  </Button>
                                  <span className="text-xs text-gray-500 dark:text-slate-400">
                                    Active
                                  </span>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-slate-50 flex items-center gap-2">
                  🔔 Recent Activity
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 dark:text-slate-500 mb-2">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                          🤚
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">No activity yet</p>
                      <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                        Palm enrollments and scans will appear here
                      </p>
                    </div>
                  ) : (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                        <div className={`w-8 h-8 ${activityColors[activity.type as keyof typeof activityColors]} rounded-full flex items-center justify-center text-white text-sm flex-shrink-0`}>
                          {activityIcons[activity.type as keyof typeof activityIcons]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {activity.user}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                            {activity.action}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500 dark:text-slate-400">
                              {activity.employee_id}
                            </span>
                            {activity.hand_type && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500 dark:text-slate-400 capitalize">
                                  {activity.hand_type} hand
                                </span>
                              </>
                            )}
                            {activity.quality_score && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500 dark:text-slate-400">
                                  {activity.quality_score}% quality
                                </span>
                              </>
                            )}
                            {activity.confidence_score && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500 dark:text-slate-400">
                                  {activity.confidence_score}% confidence
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Palm Enrollment Modal */}
      {selectedUser && (
        <PalmEnrollmentModal
          isOpen={palmModalOpen}
          onClose={() => {
            setPalmModalOpen(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
          onEnrollmentComplete={handlePalmEnrollment}
        />
      )}
    </DashboardLayout>
  )
}

