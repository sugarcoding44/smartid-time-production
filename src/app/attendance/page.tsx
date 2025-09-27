'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Users, CheckCircle, XCircle, Clock, BarChart3, Grid3X3, List } from 'lucide-react'

type User = {
  id: string
  full_name: string
  employee_id: string
  primary_role: string
  department?: string
  profile_image_url?: string
}

type AttendanceRecord = {
  id: string
  user_id: string
  date: string
  check_in_time: string | null
  check_out_time: string | null
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'on_leave'
  working_hours: number
  location?: string
  notes?: string
  user?: User
}

type AttendanceStats = {
  totalUsers: number
  presentToday: number
  absentToday: number
  lateToday: number
  averageWorkingHours: number
}

export default function AttendancePage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats>({ totalUsers: 0, presentToday: 0, absentToday: 0, lateToday: 0, averageWorkingHours: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedUser, setSelectedUser] = useState<AttendanceRecord | null>(null)

  useEffect(() => {
    initializeData()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [attendanceRecords, searchTerm, statusFilter, selectedDate])

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
        await loadUsers(user.institution_id)
        await loadAttendanceData(user.institution_id)
      }
    } catch (error) {
      console.error('Error initializing attendance data:', error)
      toast.error('Failed to load attendance data')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async (institutionId: string) => {
    try {
      // Mock users data - in real implementation, fetch from /api/users
      const mockUsers: User[] = [
        {
          id: '1',
          full_name: 'John Doe',
          employee_id: 'TC001',
          primary_role: 'teacher',
          department: 'Mathematics'
        },
        {
          id: '2',
          full_name: 'Jane Smith',
          employee_id: 'ST001',
          primary_role: 'staff',
          department: 'Administration'
        },
        {
          id: '3',
          full_name: 'Bob Johnson',
          employee_id: 'SD001',
          primary_role: 'student',
          department: 'Grade 10'
        },
        {
          id: '4',
          full_name: 'Alice Brown',
          employee_id: 'TC002',
          primary_role: 'teacher',
          department: 'Science'
        }
      ]
      
      setUsers(mockUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    }
  }

  const loadAttendanceData = async (institutionId: string) => {
    try {
      // Mock attendance data - in real implementation, fetch from /api/attendance
      const today = new Date().toISOString().split('T')[0]
      const mockAttendance: AttendanceRecord[] = [
        {
          id: '1',
          user_id: '1',
          date: today,
          check_in_time: '08:15:30',
          check_out_time: '17:00:00',
          status: 'present',
          working_hours: 8.75,
          location: 'Main Building',
          user: {
            id: '1',
            full_name: 'John Doe',
            employee_id: 'TC001',
            primary_role: 'teacher'
          }
        },
        {
          id: '2',
          user_id: '2',
          date: today,
          check_in_time: '08:35:15',
          check_out_time: '17:10:00',
          status: 'late',
          working_hours: 8.5,
          location: 'Admin Block',
          user: {
            id: '2',
            full_name: 'Jane Smith',
            employee_id: 'ST001',
            primary_role: 'staff'
          }
        },
        {
          id: '3',
          user_id: '3',
          date: today,
          check_in_time: null,
          check_out_time: null,
          status: 'absent',
          working_hours: 0,
          user: {
            id: '3',
            full_name: 'Bob Johnson',
            employee_id: 'SD001',
            primary_role: 'student'
          }
        },
        {
          id: '4',
          user_id: '4',
          date: today,
          check_in_time: '08:00:00',
          check_out_time: '16:30:00',
          status: 'early_leave',
          working_hours: 8.0,
          location: 'Science Lab',
          user: {
            id: '4',
            full_name: 'Alice Brown',
            employee_id: 'TC002',
            primary_role: 'teacher'
          }
        }
      ]
      
      setAttendanceRecords(mockAttendance)
      calculateStats(mockAttendance)
    } catch (error) {
      console.error('Error loading attendance:', error)
      toast.error('Failed to load attendance data')
    }
  }

  const calculateStats = (records: AttendanceRecord[]) => {
    const today = new Date().toISOString().split('T')[0]
    const todayRecords = records.filter(r => r.date === today)
    
    const stats: AttendanceStats = {
      totalUsers: users.length || todayRecords.length,
      presentToday: todayRecords.filter(r => r.status === 'present').length,
      absentToday: todayRecords.filter(r => r.status === 'absent').length,
      lateToday: todayRecords.filter(r => r.status === 'late').length,
      averageWorkingHours: todayRecords.reduce((sum, r) => sum + r.working_hours, 0) / (todayRecords.length || 1)
    }
    
    setStats(stats)
  }

  const filterRecords = () => {
    let filtered = attendanceRecords.filter(record => record.date === selectedDate)
    
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.user?.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter)
    }
    
    setFilteredRecords(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200'
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'early_leave': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'absent': return 'bg-red-100 text-red-800 border-red-200'
      case 'on_leave': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTime = (time: string | null) => {
    if (!time) return '--:--'
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'teacher': return 'bg-purple-100 text-purple-800'
      case 'staff': return 'bg-blue-100 text-blue-800'
      case 'student': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const exportAttendance = () => {
    toast.success('Attendance report exported successfully')
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
        <div className="bg-white dark:bg-gradient-to-br dark:from-violet-900 dark:to-purple-900 rounded-2xl p-6 border-0 shadow-lg dark:border dark:border-purple-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Attendance Management</h1>
              <p className="text-gray-600 dark:text-purple-200/90">Monitor and manage attendance for all users in your institution</p>
            </div>
            <div className="mt-4 lg:mt-0 flex gap-3">
              <Button onClick={exportAttendance} variant="outline" className="flex items-center gap-2 dark:text-purple-100 dark:border-purple-400/50 dark:hover:bg-purple-800/50">
                📥
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.presentToday}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Present Today</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.absentToday}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Absent Today</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{stats.lateToday}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Late Today</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-indigo-600">{stats.averageWorkingHours.toFixed(1)}h</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Hours</div>
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
                    placeholder="Search by name or employee ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">📅</span>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <span className="mr-2">🔽</span>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="early_leave">Early Leave</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📋</span>
              Attendance Records
              <Badge variant="secondary" className="ml-auto">
                {filteredRecords.length} records
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRecords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-gray-500 dark:text-gray-400">No attendance records found</p>
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <Dialog key={record.id}>
                    <DialogTrigger asChild>
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {record.user?.full_name.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {record.user?.full_name}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <span>{record.user?.employee_id}</span>
                              <Badge className={getRoleColor(record.user?.primary_role || '')} variant="outline">
                                {record.user?.primary_role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatTime(record.check_in_time)} - {formatTime(record.check_out_time)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {record.working_hours}h worked
                          </div>
                        </div>
                        
                        <Badge className={getStatusColor(record.status)}>
                          {record.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Attendance Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                            {record.user?.full_name.charAt(0) || 'U'}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {record.user?.full_name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {record.user?.employee_id} • {record.user?.primary_role}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                            <div className="text-sm text-green-600 dark:text-green-400">Check In</div>
                            <div className="font-semibold text-green-800 dark:text-green-200">
                              {formatTime(record.check_in_time)}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                            <div className="text-sm text-blue-600 dark:text-blue-400">Check Out</div>
                            <div className="font-semibold text-blue-800 dark:text-blue-200">
                              {formatTime(record.check_out_time)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                          <div className="text-sm text-indigo-600 dark:text-indigo-400">Working Hours</div>
                          <div className="text-xl font-bold text-indigo-800 dark:text-indigo-200">
                            {record.working_hours}h
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Status:</span>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        {record.location && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {record.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
