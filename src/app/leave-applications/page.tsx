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
import { 
  Search, Filter, Calendar, User, CheckCircle, XCircle, Clock, 
  FileText, Eye, MessageSquare, Users, RefreshCw, Download,
  CalendarDays, AlertCircle, UserCheck
} from 'lucide-react'

type LeaveApplication = {
  id: string
  applicationNumber: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approvalLevel: number
  appliedDate: string
  approvedDate: string | null
  rejectedDate: string | null
  approvalComments: string | null
  rejectionReason: string | null
  halfDayStart: boolean | null
  halfDayEnd: boolean | null
  emergencyContact: any
  handoverNotes: string | null
  medicalCertificateUrl: string | null
  supportingDocumentsUrls: string[] | null
  createdAt: string
  updatedAt: string
  currentApproverId: string | null
  user: {
    id: string
    fullName: string
    employeeId: string
    primaryRole: string
    email: string
    phone: string
  } | null
  leaveType: {
    id: string
    name: string
    code: string
    color: string
    isPaid: boolean
    icon: string
  } | null
  approvalWorkflow: Array<{
    id: string
    approvalLevel: number
    status: string
    decisionDate: string | null
    comments: string | null
    approverId: string | null
    approverRole: string | null
    approver: {
      id: string
      fullName: string
      primaryRole: string
    } | null
  }>
}

