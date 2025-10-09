'use client'

import React from 'react'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react'
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface AttendanceData {
  todayStats: {
    present: number
    late: number
    absent: number
    total: number
    rate: number
  }
  weeklyTrend: Array<{
    day: string
    present: number
    late: number
    absent: number
    rate: number
  }>
  timeDistribution: Array<{
    hour: string
    checkIns: number
  }>
}

interface AttendanceChartProps {
  data?: AttendanceData
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  // Demo data with realistic values
  const safeData: AttendanceData = data || {
    todayStats: {
      present: 18,
      late: 3,
      absent: 3,
      total: 24,
      rate: 75
    },
    weeklyTrend: [
      { day: 'Mon', present: 20, late: 2, absent: 2, rate: 83 },
      { day: 'Tue', present: 19, late: 3, absent: 2, rate: 79 },
      { day: 'Wed', present: 21, late: 1, absent: 2, rate: 88 },
      { day: 'Thu', present: 18, late: 4, absent: 2, rate: 75 },
      { day: 'Fri', present: 16, late: 5, absent: 3, rate: 67 },
      { day: 'Sat', present: 22, late: 1, absent: 1, rate: 92 },
      { day: 'Sun', present: 18, late: 3, absent: 3, rate: 75 }
    ],
    timeDistribution: [
      { hour: '7:00', checkIns: 2 },
      { hour: '7:30', checkIns: 5 },
      { hour: '8:00', checkIns: 12 },
      { hour: '8:30', checkIns: 8 },
      { hour: '9:00', checkIns: 3 },
      { hour: '9:30', checkIns: 1 },
      { hour: '10:00', checkIns: 0 }
    ]
  }

  const statusData = [
    { 
      status: 'Present', 
      count: safeData.todayStats.present, 
      color: '#10b981',
      icon: CheckCircle
    },
    { 
      status: 'Late', 
      count: safeData.todayStats.late, 
      color: '#f59e0b',
      icon: AlertTriangle
    },
    { 
      status: 'Absent', 
      count: safeData.todayStats.absent, 
      color: '#ef4444',
      icon: XCircle
    }
  ]

  const weeklyChartConfig = {
    present: {
      label: 'Present',
      color: '#10b981'
    },
    late: {
      label: 'Late',
      color: '#f59e0b'
    },
    absent: {
      label: 'Absent',
      color: '#ef4444'
    }
  } satisfies ChartConfig

  const timeChartConfig = {
    checkIns: {
      label: 'Check-ins',
      color: 'hsl(var(--primary))'
    }
  } satisfies ChartConfig

  const getTrendDirection = () => {
    const thisWeek = safeData.weeklyTrend.slice(-3).reduce((sum, day) => sum + day.rate, 0) / 3
    const lastWeek = safeData.weeklyTrend.slice(0, 3).reduce((sum, day) => sum + day.rate, 0) / 3
    return thisWeek > lastWeek ? 'up' : 'down'
  }

  const trendDirection = getTrendDirection()

  return (
    <div className="w-full space-y-6">
      {/* Today's Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Today's Attendance
              </CardTitle>
              <CardDescription>Real-time attendance tracking</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{safeData.todayStats.rate}%</div>
              <div className="text-xs text-muted-foreground">
                {safeData.todayStats.present + safeData.todayStats.late}/{safeData.todayStats.total} checked in
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Status breakdown */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {statusData.map((item) => {
              const IconComponent = item.icon
              const percentage = Math.round((item.count / safeData.todayStats.total) * 100)
              
              return (
                <div key={item.status} className="text-center">
                  <div 
                    className="mx-auto w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <IconComponent 
                      className="h-4 w-4" 
                      style={{ color: item.color }}
                    />
                  </div>
                  <div className="text-lg font-bold" style={{ color: item.color }}>
                    {item.count}
                  </div>
                  <div className="text-xs text-muted-foreground">{item.status}</div>
                  <div className="text-xs text-muted-foreground">({percentage}%)</div>
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Attendance Rate</span>
              <span className="font-medium">{safeData.todayStats.present + safeData.todayStats.late} of {safeData.todayStats.total}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${(safeData.todayStats.present / safeData.todayStats.total) * 100}%` }}
              />
              <div 
                className="h-full bg-yellow-500 transition-all duration-500"
                style={{ width: `${(safeData.todayStats.late / safeData.todayStats.total) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trend & Time Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Attendance Trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly Trend
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              Last 7 days performance
              {trendDirection === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-40 mb-3">
              <ChartContainer config={weeklyChartConfig} className="h-full w-full">
                <AreaChart data={safeData.weeklyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis hide />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ strokeDasharray: '3 3' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#10b981"
                    fill="url(#attendanceGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
            
            <div className="text-center text-sm">
              <div className="font-medium text-green-600">
                {Math.round(safeData.weeklyTrend.reduce((sum, day) => sum + day.rate, 0) / 7)}% avg
              </div>
              <div className="text-xs text-muted-foreground">weekly average</div>
            </div>
          </CardContent>
        </Card>

        {/* Check-in Time Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Check-in Times
            </CardTitle>
            <CardDescription>When people arrive today</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-40 mb-3">
              <ChartContainer config={timeChartConfig} className="h-full w-full">
                <BarChart data={safeData.timeDistribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="hour" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis hide />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar 
                    dataKey="checkIns" 
                    fill="#3b82f6"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>

            <div className="text-center text-sm">
              <div className="font-medium text-primary">
                8:00 AM
              </div>
              <div className="text-xs text-muted-foreground">peak check-in time</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {Math.round(safeData.weeklyTrend.reduce((sum, day) => sum + day.present, 0) / 7)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Present</div>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">
              {Math.round(safeData.weeklyTrend.reduce((sum, day) => sum + day.late, 0) / 7)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Late</div>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {Math.round(safeData.weeklyTrend.reduce((sum, day) => sum + day.absent, 0) / 7)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Absent</div>
          </div>
        </Card>
        
        <Card className="p-3">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {safeData.todayStats.total}
            </div>
            <div className="text-xs text-muted-foreground">Total Users</div>
          </div>
        </Card>
      </div>
    </div>
  )
}