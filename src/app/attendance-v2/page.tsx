'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Users, CheckCircle, XCircle, Clock, BarChart3, Calendar, Search, TrendingUp, Activity, Timer, UserCheck, AlertTriangle, Download, Plus, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import * as XLSX from 'xlsx'

type AttendanceRecord = {
  id: string
  userId: string
  userName: string
  employeeId: string
  icNumber?: string
  role: string
  checkInTime: string | null
  checkOutTime: string | null
  workHours: number | null
  actualWorkingHours?: number | null
  overtimeHours?: number | null
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'on_leave' | 'in_progress' | 'completed' | 'pending_approval'
  date: string
  verificationMethod?: string
  location?: {
    latitude: number
    longitude: number
    address?: string
    accuracy?: number
  } | null
}

type AttendanceStats = {
  totalUsers: number
  presentToday: number
  absentToday: number
  lateToday: number
  onLeaveToday: number
  averageWorkingHours: number
}

type AttendanceAnalytics = {
  averageCheckInTime: string | null
  peakActivityHour: string
  attendanceRate: number
  punctualityRate: number
  totalUsers: number
  presentUsers: number
  lateUsers: number
  absentUsers: number
  earlyLeaveUsers: number
  workingHoursDistribution: {
    underTime: number
    normalTime: number
    overTime: number
  }
  checkInTimes: number[]
  checkOutTimes: number[]
}

