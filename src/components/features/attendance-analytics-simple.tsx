'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { 
  Download, 
  TrendingUp, 
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  FileText
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

export function AttendanceAnalyticsSimple() {
  const [analytics, setAnalytics] = useState<AttendanceAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date()
  })
  const [departmentFilter, setDepartmentFilter] = useState('all')

  const handleDateRangeChange = (date: DateRange | undefined) => {
    if (date) {
      setDateRange(date)
    }
  }

  useEffect(() => {
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
        <Button onClick={loadAnalytics} className="mt-4">
          <TrendingUp className="w-4 h-4 mr-2" />
          Retry Loading
        </Button>
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

      {/* Needs Attention */}
      {analytics.summary.needsAttention.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertTriangle className="w-5 h-5" />
              Needs Attention ({analytics.summary.needsAttention.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.summary.needsAttention.map((item) => (
                <div key={item.userId} className="flex items-center justify-between p-3 bg-white dark:bg-orange-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.userName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.issue}
                    </p>
                  </div>
                  <Badge className={getSeverityColor(item.severity)}>
                    {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200'
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}