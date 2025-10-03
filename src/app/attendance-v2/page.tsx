'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Users, CheckCircle, XCircle, Clock, BarChart3, Calendar, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type AttendanceRecord = {
  id: string
  userId: string
  userName: string
  employeeId: string
  role: string
  checkInTime: string | null
  checkOutTime: string | null
  workHours: number | null
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'on_leave' | 'in_progress' | 'completed'
  date: string
}

type AttendanceStats = {
  totalUsers: number
  presentToday: number
  absentToday: number
  lateToday: number
  onLeaveToday: number
  averageWorkingHours: number
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
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)
  const [institutionName, setInstitutionName] = useState('')

  useEffect(() => {
    loadAttendanceData()
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

      // Get institution name
      const { data: currentUser } = await supabase
        .from('users')
        .select('institution_id, institutions(name)')
        .or(`auth_user_id.eq.${authUser.id},id.eq.${authUser.id}`)
        .single()

      if (currentUser?.institutions?.name) {
        setInstitutionName(currentUser.institutions.name)
      }

      // Fetch attendance records
      const response = await fetch(`/api/attendance/records?date=${selectedDate}`)
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

  const filterRecords = () => {
    let filtered = [...attendanceRecords]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
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
      completed: { label: 'Completed', className: 'bg-green-100 text-green-800' }
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
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Attendance Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Track daily attendance for {institutionName || 'your institution'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Present</p>
                  <p className="text-3xl font-bold">{stats.presentToday}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Absent</p>
                  <p className="text-3xl font-bold">{stats.absentToday}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Late</p>
                  <p className="text-3xl font-bold">{stats.lateToday}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">On Leave</p>
                  <p className="text-3xl font-bold">{stats.onLeaveToday}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100">Avg Hours</p>
                  <p className="text-3xl font-bold">{stats.averageWorkingHours.toFixed(1)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search by name or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
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
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records - {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No attendance records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Employee</th>
                      <th className="text-left p-4">Role</th>
                      <th className="text-left p-4">Check In</th>
                      <th className="text-left p-4">Check Out</th>
                      <th className="text-left p-4">Work Hours</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{record.userName}</p>
                            <p className="text-sm text-gray-500">{record.employeeId}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize">
                            {record.role}
                          </Badge>
                        </td>
                        <td className="p-4">{formatTime(record.checkInTime)}</td>
                        <td className="p-4">{formatTime(record.checkOutTime)}</td>
                        <td className="p-4">{formatWorkHours(record.workHours)}</td>
                        <td className="p-4">{getStatusBadge(record.status)}</td>
                        <td className="p-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedRecord(record)}
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
                  <p className="font-medium">{selectedRecord.userName} ({selectedRecord.employeeId})</p>
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
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}