export default function AttendanceV2Page() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats>({ 
    totalUsers: 0, 
    presentToday: 0, 
    absentToday: 0, 
    lateToday: 0,
    onLeaveToday: 0,
    averageWorkingHours: 0 
  })
  const [analytics, setAnalytics] = useState<AttendanceAnalytics>({ 
    averageCheckInTime: null, 
    peakActivityHour: 'N/A', 
    attendanceRate: 0, 
    punctualityRate: 0, 
    totalUsers: 0,
    presentUsers: 0,
    lateUsers: 0,
    absentUsers: 0,
    earlyLeaveUsers: 0,
    workingHoursDistribution: {
      underTime: 0,
      normalTime: 0,
      overTime: 0
    },
    checkInTimes: [],
    checkOutTimes: []
  })
  const [loading, setLoading] = useState(true)
  const [isTypingDate, setIsTypingDate] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [dateChanged, setDateChanged] = useState(false)
  const [showManualLogModal, setShowManualLogModal] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState('')
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState(() => {
    // Ensure we always have a valid date - this is the date used for API calls
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [pendingDate, setPendingDate] = useState(() => {
    // This tracks what the user is typing/selecting before confirmation
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [institutionName, setInstitutionName] = useState('')

  // Validate date format
  const isValidDate = (dateString: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dateString)) return false
    
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }

  // Handle date input changes (no API calls, just update pending date)
  const handleDateInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setPendingDate(newValue)
    
    // Show that date has changed from current selection
    setDateChanged(newValue !== selectedDate)
    
    // Clear typing state once we have a complete date
    if (newValue.length === 10 && isValidDate(newValue)) {
      setIsTypingDate(false)
    } else {
      setIsTypingDate(newValue.length > 0 && newValue.length < 10)
    }
  }

  // Handle keyboard shortcuts for date confirmation
  const handleDateKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dateChanged) return
    
    if (event.key === 'Enter') {
      event.preventDefault()
      applyDateChange()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      resetDateChange()
    }
  }

  // Apply the pending date (triggers API calls)
  const applyDateChange = () => {
    if (!pendingDate) {
      toast.warning('Please select a date')
      return
    }
    
    if (!isValidDate(pendingDate)) {
      toast.error('Invalid date format. Please select a valid date.')
      // Reset to current selected date
      setPendingDate(selectedDate)
      setDateChanged(false)
      return
    }
    
    // Apply the date change
    setSelectedDate(pendingDate)
    setDateChanged(false)
    setIsTypingDate(false)
  }

  // Reset pending date to current selected date
  const resetDateChange = () => {
    setPendingDate(selectedDate)
    setDateChanged(false)
    setIsTypingDate(false)
  }


  // Initial data load and sync states
  useEffect(() => {
    // Sync pending date with selected date on mount
    setPendingDate(selectedDate)
    setDateChanged(false)
  }, [])

  // Load data when selectedDate changes (only happens on confirmation)
  useEffect(() => {
    if (selectedDate && isValidDate(selectedDate)) {
      loadAttendanceData()
      loadAnalytics()
    }
  }, [selectedDate])

  useEffect(() => {
    filterRecords()
    calculateStats()
  }, [attendanceRecords, searchTerm, statusFilter])

  const loadAttendanceData = async () => {
    try {
      setLoading(true)
      
      // Get current user institution
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        toast.error('Please sign in to view attendance')
        return
      }

      // Get institution name and user role
      const { data: currentUser } = await supabase
        .from('users')
        .select('institution_id, institutions(name), primary_role, smartid_time_role')
        .or(`auth_user_id.eq.${authUser.id},id.eq.${authUser.id}`)
        .single()

      if (currentUser?.institutions?.name) {
        setInstitutionName(currentUser.institutions.name)
      }
      
      // Set user role for manual logging access
      const userRole = currentUser?.smartid_time_role || currentUser?.primary_role || ''
      setCurrentUserRole(userRole)

      // Validate date before making API call
      if (!selectedDate || !isValidDate(selectedDate)) {
        toast.error('Invalid date selected')
        return
      }

      // Fetch attendance records
      const response = await fetch(`/api/attendance/records?date=${encodeURIComponent(selectedDate)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()

      if (result.success) {
        setAttendanceRecords(result.data || [])
        
        // If no attendance records exist, fetch users to show absent status
        if (result.data.length === 0) {
          await loadUsersWithNoAttendance()
        }
      } else {
        console.error('Failed to load attendance:', result.error)
        if (result.message?.includes('table not found')) {
          toast.warning('Attendance tracking not set up yet')
          await loadUsersWithNoAttendance()
        } else {
          toast.error('Failed to load attendance data')
        }
      }
    } catch (error) {
      console.error('Error loading attendance data:', error)
      toast.error('Failed to load attendance data')
    } finally {
      setLoading(false)
    }
  }

  const loadUsersWithNoAttendance = async () => {
    try {
      const response = await fetch('/api/users')
      const result = await response.json()
      
      if (result.success) {
        // Create absent records for all users
        const absentRecords: AttendanceRecord[] = (result.users || [])
          .filter((user: any) => ['time_web', 'time_mobile'].includes(user.primary_system))
          .map((user: any) => ({
            id: `absent-${user.id}`,
            userId: user.id,
            userName: user.full_name,
            employeeId: user.employee_id,
            icNumber: user.ic_number,
            role: user.smartid_time_role || user.primary_role,
            checkInTime: null,
            checkOutTime: null,
            workHours: null,
            status: 'absent' as const,
            date: selectedDate
          }))
        
        setAttendanceRecords(absentRecords)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadAnalytics = async () => {
    try {
      // Validate date before making API call
      if (!selectedDate || !isValidDate(selectedDate)) {
        console.warn('Invalid date for analytics:', selectedDate)
        return
      }

      const response = await fetch(`/api/attendance/daily-analytics?date=${encodeURIComponent(selectedDate)}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.analytics) {
        setAnalytics(result.analytics)
      } else {
        console.error('Failed to load analytics:', result.error)
        // Keep default analytics state on error
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      // Don't show error toast for analytics as it's not critical
    }
  }

  const filterRecords = () => {
    let filtered = [...attendanceRecords]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.icNumber && record.icNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter)
    }

    setFilteredRecords(filtered)
  }

  const calculateStats = () => {
    const total = new Set(attendanceRecords.map(r => r.userId)).size
    const present = attendanceRecords.filter(r => 
      ['present', 'late', 'in_progress', 'completed'].includes(r.status)
    ).length
    const absent = attendanceRecords.filter(r => r.status === 'absent').length
    const late = attendanceRecords.filter(r => r.status === 'late').length
    const onLeave = attendanceRecords.filter(r => r.status === 'on_leave').length
    
    const workingHours = attendanceRecords
      .filter(r => r.workHours !== null)
      .map(r => r.workHours!)
    
    const avgHours = workingHours.length > 0
      ? workingHours.reduce((a, b) => a + b, 0) / workingHours.length
      : 0

    setStats({
      totalUsers: total,
      presentToday: present,
      absentToday: absent,
      lateToday: late,
      onLeaveToday: onLeave,
      averageWorkingHours: avgHours
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      present: { label: 'Present', className: 'bg-green-100 text-green-800' },
      absent: { label: 'Absent', className: 'bg-red-100 text-red-800' },
      late: { label: 'Late', className: 'bg-yellow-100 text-yellow-800' },
      early_leave: { label: 'Early Leave', className: 'bg-orange-100 text-orange-800' },
      on_leave: { label: 'On Leave', className: 'bg-purple-100 text-purple-800' },
      in_progress: { label: 'Working', className: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
      pending_approval: { label: 'Pending Approval', className: 'bg-orange-100 text-orange-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-100 text-gray-800'
    }
    
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const formatTime = (time: string | null) => {
    if (!time) return '-'
    const date = new Date(time)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatWorkHours = (hours: number | null) => {
    if (hours === null) return '-'
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}m`
  }

  // Export to Excel function
  const exportToExcel = async () => {
    setIsExporting(true)
    
    try {
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Prepare data for export
      const exportData = filteredRecords.map(record => ({
        'Employee Name': record.userName,
        'Employee ID': record.employeeId,
        'Role': record.role,
        'Date': record.date,
        'Check In Time': record.checkInTime ? formatTime(record.checkInTime) : '-',
        'Check Out Time': record.checkOutTime ? formatTime(record.checkOutTime) : '-',
        'Work Hours': formatWorkHours(record.workHours),
        'Actual Working Hours': record.actualWorkingHours?.toFixed(2) || '-',
        'Overtime Hours': record.overtimeHours?.toFixed(2) || '-',
        'Status': record.status.replace('_', ' ').toUpperCase(),
        'Verification Method': record.verificationMethod?.replace('_', ' ') || '-',
        'Location': record.location ? 
          `Lat: ${record.location.latitude.toFixed(6)}, Lng: ${record.location.longitude.toFixed(6)}${record.location.address ? `, ${record.location.address}` : ''}` : 
          'No location data'
      }))

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(exportData)

      // Set column widths
      const columnWidths = [
        { wch: 25 }, // Employee Name
        { wch: 15 }, // Employee ID
        { wch: 20 }, // Role
        { wch: 12 }, // Date
        { wch: 15 }, // Check In Time
        { wch: 15 }, // Check Out Time
        { wch: 12 }, // Work Hours
        { wch: 18 }, // Actual Working Hours
        { wch: 15 }, // Overtime Hours
        { wch: 15 }, // Status
        { wch: 20 }, // Verification Method
        { wch: 50 }  // Location
      ]
      worksheet['!cols'] = columnWidths

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report')

      // Add summary sheet
      const summaryData = [
        { 'Metric': 'Total Users', 'Value': analytics?.totalUsers || 0 },
        { 'Metric': 'Present Users', 'Value': analytics?.presentUsers || 0 },
        { 'Metric': 'Absent Users', 'Value': analytics?.absentUsers || 0 },
        { 'Metric': 'Late Users', 'Value': analytics?.lateUsers || 0 },
        { 'Metric': 'Attendance Rate', 'Value': `${analytics?.attendanceRate || 0}%` },
        { 'Metric': 'Punctuality Rate', 'Value': `${analytics?.punctualityRate || 0}%` },
        { 'Metric': 'Average Check-in Time', 'Value': analytics?.averageCheckInTime || 'N/A' },
        { 'Metric': 'Peak Activity Hour', 'Value': analytics?.peakActivityHour || 'N/A' },
        { 'Metric': 'Average Working Hours', 'Value': formatWorkHours(stats?.averageWorkingHours || 0) }
      ]
      
      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
      summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 20 }]
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary')

      // Generate filename with date and institution
      const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-')
      
      const institutionPrefix = institutionName ? `${institutionName.replace(/[^a-zA-Z0-9]/g, '_')}_` : ''
      const filename = `${institutionPrefix}Attendance_Report_${formattedDate}.xlsx`

      // Save file
      XLSX.writeFile(workbook, filename)
      
      // Show success message with details
      const recordCount = filteredRecords.length
      const recordText = recordCount === 0 
        ? 'Empty attendance report exported'
        : `${recordCount} record${recordCount !== 1 ? 's' : ''} exported`
      
      toast.success(
        `✅ Attendance report exported successfully!\n` +
        `📊 ${recordText}\n` +
        `📁 File: ${filename}\n` +
        `📋 Includes: Data + Summary for ${new Date(selectedDate).toLocaleDateString()}`,
        { duration: 6000 }
      )
      
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export attendance report. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Load available users for manual logging
  const loadAvailableUsers = async () => {
    try {
      // Get current user to get institution ID
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        toast.error('Please sign in to load users')
        return
      }
      
      const { data: currentUser } = await supabase
        .from('users')
        .select('institution_id')
        .or(`auth_user_id.eq.${authUser.id},id.eq.${authUser.id}`)
        .single()
      
      if (!currentUser?.institution_id) {
        toast.error('Institution not found')
        return
      }
      
      const response = await fetch(`/api/users?institutionId=${currentUser.institution_id}`)
      const result = await response.json()
      
      if (result.success) {
        const timeUsers = (result.users || result.data || []).filter((user: any) => 
          ['time_web', 'time_mobile'].includes(user.primary_system)
        )
        // Sort users alphabetically by name for better UX
        timeUsers.sort((a: any, b: any) => 
          (a.full_name || '').localeCompare(b.full_name || '')
        )
        setAvailableUsers(timeUsers)
        console.log(`Loaded ${timeUsers.length} users for manual logging`)
      } else {
        console.error('Failed to load users:', result.error)
        toast.error('Failed to load users for manual logging')
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Error loading users')
    }
  }

  // Manual attendance logging
  const handleManualLog = async (logData: any) => {
    try {
      const response = await fetch('/api/attendance/manual-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...logData,
          date: selectedDate,
          logged_by: 'superadmin',
          verification_method: 'manual_entry'
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Attendance logged successfully!')
        loadAttendanceData() // Refresh data
        setShowManualLogModal(false)
      } else {
        toast.error(result.error || 'Failed to log attendance')
      }
    } catch (error) {
      console.error('Manual log error:', error)
      toast.error('Failed to log attendance')
    }
  }

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
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl p-6 border-0 shadow-lg header-card">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Attendance Management
              </h1>
              <p className="opacity-90">
                {institutionName ? `${institutionName} • ` : ''}Track and manage your team's daily attendance
              </p>
              <div className="mt-4 text-sm opacity-70">
                {isTypingDate ? (
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <span>✏️</span>
                    Typing date... ({pendingDate.length}/10 characters)
                  </span>
                ) : dateChanged ? (
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600 dark:text-orange-400">
                      ⚠️ Date changed - Click ✓ to apply
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span>
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 lg:mt-0">
              <div className="flex flex-col sm:flex-row gap-3" role="group" aria-label="Date and export controls">
                <div className="flex gap-3">
                <Input
                  type="date"
                  value={pendingDate}
                  onChange={handleDateInputChange}
                  onKeyDown={handleDateKeyDown}
                  className={`w-48 transition-colors ${
                    dateChanged 
                      ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950' 
                      : ''
                  }`}
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
                  aria-label="Select date for attendance records (Press Enter to apply, Escape to cancel)"
                />
                {/* Date confirmation buttons */}
                {dateChanged && (
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={applyDateChange}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white"
                      aria-label="Apply date change"
                    >
                      ✓
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={resetDateChange}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                      aria-label="Cancel date change"
                    >
                      ✕
                    </Button>
                  </div>
                )}
                </div>
                <div className="flex items-center gap-3">
                  {/* Manual Log Button (Admin/Superadmin only) */}
                  {(currentUserRole === 'superadmin' || currentUserRole === 'admin' || currentUserRole === 'teacher' || !currentUserRole) && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        loadAvailableUsers()
                        setShowManualLogModal(true)
                      }}
                      className="hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-700"
                      aria-label="Manually log attendance"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Manual Log
                    </Button>
                  )}
                  
                  <Button
                  type="button" 
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    exportToExcel()
                  }}
                  aria-label="Export attendance report to Excel"
                  disabled={isExporting}
                  className="hover:bg-green-50 dark:hover:bg-green-900 hover:border-green-300 dark:hover:border-green-700"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export to Excel
                    </>
                  )}
                </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{analytics?.totalUsers || 0}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Total Users</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{analytics?.presentUsers || 0}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Checked In</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                {analytics?.attendanceRate || 0}% attendance
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{(analytics?.presentUsers || 0) - (analytics?.lateUsers || 0)}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">On Time</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                {analytics?.punctualityRate || 0}% punctual
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-orange-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{analytics?.lateUsers || 0}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Late Arrivals</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">{analytics?.absentUsers || 0}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Absent</div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Average Check-in Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {analytics?.averageCheckInTime || '--:--'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Based on today's data
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Peak Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {analytics?.peakActivityHour || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Highest check-in volume
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Working Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                {(stats?.averageWorkingHours || 0).toFixed(1)}h
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Average daily hours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, employee ID, or IC number..."
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
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="in_progress">Working</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
          
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No records found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">No attendance records for the selected date and filters</p>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>• Try adjusting the date</p>
                  <p>• Change filter settings</p>
                  <p>• Check if employees have checked in</p>
                </div>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Employee</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Role</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Check In</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Check Out</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Work Hours</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Location</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left p-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                  {filteredRecords.map((record, index) => (
                    <tr key={record.id} className={`hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 dark:hover:from-slate-700/50 dark:hover:to-slate-600/50 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50/50 dark:bg-slate-700/30'
                    }`}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {record.userName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{record.userName}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                              <span>ID: {record.employeeId}</span>
                              {record.icNumber && (
                                <span>IC: {record.icNumber}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 capitalize">
                          {record.role}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                          {formatTime(record.checkInTime)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                          {formatTime(record.checkOutTime)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatWorkHours(record.workHours)}
                        </span>
                      </td>
                      <td className="p-4">
                        {record.location ? (
                          <div className="text-xs">
                            <div className="text-green-600 font-medium">📍 On-site</div>
                            {record.location.address && (
                              <div className="text-gray-500 truncate max-w-[120px]">
                                {record.location.address}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">No location</div>
                        )}
                      </td>
                      <td className="p-4">{getStatusBadge(record.status)}</td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRecord(record)}
                          className="hover:bg-emerald-50 dark:hover:bg-emerald-900 hover:border-emerald-300 dark:hover:border-emerald-700"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details Dialog */}
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Attendance Details</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Employee</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{selectedRecord.userName}</p>
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                        {selectedRecord.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>ID: {selectedRecord.employeeId}</span>
                      {selectedRecord.icNumber && (
                        <span>IC: {selectedRecord.icNumber}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{selectedRecord.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Check In Time</p>
                  <p className="font-medium">{formatTime(selectedRecord.checkInTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Check Out Time</p>
                  <p className="font-medium">{formatTime(selectedRecord.checkOutTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Work Hours</p>
                  <p className="font-medium">{formatWorkHours(selectedRecord.workHours)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedRecord.status)}</div>
                </div>
                {selectedRecord.verificationMethod && (
                  <div>
                    <p className="text-sm text-gray-500">Check-in Method</p>
                    <p className="font-medium capitalize">{selectedRecord.verificationMethod.replace('_', ' ')}</p>
                  </div>
                )}
                {selectedRecord.location && (
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <div className="space-y-3">
                      {/* Interactive Map */}
                      <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border">
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedRecord.location.longitude-0.005},${selectedRecord.location.latitude-0.005},${selectedRecord.location.longitude+0.005},${selectedRecord.location.latitude+0.005}&layer=mapnik&marker=${selectedRecord.location.latitude},${selectedRecord.location.longitude}`}
                          style={{ border: 0 }}
                          title="Check-in Location Map"
                        ></iframe>
                      </div>
                      
                      {/* Location Details */}
                      <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span className="font-mono text-sm">
                            {selectedRecord.location.latitude.toFixed(6)}, {selectedRecord.location.longitude.toFixed(6)}
                          </span>
                        </div>
                        
                        {selectedRecord.location.address && (
                          <div className="flex items-start gap-2">
                            <span>📍</span>
                            <div>
                              <div className="font-medium text-sm">{selectedRecord.location.address}</div>
                            </div>
                          </div>
                        )}
                        
                        {selectedRecord.location.accuracy && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs">🎯</span>
                            <span className="text-xs text-gray-500">
                              Accuracy: ±{selectedRecord.location.accuracy}m
                              {selectedRecord.location.accuracy <= 15 ? ' (Good signal)' : 
                               selectedRecord.location.accuracy <= 50 ? ' (Fair signal)' : ' (Weak signal)'}
                            </span>
                          </div>
                        )}
                        
                        {/* Open in Maps Links */}
                        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                          <a
                            href={`https://www.google.com/maps?q=${selectedRecord.location.latitude},${selectedRecord.location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Open in Google Maps
                          </a>
                          <span className="text-xs text-gray-400">•</span>
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${selectedRecord.location.latitude}&mlon=${selectedRecord.location.longitude}&zoom=16`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Open in OpenStreetMap
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Manual Attendance Log Modal */}
        <ManualAttendanceModal 
          isOpen={showManualLogModal}
          onClose={() => setShowManualLogModal(false)}
          onSubmit={handleManualLog}
          availableUsers={availableUsers}
          selectedDate={selectedDate}
        />
      </div>
    </DashboardLayout>
  )
}

