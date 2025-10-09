'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  FileText,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

type AttendanceAnalytics = {
  dailyTrends: Array<{
    date: string
    present: number
    absent: number
    late: number
    total: number
    rate: number
  }>
  departmentStats: Array<{
    department: string
    attendanceRate: number
    avgWorkingHours: number
    lateArrivals: number
    earlyDepartures: number
  }>
  timeDistribution: Array<{
    hour: number
    checkIns: number
    checkOuts: number
  }>
  individualPerformance: Array<{
    userId: string
    userName: string
    employeeId: string
    department: string
    attendanceRate: number
    punctualityScore: number
    avgWorkingHours: number
    totalDays: number
    presentDays: number
    lateDays: number
    absentDays: number
  }>
  summary: {
    totalWorkingDays: number
    overallAttendanceRate: number
    avgWorkingHours: number
    punctualityRate: number
    mostProductiveHour: string
    topPerformer: string
    needsAttention: Array<{
      userId: string
      userName: string
      issue: string
      severity: 'low' | 'medium' | 'high'
    }>
  }
}

export function AttendanceAnalytics() {
  const [analytics, setAnalytics] = useState<AttendanceAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date()
  })
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [exportFormat, setExportFormat] = useState('pdf')

  const handleDateRangeChange = (date: DateRange | undefined) => {
    if (date) {
      setDateRange(date)
    }
  }

  useEffect(() => {
    console.log('useEffect triggered - dateRange:', dateRange, 'departmentFilter:', departmentFilter)
    loadAnalytics()
  }, [dateRange, departmentFilter])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Ensure we have valid dates
      if (!dateRange?.from || !dateRange?.to) {
        console.error('Invalid date range:', dateRange)
        toast.error('Please select a valid date range')
        setLoading(false)
        return
      }
      
      const params = new URLSearchParams({
        startDate: dateRange.from.toISOString().split('T')[0],
        endDate: dateRange.to.toISOString().split('T')[0],
        department: departmentFilter
      })

      console.log('Fetching analytics with params:', params.toString())
      const response = await fetch(`/api/attendance/analytics?${params}`)
      
      if (!response.ok) {
        console.error('Analytics API response not ok:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response:', errorText)
        toast.error(`Failed to load analytics data: ${response.status} ${response.statusText}`)
        return
      }
      
      const result = await response.json()
      console.log('Analytics API result:', result)

      if (result.success) {
        setAnalytics(result.analytics)
        toast.success('Analytics data loaded successfully')
      } else {
        console.error('Analytics API returned success=false:', result)
        toast.error(`Failed to load analytics data: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error(`Failed to load analytics data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    try {
      // Ensure we have valid dates
      if (!dateRange?.from || !dateRange?.to) {
        toast.error('Please select a valid date range')
        return
      }
      
      const params = new URLSearchParams({
        startDate: dateRange.from.toISOString().split('T')[0],
        endDate: dateRange.to.toISOString().split('T')[0],
        department: departmentFilter,
        format: exportFormat
      })

      const response = await fetch(`/api/attendance/export?${params}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `attendance-report-${dateRange.from!.toISOString().split('T')[0]}-to-${dateRange.to!.toISOString().split('T')[0]}.${exportFormat}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Report exported successfully')
      } else {
        toast.error('Failed to export report')
      }
    } catch (error) {
      console.error('Error exporting report:', error)
      toast.error('Failed to export report')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

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

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Attendance Analytics
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Comprehensive insights and performance metrics
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={handleDateRangeChange}
          />
          
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="teaching">Teaching Staff</SelectItem>
              <SelectItem value="administrative">Administrative</SelectItem>
              <SelectItem value="support">Support Staff</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="xlsx">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={exportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overall Attendance</p>
                <p className="text-3xl font-bold text-blue-600">
                  {analytics.summary.overallAttendanceRate.toFixed(1)}%
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Punctuality Rate</p>
                <p className="text-3xl font-bold text-green-600">
                  {analytics.summary.punctualityRate.toFixed(1)}%
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Working Hours</p>
                <p className="text-3xl font-bold text-purple-600">
                  {analytics.summary.avgWorkingHours.toFixed(1)}h
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Peak Activity</p>
                <p className="text-3xl font-bold text-orange-600">
                  {analytics.summary.mostProductiveHour}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts for Attention Needed */}
      {analytics.summary.needsAttention.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertTriangle className="w-5 h-5" />
              Needs Attention ({analytics.summary.needsAttention.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analytics.summary.needsAttention.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {alert.userName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {alert.issue}
                    </p>
                  </div>
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Daily Trends</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="distribution">Time Analysis</TabsTrigger>
          <TabsTrigger value="individual">Individual</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analytics.dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="present" stackId="1" stroke="#10b981" fill="#10b981" />
                  <Area type="monotone" dataKey="late" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                  <Area type="monotone" dataKey="absent" stackId="1" stroke="#ef4444" fill="#ef4444" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.departmentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="attendanceRate" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Check-in Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.timeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="checkIns" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Check-out Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.timeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="checkOuts" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Performance Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Employee</th>
                        <th className="text-left p-2">Department</th>
                        <th className="text-left p-2">Attendance Rate</th>
                        <th className="text-left p-2">Punctuality</th>
                        <th className="text-left p-2">Avg Hours</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.individualPerformance.slice(0, 10).map((employee, index) => (
                        <tr key={employee.userId} className="border-b">
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{employee.userName}</div>
                              <div className="text-gray-500 text-xs">{employee.employeeId}</div>
                            </div>
                          </td>
                          <td className="p-2">{employee.department}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${employee.attendanceRate}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{employee.attendanceRate.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="p-2">{employee.punctualityScore.toFixed(1)}%</td>
                          <td className="p-2">{employee.avgWorkingHours.toFixed(1)}h</td>
                          <td className="p-2">
                            <Badge 
                              className={
                                employee.attendanceRate >= 95 
                                  ? 'bg-green-100 text-green-800' 
                                  : employee.attendanceRate >= 80 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }
                            >
                              {employee.attendanceRate >= 95 ? 'Excellent' : employee.attendanceRate >= 80 ? 'Good' : 'Needs Improvement'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}