'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { FileText, AlertTriangle, CheckCircle, XCircle, Check, Grid3X3, List, Users, Calendar, TrendingDown, Eye, BarChart3, Clock, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type LeaveRequest = {
  id: string
  user_id: string
  user?: {
    full_name: string
    employee_id: string
    primary_role: string
  }
  leave_type_id: string
  leave_type?: {
    name: string
    color: string
  }
  start_date: string
  end_date: string
  days_count: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  applied_date: string
  reviewed_by?: string
  reviewed_date?: string
  notes?: string
  medical_certificate_url?: string
  attachments?: Array<{
    fileName?: string
    fileUrl?: string
    fileType?: string
    uploadedAt?: string
  }> | string
}

type LeaveType = {
  id: string
  name: string
  max_days: number
  carry_forward: boolean
  color: string
}

export default function LeaveManagementPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [currentlyOnLeave, setCurrentlyOnLeave] = useState<any[]>([])
  const [userQuotas, setUserQuotas] = useState<any[]>([])
  const [showQuotaModal, setShowQuotaModal] = useState(false)
  const [selectedUserQuota, setSelectedUserQuota] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('requests') // requests, on-leave, quotas

  useEffect(() => {
    initializeData()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [leaveRequests, searchTerm, statusFilter])

  const initializeData = async () => {
    try {
      setLoading(true)
      
      // Get current user from Supabase auth
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        toast.error('Please sign in to view leave management')
        return
      }
      
      // Get user profile data
      const { data: currentUser } = await supabase
        .from('users')
        .select('*')
        .or(`auth_user_id.eq.${authUser.id},id.eq.${authUser.id}`)
        .single()
      
      if (currentUser && currentUser.institution_id) {
        setCurrentUser(currentUser)
        await loadLeaveRequests(currentUser.institution_id)
        await loadLeaveTypes(currentUser.institution_id)
        await loadCurrentlyOnLeave(currentUser.institution_id)
        await loadUserQuotas(currentUser.institution_id)
      } else if (currentUser) {
        toast.error('Institution not found. Please contact administrator.')
      }
    } catch (error) {
      console.error('Error initializing leave management data:', error)
      toast.error('Failed to load leave management data')
    } finally {
      setLoading(false)
    }
  }

  const loadLeaveRequests = async (institutionId: string) => {
    try {
      // Fetch real leave requests from Supabase API
      const response = await fetch(`/api/leave/requests?institutionId=${institutionId}`)
      const result = await response.json()
      
      if (result.success) {
        setLeaveRequests(result.data || [])
      } else {
        console.error('Failed to load leave requests:', result.error)
        if (result.message?.includes('table not found')) {
          toast.warning('Leave management system not set up yet')
          setLeaveRequests([]) // Show empty state
        } else {
          toast.error('Failed to load leave requests')
        }
      }
    } catch (error) {
      console.error('Error loading leave requests:', error)
      toast.error('Failed to load leave requests')
    }
  }

  const loadLeaveTypes = async (institutionId: string) => {
    try {
      // Fetch real leave types from Supabase API
      const response = await fetch(`/api/leave-types?institution_id=${institutionId}`)
      const result = await response.json()
      
      if (result.success) {
        const transformedTypes = result.data.map((type: any) => ({
          id: type.id,
          name: type.name,
          max_days: type.default_quota_days || 0,
          carry_forward: type.allow_carry_forward || false,
          color: type.color || 'blue'
        }))
        setLeaveTypes(transformedTypes)
      } else {
        console.error('Failed to load leave types:', result.error)
        toast.error('Failed to load leave types')
      }
    } catch (error) {
      console.error('Error loading leave types:', error)
      toast.error('Failed to load leave types')
    }
  }

  const loadCurrentlyOnLeave = async (institutionId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/leave/currently-on-leave?institutionId=${institutionId}&date=${today}`)
      const result = await response.json()
      
      if (result.success) {
        setCurrentlyOnLeave(result.data || [])
        if (result.message) {
          console.log('Currently on leave info:', result.message)
        }
      } else {
        console.error('Failed to load currently on leave:', result.error)
        // Don't show toast error for missing tables - it's expected for new installations
        if (!result.error?.includes('schema cache') && !result.error?.includes('not set up yet')) {
          toast.error('Failed to load currently on leave data')
        }
        setCurrentlyOnLeave([]) // Set empty array on error
      }
    } catch (error) {
      console.error('Error loading currently on leave:', error)
    }
  }

  const loadUserQuotas = async (institutionId: string) => {
    try {
      const response = await fetch(`/api/leave/user-quotas?institutionId=${institutionId}`)
      const result = await response.json()
      
      if (result.success) {
        setUserQuotas(result.data || [])
      } else {
        console.error('Failed to load user quotas:', result.error)
      }
    } catch (error) {
      console.error('Error loading user quotas:', error)
    }
  }

  const filterRequests = () => {
    let filtered = leaveRequests

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.user?.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.leave_type?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    setFilteredRequests(filtered)
  }

  const handleApproveRequest = async (requestId: string) => {
    try {
      // Call real API to approve leave request
      const response = await fetch(`/api/leave/requests?id=${requestId}&action=approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update local state
        const updatedRequests = leaveRequests.map(request =>
          request.id === requestId
            ? {
                ...request,
                status: 'approved' as const,
                reviewed_by: currentUser?.full_name || 'Admin User',
                reviewed_date: new Date().toISOString()
              }
            : request
        )
        
        setLeaveRequests(updatedRequests)
        toast.success('Leave request approved successfully')
      } else {
        toast.error('Failed to approve leave request: ' + result.error)
      }
    } catch (error) {
      console.error('Error approving leave request:', error)
      toast.error('Failed to approve leave request')
    }
  }

  const handleRejectRequest = async (requestId: string, notes?: string) => {
    try {
      // Call real API to reject leave request
      const response = await fetch(`/api/leave/requests?id=${requestId}&action=reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Update local state
        const updatedRequests = leaveRequests.map(request =>
          request.id === requestId
            ? {
                ...request,
                status: 'rejected' as const,
                reviewed_by: currentUser?.full_name || 'Admin User',
                reviewed_date: new Date().toISOString(),
                notes: notes || 'Request rejected by administrator'
              }
            : request
        )
        
        setLeaveRequests(updatedRequests)
        toast.success('Leave request rejected')
      } else {
        toast.error('Failed to reject leave request: ' + result.error)
      }
    } catch (error) {
      console.error('Error rejecting leave request:', error)
      toast.error('Failed to reject leave request')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <span>✅</span>
      case 'rejected': return <span>❌</span>
      case 'pending': return <span>⏳</span>
      default: return <span>⏳</span>
    }
  }

  const getLeaveTypeColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-800'
      case 'red': return 'bg-red-100 text-red-800'
      case 'orange': return 'bg-orange-100 text-orange-800'
      case 'purple': return 'bg-purple-100 text-purple-800'
      case 'green': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const openDetailModal = (request: LeaveRequest) => {
    setSelectedRequest(request)
    setIsDetailModalOpen(true)
  }

  const getStats = () => {
    return {
      total: leaveRequests.length,
      pending: leaveRequests.filter(r => r.status === 'pending').length,
      approved: leaveRequests.filter(r => r.status === 'approved').length,
      rejected: leaveRequests.filter(r => r.status === 'rejected').length
    }
  }

  const stats = getStats()

  // Tab Components
  const LeaveRequestsTab = () => (
    <>
      {/* Filters */}
      <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                <Input
                  placeholder="Search by employee name, ID, or leave type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <span className="mr-2">🔽</span>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests */}
      <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📅</span>
            Leave Requests
            <Badge variant="secondary" className="ml-auto">
              {filteredRequests.length} requests
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500 dark:text-gray-400">No leave requests found</p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  onClick={() => openDetailModal(request)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {request.user?.full_name.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {request.user?.full_name}
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-1 rounded-full font-medium">
                          {request.user?.primary_role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>ID: {request.user?.employee_id}</span>
                        {request.user?.ic_number && (
                          <span>IC: {request.user.ic_number}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <span>📅</span>
                          {formatDate(request.start_date)} - {formatDate(request.end_date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>⏰</span>
                          {request.days_count} day{request.days_count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge className={getLeaveTypeColor(request.leave_type?.color || 'gray')}>
                      {request.leave_type?.name}
                    </Badge>
                    
                    <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                      {getStatusIcon(request.status)}
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApproveRequest(request.id)
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRejectRequest(request.id)
                          }}
                          className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1"
                        >
                          <span className="mr-1">❌</span>
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )

  const CurrentlyOnLeaveTab = () => (
    <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Currently on Leave
          <Badge variant="secondary" className="ml-auto">
            {currentlyOnLeave.length} employees
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentlyOnLeave.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏠</div>
              <p className="text-gray-500 dark:text-gray-400">No employees currently on leave</p>
            </div>
          ) : (
            currentlyOnLeave.map((employee) => (
              <div key={employee.user_id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {employee.user_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {employee.user_name}
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-1 rounded-full font-medium">
                        {employee.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>ID: {employee.employee_id}</span>
                      {employee.ic_number && (
                        <span>IC: {employee.ic_number}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(employee.start_date)} - {formatDate(employee.end_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {employee.days_remaining} day{employee.days_remaining !== 1 ? 's' : ''} remaining
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge className={getLeaveTypeColor(employee.leave_type_color || 'gray')}>
                    {employee.leave_type_name}
                  </Badge>
                  
                  <Badge className="bg-purple-100 text-purple-800">
                    On Leave
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )

  const UserQuotasTab = () => (
    <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          User Leave Quotas
          <Badge variant="secondary" className="ml-auto">
            {userQuotas.length} users
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userQuotas.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📈</div>
              <p className="text-gray-500 dark:text-gray-400">No quota data available</p>
            </div>
          ) : (
            userQuotas.map((userQuota) => (
              <div key={userQuota.user_id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {userQuota.user_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {userQuota.user_name}
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-1 rounded-full font-medium">
                        {userQuota.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>ID: {userQuota.employee_id}</span>
                      {userQuota.ic_number && (
                        <span>IC: {userQuota.ic_number}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        {userQuota.total_used || 0} days used this year
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {userQuota.total_remaining || 0} days remaining
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      of {userQuota.total_quota || 0} allocated
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedUserQuota(userQuota)
                      setShowQuotaModal(true)
                    }}
                    className="ml-2"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )

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
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl p-6 border-0 shadow-lg header-card">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Leave Management</h1>
              <p className="opacity-90">Review and manage leave requests for your institution</p>
            </div>
            <div className="mt-4 lg:mt-0 text-center">
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-sm opacity-70">Pending Requests</div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant={activeTab === 'requests' ? 'default' : 'outline'}
              onClick={() => setActiveTab('requests')}
              className={`${activeTab === 'requests' ? 'bg-white text-gray-900' : 'bg-white/20 text-white border-white/30 hover:bg-white/30'}`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Leave Requests ({stats.pending})
            </Button>
            <Button
              variant={activeTab === 'on-leave' ? 'default' : 'outline'}
              onClick={() => setActiveTab('on-leave')}
              className={`${activeTab === 'on-leave' ? 'bg-white text-gray-900' : 'bg-white/20 text-white border-white/30 hover:bg-white/30'}`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Currently on Leave ({currentlyOnLeave.length})
            </Button>
            <Button
              variant={activeTab === 'quotas' ? 'default' : 'outline'}
              onClick={() => setActiveTab('quotas')}
              className={`${activeTab === 'quotas' ? 'bg-white text-gray-900' : 'bg-white/20 text-white border-white/30 hover:bg-white/30'}`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              User Quotas ({userQuotas.length})
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Total Requests</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-amber-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">{stats.pending}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Pending</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{stats.approved}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Approved</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">{stats.rejected}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Rejected</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{currentlyOnLeave.length}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">On Leave Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Content */}
        {activeTab === 'requests' && <LeaveRequestsTab />}
        {activeTab === 'on-leave' && <CurrentlyOnLeaveTab />}
        {activeTab === 'quotas' && <UserQuotasTab />}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                  {selectedRequest.user?.full_name.charAt(0) || 'U'}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedRequest.user?.full_name}
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <div>{selectedRequest.user?.employee_id} • {selectedRequest.user?.primary_role}</div>
                  {selectedRequest.user?.ic_number && (
                    <div className="flex items-center justify-center">
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600">
                        IC: {selectedRequest.user.ic_number}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <div className="text-sm text-blue-600 dark:text-blue-400">Start Date</div>
                  <div className="font-semibold text-blue-800 dark:text-blue-200">
                    {formatDate(selectedRequest.start_date)}
                  </div>
                </div>
                <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                  <div className="text-sm text-indigo-600 dark:text-indigo-400">End Date</div>
                  <div className="font-semibold text-indigo-800 dark:text-indigo-200">
                    {formatDate(selectedRequest.end_date)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Leave Type:</span>
                <Badge className={getLeaveTypeColor(selectedRequest.leave_type?.color || 'gray')}>
                  {selectedRequest.leave_type?.name}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Duration:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedRequest.days_count} day{selectedRequest.days_count !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                <Badge className={`${getStatusColor(selectedRequest.status)} flex items-center gap-1`}>
                  {getStatusIcon(selectedRequest.status)}
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason:</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {selectedRequest.reason}
                </p>
              </div>
              
              {/* File Attachments Section */}
              {(selectedRequest.medical_certificate_url || (selectedRequest.attachments && (typeof selectedRequest.attachments === 'string' ? selectedRequest.attachments : selectedRequest.attachments.length > 0))) && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <span>📎</span>
                    Supporting Documents
                  </label>
                  <div className="space-y-2">
                    {selectedRequest.medical_certificate_url && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 text-sm">🏥</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">Medical Certificate</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">PDF Document</div>
                        </div>
                        <a 
                          href={selectedRequest.medical_certificate_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          View
                        </a>
                      </div>
                    )}
                    
                    {selectedRequest.attachments && (
                      <>
                        {typeof selectedRequest.attachments === 'string' ? (
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center">
                              <span className="text-gray-600 dark:text-gray-400 text-sm">📄</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">Attachment</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Document</div>
                            </div>
                            <a 
                              href={selectedRequest.attachments} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                            >
                              View
                            </a>
                          </div>
                        ) : (
                          selectedRequest.attachments.map((attachment, index) => {
                            const getFileIcon = (fileName?: string) => {
                              if (!fileName) return '📄'
                              const ext = fileName.toLowerCase().split('.').pop()
                              switch (ext) {
                                case 'pdf': return '📄'
                                case 'doc': case 'docx': return '📝'
                                case 'txt': return '📃'
                                case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️'
                                default: return '📄'
                              }
                            }
                            
                            return (
                              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded flex items-center justify-center">
                                  <span className="text-gray-600 dark:text-gray-400 text-sm">{getFileIcon(attachment.fileName)}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {attachment.fileName || 'Document'}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {attachment.fileType || 'File'}
                                    {attachment.uploadedAt && ` • ${formatDate(attachment.uploadedAt)}`}
                                  </div>
                                </div>
                                {attachment.fileUrl && (
                                  <a 
                                    href={attachment.fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                                  >
                                    View
                                  </a>
                                )}
                              </div>
                            )
                          })
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Applied on: {formatDateTime(selectedRequest.applied_date)}
              </div>
              
              {selectedRequest.reviewed_by && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Reviewed by: {selectedRequest.reviewed_by} on {formatDateTime(selectedRequest.reviewed_date!)}
                </div>
              )}
              
              {selectedRequest.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin Notes:</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                    {selectedRequest.notes}
                  </p>
                </div>
              )}
              
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={() => {
                      handleApproveRequest(selectedRequest.id)
                      setIsDetailModalOpen(false)
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      handleRejectRequest(selectedRequest.id)
                      setIsDetailModalOpen(false)
                    }}
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Quota Details Modal */}
      <Dialog open={showQuotaModal} onOpenChange={setShowQuotaModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Leave Quota Details
            </DialogTitle>
          </DialogHeader>
          {selectedUserQuota && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                  {selectedUserQuota.user_name?.charAt(0) || 'U'}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedUserQuota.user_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedUserQuota.employee_id} • {selectedUserQuota.role}
                </p>
              </div>
              
              {/* Quota Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedUserQuota.total_quota || 0}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Total Allocated</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {selectedUserQuota.total_used || 0}
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">Days Used</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {selectedUserQuota.total_remaining || 0}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">Remaining</div>
                </div>
              </div>
              
              {/* Leave Type Breakdown */}
              {selectedUserQuota.leave_types && selectedUserQuota.leave_types.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Leave Type Breakdown</h4>
                  <div className="space-y-3">
                    {selectedUserQuota.leave_types.map((leaveType: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={getLeaveTypeColor(leaveType.color || 'gray')}>
                            {leaveType.name}
                          </Badge>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {leaveType.used || 0} / {leaveType.quota || 0} days
                          </div>
                          <div className="text-xs text-gray-500">
                            {leaveType.remaining || 0} remaining
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recent Leave History */}
              {selectedUserQuota.recent_leaves && selectedUserQuota.recent_leaves.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent Leave History</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedUserQuota.recent_leaves.map((leave: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 text-xs bg-gray-50 dark:bg-gray-700 rounded">
                        <div>
                          <span className="font-medium">{leave.leave_type_name}</span>
                          <span className="text-gray-500 ml-2">
                            {formatDate(leave.start_date)} - {formatDate(leave.end_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{leave.days_count} day{leave.days_count !== 1 ? 's' : ''}</span>
                          <Badge className={getStatusColor(leave.status)}>
                            {leave.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
