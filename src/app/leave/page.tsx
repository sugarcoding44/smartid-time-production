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
import { FileText, AlertTriangle, CheckCircle, XCircle, Check, Grid3X3, List } from 'lucide-react'

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

  useEffect(() => {
    initializeData()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [leaveRequests, searchTerm, statusFilter])

  const initializeData = async () => {
    try {
      setLoading(true)
      
      // Get current user info from debug endpoint
      const debugResponse = await fetch('/api/debug/supabase')
      const debugData = await debugResponse.json()
      
      // Get the actual authenticated user ID
      const authTest = debugData.tests.find((t: any) => t.name === 'Auth Session')
      const currentAuthUserId = authTest?.data?.userId
      
      if (!currentAuthUserId) {
        toast.error('Authentication required')
        return
      }
      
      // Find the actual current user from service test data
      const serviceTest = debugData.tests.find((t: any) => t.name === 'Service Role Client')
      const allUsers = serviceTest?.data || []
      
      let user = allUsers.find((u: any) => u.auth_user_id === currentAuthUserId)
      if (!user) {
        user = allUsers.find((u: any) => u.id === currentAuthUserId)
      }
      
      if (user) {
        setCurrentUser(user)
        await loadLeaveRequests(user.institution_id)
        await loadLeaveTypes(user.institution_id)
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
      // Mock leave requests data - in real implementation, fetch from /api/leave-requests
      const mockRequests: LeaveRequest[] = [
        {
          id: '1',
          user_id: '1',
          user: {
            full_name: 'John Doe',
            employee_id: 'TC001',
            primary_role: 'teacher'
          },
          leave_type_id: '1',
          leave_type: {
            name: 'Annual Leave',
            color: 'blue'
          },
          start_date: '2024-02-15',
          end_date: '2024-02-19',
          days_count: 5,
          reason: 'Family vacation planned for Chinese New Year',
          status: 'pending',
          applied_date: '2024-01-20T10:30:00Z'
        },
        {
          id: '2',
          user_id: '2',
          user: {
            full_name: 'Jane Smith',
            employee_id: 'ST001',
            primary_role: 'staff'
          },
          leave_type_id: '2',
          leave_type: {
            name: 'Sick Leave',
            color: 'red'
          },
          start_date: '2024-01-25',
          end_date: '2024-01-26',
          days_count: 2,
          reason: 'Flu symptoms and doctor consultation required',
          status: 'approved',
          applied_date: '2024-01-24T08:15:00Z',
          reviewed_by: 'Admin User',
          reviewed_date: '2024-01-24T14:30:00Z'
        },
        {
          id: '3',
          user_id: '3',
          user: {
            full_name: 'Alice Brown',
            employee_id: 'TC002',
            primary_role: 'teacher'
          },
          leave_type_id: '3',
          leave_type: {
            name: 'Emergency Leave',
            color: 'orange'
          },
          start_date: '2024-01-30',
          end_date: '2024-01-30',
          days_count: 1,
          reason: 'Family emergency requiring immediate attention',
          status: 'rejected',
          applied_date: '2024-01-29T16:45:00Z',
          reviewed_by: 'Admin User',
          reviewed_date: '2024-01-30T09:00:00Z',
          notes: 'Insufficient documentation provided'
        }
      ]
      
      setLeaveRequests(mockRequests)
    } catch (error) {
      console.error('Error loading leave requests:', error)
      toast.error('Failed to load leave requests')
    }
  }

  const loadLeaveTypes = async (institutionId: string) => {
    try {
      // Mock leave types data - in real implementation, fetch from /api/leave-types
      const mockLeaveTypes: LeaveType[] = [
        {
          id: '1',
          name: 'Annual Leave',
          max_days: 21,
          carry_forward: true,
          color: 'blue'
        },
        {
          id: '2',
          name: 'Sick Leave',
          max_days: 14,
          carry_forward: false,
          color: 'red'
        },
        {
          id: '3',
          name: 'Emergency Leave',
          max_days: 5,
          carry_forward: false,
          color: 'orange'
        },
        {
          id: '4',
          name: 'Maternity Leave',
          max_days: 90,
          carry_forward: false,
          color: 'purple'
        }
      ]
      
      setLeaveTypes(mockLeaveTypes)
    } catch (error) {
      console.error('Error loading leave types:', error)
      toast.error('Failed to load leave types')
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
      // Mock approve - in real implementation, call /api/leave-requests/:id/approve
      const updatedRequests = leaveRequests.map(request =>
        request.id === requestId
          ? {
              ...request,
              status: 'approved' as const,
              reviewed_by: currentUser?.name || 'Admin User',
              reviewed_date: new Date().toISOString()
            }
          : request
      )
      
      setLeaveRequests(updatedRequests)
      toast.success('Leave request approved successfully')
    } catch (error) {
      console.error('Error approving leave request:', error)
      toast.error('Failed to approve leave request')
    }
  }

  const handleRejectRequest = async (requestId: string, notes?: string) => {
    try {
      // Mock reject - in real implementation, call /api/leave-requests/:id/reject
      const updatedRequests = leaveRequests.map(request =>
        request.id === requestId
          ? {
              ...request,
              status: 'rejected' as const,
              reviewed_by: currentUser?.name || 'Admin User',
              reviewed_date: new Date().toISOString(),
              notes: notes || 'Request rejected by administrator'
            }
          : request
      )
      
      setLeaveRequests(updatedRequests)
      toast.success('Leave request rejected')
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
        <div className="bg-white dark:bg-gradient-to-br dark:from-violet-900 dark:to-purple-900 rounded-2xl p-6 border-0 shadow-lg dark:border dark:border-purple-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leave Management 📋</h1>
              <p className="text-gray-600 dark:text-purple-200/90">Review and manage leave requests for your institution</p>
            </div>
            <div className="mt-4 lg:mt-0 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</div>
              <div className="text-sm text-gray-500 dark:text-purple-200/70">Pending Requests</div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
            </CardContent>
          </Card>
        </div>

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
                          <Badge variant="outline" className="text-xs">
                            {request.user?.employee_id}
                          </Badge>
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedRequest.user?.employee_id} • {selectedRequest.user?.primary_role}
                </p>
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
    </DashboardLayout>
  )
}