export default function LeaveApplicationsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [applications, setApplications] = useState<LeaveApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<LeaveApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve')
  const [approvalComments, setApprovalComments] = useState('')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  })

  useEffect(() => {
    initializeData()
  }, [])

  useEffect(() => {
    filterApplications()
    calculateStats()
  }, [applications, searchTerm, statusFilter])

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
      
      console.log('👤 Found current user for Leave Applications:', user)
      
      if (user) {
        setCurrentUser(user)
        await loadApplications(user.institution_id)
      }
    } catch (error) {
      console.error('Error initializing leave applications data:', error)
      toast.error('Failed to load leave applications data')
    } finally {
      setLoading(false)
    }
  }

  const loadApplications = async (institutionId: string) => {
    try {
      console.log('Loading leave applications for institution:', institutionId)
      
      const response = await fetch(`/api/leave/applications?institution_id=${institutionId}&limit=100`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leave applications')
      }
      
      console.log('Leave applications loaded:', data.data?.length || 0)
      setApplications(data.data || [])
    } catch (error) {
      console.error('Error loading leave applications:', error)
      toast.error('Failed to load leave applications')
    }
  }

  const filterApplications = () => {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.user?.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.reason.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    // Sort by created date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setFilteredApplications(filtered)
  }

  const calculateStats = () => {
    setStats({
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    })
  }

  const handleApprovalAction = async () => {
    try {
      if (!selectedApplication || !currentUser) return

      const response = await fetch('/api/leave/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: selectedApplication.id,
          action: approvalAction,
          comments: approvalComments,
          approverId: currentUser.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${approvalAction} leave application`)
      }

      // Reload applications
      await loadApplications(currentUser.institution_id)
      
      setIsApprovalModalOpen(false)
      setApprovalComments('')
      setSelectedApplication(null)
      toast.success(`Leave application ${approvalAction}ed successfully`)

    } catch (error) {
      console.error(`Error ${approvalAction}ing leave application:`, error)
      toast.error(`Failed to ${approvalAction} leave application`)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, text: 'Cancelled' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    )
  }

  const getLeaveTypeColor = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      purple: 'bg-purple-100 text-purple-800',
      pink: 'bg-pink-100 text-pink-800',
      indigo: 'bg-indigo-100 text-indigo-800'
    }
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const openDetailModal = (application: LeaveApplication) => {
    setSelectedApplication(application)
    setIsDetailModalOpen(true)
  }

  const openApprovalModal = (application: LeaveApplication, action: 'approve' | 'reject') => {
    setSelectedApplication(application)
    setApprovalAction(action)
    setIsApprovalModalOpen(true)
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
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl p-6 border-0 shadow-lg header-card">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <FileText className="w-8 h-8" />
                Leave Applications
              </h1>
              <p className="text-gray-600 dark:text-purple-200/90">Manage and approve leave requests from your team</p>
            </div>
            <div className="mt-4 lg:mt-0 flex gap-3">
              <Button
                variant="outline"
                onClick={() => loadApplications(currentUser?.institution_id)}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Total Applications</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-amber-600 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
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
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by application number, employee name, or reason..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <div className="grid gap-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No leave applications found</p>
                <p className="text-sm text-gray-500 mt-2">Applications will appear here when submitted</p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">{application.user?.fullName}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">({application.user?.employeeId})</span>
                        </div>
                        <Badge variant="outline">{application.user?.primaryRole}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{application.leaveType?.icon}</span>
                          <Badge className={getLeaveTypeColor(application.leaveType?.color || 'blue')}>
                            {application.leaveType?.name}
                          </Badge>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(application.startDate)} - {formatDate(application.endDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-4 h-4" />
                          {application.totalDays} day{application.totalDays !== 1 ? 's' : ''}
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Application #{application.applicationNumber}</strong>
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {application.reason}
                      </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetailModal(application)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                      
                      {application.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => openApprovalModal(application, 'approve')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => openApprovalModal(application, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Leave Application Details</DialogTitle>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-6">
                {/* Application Header */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
                      Application #{selectedApplication.applicationNumber}
                    </h3>
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Applied Date:</strong> {formatDate(selectedApplication.appliedDate)}
                    </div>
                    <div>
                      <strong>Total Days:</strong> {selectedApplication.totalDays}
                    </div>
                    <div>
                      <strong>Leave Dates:</strong> {formatDate(selectedApplication.startDate)} - {formatDate(selectedApplication.endDate)}
                    </div>
                    <div>
                      <strong>Leave Type:</strong> 
                      <Badge className={`ml-2 ${getLeaveTypeColor(selectedApplication.leaveType?.color || 'blue')}`}>
                        {selectedApplication.leaveType?.icon} {selectedApplication.leaveType?.name}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Employee Information */}
                <div>
                  <h4 className="font-semibold mb-3">Employee Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Name:</strong> {selectedApplication.user?.fullName}</div>
                    <div><strong>Employee ID:</strong> {selectedApplication.user?.employeeId}</div>
                    <div><strong>Role:</strong> {selectedApplication.user?.primaryRole}</div>
                    <div><strong>Email:</strong> {selectedApplication.user?.email}</div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <h4 className="font-semibold mb-3">Reason for Leave</h4>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded border-l-4 border-blue-500">
                    {selectedApplication.reason}
                  </p>
                </div>

                {/* Approval Status */}
                {selectedApplication.status === 'approved' && selectedApplication.approvalComments && (
                  <div>
                    <h4 className="font-semibold mb-3 text-green-700">Approval Comments</h4>
                    <p className="text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded border-l-4 border-green-500">
                      {selectedApplication.approvalComments}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Approved on {formatDate(selectedApplication.approvedDate!)}
                    </p>
                  </div>
                )}

                {selectedApplication.status === 'rejected' && selectedApplication.rejectionReason && (
                  <div>
                    <h4 className="font-semibold mb-3 text-red-700">Rejection Reason</h4>
                    <p className="text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded border-l-4 border-red-500">
                      {selectedApplication.rejectionReason}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Rejected on {formatDate(selectedApplication.rejectedDate!)}
                    </p>
                  </div>
                )}

                {/* Additional Information */}
                {(selectedApplication.handoverNotes || selectedApplication.emergencyContact) && (
                  <div>
                    <h4 className="font-semibold mb-3">Additional Information</h4>
                    {selectedApplication.handoverNotes && (
                      <div className="mb-3">
                        <strong className="text-sm">Handover Notes:</strong>
                        <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded mt-1">
                          {selectedApplication.handoverNotes}
                        </p>
                      </div>
                    )}
                    {selectedApplication.emergencyContact && (
                      <div>
                        <strong className="text-sm">Emergency Contact:</strong>
                        <p className="text-sm text-gray-600 mt-1">
                          {JSON.stringify(selectedApplication.emergencyContact)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Documents */}
                {(selectedApplication.medicalCertificateUrl || selectedApplication.supportingDocumentsUrls?.length) && (
                  <div>
                    <h4 className="font-semibold mb-3">Documents</h4>
                    <div className="space-y-2">
                      {selectedApplication.medicalCertificateUrl && (
                        <div>
                          <a
                            href={selectedApplication.medicalCertificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            📄 Medical Certificate
                          </a>
                        </div>
                      )}
                      {selectedApplication.supportingDocumentsUrls?.map((url, index) => (
                        <div key={index}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            📎 Supporting Document {index + 1}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Approval Modal */}
        <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {approvalAction === 'approve' ? 'Approve' : 'Reject'} Leave Application
              </DialogTitle>
            </DialogHeader>
            
            {selectedApplication && (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="text-sm space-y-2">
                    <div><strong>Employee:</strong> {selectedApplication.user?.fullName}</div>
                    <div><strong>Application:</strong> #{selectedApplication.applicationNumber}</div>
                    <div><strong>Leave Type:</strong> {selectedApplication.leaveType?.name}</div>
                    <div><strong>Duration:</strong> {formatDate(selectedApplication.startDate)} - {formatDate(selectedApplication.endDate)} ({selectedApplication.totalDays} days)</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {approvalAction === 'approve' ? 'Approval Comments' : 'Rejection Reason'} (Optional)
                  </label>
                  <Textarea
                    placeholder={approvalAction === 'approve' 
                      ? 'Add any comments about this approval...' 
                      : 'Please provide a reason for rejection...'
                    }
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsApprovalModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                    variant={approvalAction === 'approve' ? 'default' : 'destructive'}
                    onClick={handleApprovalAction}
                  >
                    {approvalAction === 'approve' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Application
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Application
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}