// Manual Attendance Modal Component
interface ManualAttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  availableUsers: any[]
  selectedDate: string
}

function ManualAttendanceModal({ isOpen, onClose, onSubmit, availableUsers, selectedDate }: ManualAttendanceModalProps) {
  const [formData, setFormData] = useState({
    userId: '',
    checkInTime: '',
    checkOutTime: '',
    status: 'present',
    notes: ''
  })
  const [userSearch, setUserSearch] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const userDropdownRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserDropdown])

  // Filter users based on search term (name, IC, or employee ID)
  const filteredUsers = availableUsers.filter(user => {
    if (!userSearch) return true
    const searchLower = userSearch.toLowerCase()
    return (
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.employee_id?.toLowerCase().includes(searchLower) ||
      user.ic_number?.toLowerCase().includes(searchLower)
    )
  })

  const handleUserSelect = (user: any) => {
    setSelectedUser(user)
    setFormData(prev => ({ ...prev, userId: user.id }))
    setUserSearch(user.full_name)
    setShowUserDropdown(false)
  }

  const handleUserSearchChange = (value: string) => {
    setUserSearch(value)
    setShowUserDropdown(value.length > 0)
    if (!value) {
      setSelectedUser(null)
      setFormData(prev => ({ ...prev, userId: '' }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedUser) {
      toast.error('Please select a user')
      return
    }
    
    if (!formData.checkInTime) {
      toast.error('Please enter check-in time')
      return
    }

    onSubmit({
      user_id: selectedUser.id,
      user_name: selectedUser.full_name,
      employee_id: selectedUser.employee_id,
      check_in_time: formData.checkInTime,
      check_out_time: formData.checkOutTime || null,
      status: formData.status,
      notes: formData.notes
    })
    
    // Reset form
    setFormData({
      userId: '',
      checkInTime: '',
      checkOutTime: '',
      status: 'present',
      notes: ''
    })
    setUserSearch('')
    setSelectedUser(null)
    setShowUserDropdown(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Manual Attendance Log
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input 
              value={new Date(selectedDate).toLocaleDateString()}
              disabled
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>
          
          <div className="space-y-2">
            <Label>User *</Label>
            <div className="relative" ref={userDropdownRef}>
              <Input
                placeholder="Search by name, IC number, or employee ID..."
                value={userSearch}
                onChange={(e) => handleUserSearchChange(e.target.value)}
                onFocus={() => setShowUserDropdown(userSearch.length > 0)}
                className={selectedUser ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20' : 'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100'}
              />
              {selectedUser && (
                <div className="mt-1 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-green-500 dark:bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{selectedUser.full_name}</span>
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full font-medium">
                          {selectedUser.primary_role || selectedUser.smartid_time_role}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>ID: {selectedUser.employee_id}</span>
                        {selectedUser.ic_number && (
                          <span>IC: {selectedUser.ic_number}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {showUserDropdown && filteredUsers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-gray-100">{user.full_name}</span>
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full font-medium">
                              {user.primary_role || user.smartid_time_role}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>ID: {user.employee_id}</span>
                            {user.ic_number && (
                              <span>IC: {user.ic_number}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showUserDropdown && filteredUsers.length === 0 && userSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg p-3 text-center text-gray-500 dark:text-gray-400">
                  No users found matching "{userSearch}"
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check In Time *</Label>
              <Input 
                type="time"
                value={formData.checkInTime}
                onChange={(e) => setFormData(prev => ({ ...prev, checkInTime: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Check Out Time</Label>
              <Input 
                type="time"
                value={formData.checkOutTime}
                onChange={(e) => setFormData(prev => ({ ...prev, checkOutTime: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="early_leave">Early Leave</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input 
              placeholder="Optional notes about this attendance entry"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Log Attendance
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
