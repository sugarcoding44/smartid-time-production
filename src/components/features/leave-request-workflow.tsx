'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Send
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

type LeaveRequest = {
  id: string
  userId: string
  userDetails: {
    full_name: string
    employee_id: string
    department: string
    profile_picture?: string
  }
  leaveTypeId: string
  leaveType: {
    name: string
    days_allowed: number
    requires_approval: boolean
    color: string
  }
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  requestedAt: string
  reviewedAt?: string
  reviewedBy?: {
    full_name: string
    employee_id: string
  }
  reviewComments?: string
  emergencyContact?: string
  attachments?: Array<{
    id: string
    filename: string
    url: string
  }>
  comments?: Array<{
    id: string
    author: string
    message: string
    timestamp: string
    isManager: boolean
  }>
}

type LeaveStats = {
  totalRequests: number
  pendingReviews: number
  approvedThisMonth: number
  rejectedThisMonth: number
  averageResponseTime: number
}

export function LeaveRequestWorkflow() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [stats, setStats] = useState<LeaveStats>({
    totalRequests: 0,
    pendingReviews: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    averageResponseTime: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isManager, setIsManager] = useState(false)

  // Form states
  const [newRequest, setNewRequest] = useState({
    leaveTypeId: '',
    startDate: new Date(),
    endDate: new Date(),
    reason: '',
    emergencyContact: ''
  })
  const [reviewData, setReviewData] = useState({
    status: 'approved' as 'approved' | 'rejected',
    comments: ''
  })

  useEffect(() => {
    loadLeaveRequests()
    loadCurrentUser()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .or(`auth_user_id.eq.${authUser.id},id.eq.${authUser.id}`)
          .single()
        
        if (userData) {
          setCurrentUser(userData)
          setIsManager(['admin', 'manager'].includes(userData.primary_role?.toLowerCase() || '') || 
                      ['admin', 'manager'].includes(userData.smartid_time_role?.toLowerCase() || ''))
        }
      }
    } catch (error) {
      console.error('Error loading current user:', error)
    }
  }

  const loadLeaveRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/leave-requests')
      const result = await response.json()

      if (result.success) {
        setRequests(result.requests || [])
        setStats(result.stats || stats)
      } else {
        toast.error('Failed to load leave requests')
      }
    } catch (error) {
      console.error('Error loading leave requests:', error)
      toast.error('Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  const submitLeaveRequest = async () => {
    try {
      if (!newRequest.leaveTypeId || !newRequest.reason.trim()) {
        toast.error('Please fill in all required fields')
        return
      }

      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRequest,
          userId: currentUser?.id
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Leave request submitted successfully')
        setIsRequestModalOpen(false)
        setNewRequest({
          leaveTypeId: '',
          startDate: new Date(),
          endDate: new Date(),
          reason: '',
          emergencyContact: ''
        })
        loadLeaveRequests()
      } else {
        toast.error(result.error || 'Failed to submit leave request')
      }
    } catch (error) {
      console.error('Error submitting leave request:', error)
      toast.error('Failed to submit leave request')
    }
  }

  const reviewRequest = async () => {
    try {
      if (!selectedRequest || !reviewData.comments.trim()) {
        toast.error('Please add review comments')
        return
      }

      const response = await fetch(`/api/leave-requests/${selectedRequest.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reviewData,
          reviewerId: currentUser?.id
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`Leave request ${reviewData.status}`)
        setIsReviewModalOpen(false)
        setSelectedRequest(null)
        setReviewData({ status: 'approved', comments: '' })
        loadLeaveRequests()
      } else {
        toast.error(result.error || 'Failed to review request')
      }
    } catch (error) {
      console.error('Error reviewing request:', error)
      toast.error('Failed to review request')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'cancelled': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.userDetails.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userDetails.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leave Request Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Submit and manage leave requests with approval workflow
          </p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Submit Leave Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={newRequest.leaveTypeId} onValueChange={(value) => 
                  setNewRequest({...newRequest, leaveTypeId: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual Leave</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal Leave</SelectItem>
                    <SelectItem value="emergency">Emergency Leave</SelectItem>
                  </SelectContent>
                </Select>

                <DatePickerWithRange 
                  date={{ from: newRequest.startDate, to: newRequest.endDate }}
                  onDateChange={(range) => 
                    setNewRequest({
                      ...newRequest, 
                      startDate: range?.from || new Date(),
                      endDate: range?.to || new Date()
                    })
                  }
                />

                <Textarea
                  placeholder="Reason for leave request..."
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                  rows={3}
                />

                <Input
                  placeholder="Emergency contact (optional)"
                  value={newRequest.emergencyContact}
                  onChange={(e) => setNewRequest({...newRequest, emergencyContact: e.target.value})}
                />

                <div className="flex gap-3">
                  <Button onClick={submitLeaveRequest} className="flex-1">
                    Submit Request
                  </Button>
                  <Button variant="outline" onClick={() => setIsRequestModalOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalRequests}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Reviews</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingReviews}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approved This Month</p>
                <p className="text-3xl font-bold text-green-600">{stats.approvedThisMonth}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
                <p className="text-3xl font-bold text-purple-600">{stats.averageResponseTime}h</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {request.userDetails.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {request.userDetails.full_name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {request.userDetails.employee_id} • {request.userDetails.department}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-500">
                        {request.leaveType.name} • {request.totalDays} days
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                        {getStatusIcon(request.status)}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {isManager && request.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request)
                            setIsReviewModalOpen(true)
                          }}
                        >
                          Review
                        </Button>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Reason:</strong> {request.reason}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">No leave requests found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Leave Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p><strong>Employee:</strong> {selectedRequest.userDetails.full_name}</p>
                <p><strong>Leave Type:</strong> {selectedRequest.leaveType.name}</p>
                <p><strong>Duration:</strong> {selectedRequest.totalDays} days</p>
                <p><strong>Dates:</strong> {new Date(selectedRequest.startDate).toLocaleDateString()} - {new Date(selectedRequest.endDate).toLocaleDateString()}</p>
              </div>

              <Select value={reviewData.status} onValueChange={(value: 'approved' | 'rejected') => 
                setReviewData({...reviewData, status: value})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approve</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Add your review comments..."
                value={reviewData.comments}
                onChange={(e) => setReviewData({...reviewData, comments: e.target.value})}
                rows={4}
              />

              <div className="flex gap-3">
                <Button onClick={reviewRequest} className="flex-1">
                  Submit Review
                </Button>
                <Button variant="outline" onClick={() => setIsReviewModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}