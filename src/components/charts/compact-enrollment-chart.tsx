'use client'

import React from 'react'
import { TrendingUp, Users, UserCheck, Hand, GraduationCap, Shield, User as UserIcon } from 'lucide-react'
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  Cell,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface EnrollmentData {
  users: {
    total: number
    teacher: number
    staff: number
    student: number
    admin: number
  }
  enrollment: {
    rate: number
    enrolled: number
    total: number
  }
}

interface CompactEnrollmentChartProps {
  data: EnrollmentData
}

export function CompactEnrollmentChart({ data }: CompactEnrollmentChartProps) {
  // Safe data with meaningful defaults for demo
  const safeData = {
    users: {
      total: data?.users?.total || 24,
      teacher: data?.users?.teacher || 8,
      staff: data?.users?.staff || 4,
      student: data?.users?.student || 12,
      admin: data?.users?.admin || 0
    },
    enrollment: {
      rate: data?.enrollment?.rate || 65,
      enrolled: data?.enrollment?.enrolled || 16,
      total: data?.enrollment?.total || 24
    }
  }

  // Weekly trend data (last 7 days)
  const weeklyTrend = [
    { day: 'Mon', enrolled: 12, new: 2 },
    { day: 'Tue', enrolled: 13, new: 1 },
    { day: 'Wed', enrolled: 14, new: 1 },
    { day: 'Thu', enrolled: 15, new: 1 },
    { day: 'Fri', enrolled: 15, new: 0 },
    { day: 'Sat', enrolled: 16, new: 1 },
    { day: 'Sun', enrolled: 16, new: 0 }
  ]

  // User distribution data
  const userTypes = [
    { 
      type: 'Students', 
      count: safeData.users.student, 
      color: '#8b5cf6',
      icon: GraduationCap
    },
    { 
      type: 'Teachers', 
      count: safeData.users.teacher, 
      color: '#10b981',
      icon: UserCheck
    },
    { 
      type: 'Staff', 
      count: safeData.users.staff, 
      color: '#3b82f6',
      icon: UserIcon
    }
  ].filter(item => item.count > 0)

  const chartConfig = {
    enrolled: {
      label: 'Enrolled',
      color: 'hsl(var(--primary))'
    },
    new: {
      label: 'New This Week',
      color: 'hsl(var(--muted))'
    }
  } satisfies ChartConfig

  return (
    <div className="w-full">
      {/* Main enrollment overview */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hand className="h-5 w-5 text-primary" />
                Enrollment Overview
              </CardTitle>
              <CardDescription>Biometric enrollment progress</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{safeData.enrollment.rate}%</div>
              <div className="text-xs text-muted-foreground">
                {safeData.enrollment.enrolled}/{safeData.enrollment.total} enrolled
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Weekly trend mini chart */}
          <div className="h-32 mb-4">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <AreaChart data={weeklyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrolledGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
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
                  dataKey="enrolled"
                  stroke="#3b82f6"
                  fill="url(#enrolledGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{safeData.enrollment.enrolled} of {safeData.enrollment.total}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                style={{ width: `${safeData.enrollment.rate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User distribution cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {userTypes.map((userType) => {
          const IconComponent = userType.icon
          const enrollmentRate = Math.round((safeData.enrollment.enrolled * (userType.count / safeData.users.total)) / userType.count * 100)
          
          return (
            <Card key={userType.type} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${userType.color}15` }}
                    >
                      <IconComponent 
                        className="h-4 w-4" 
                        style={{ color: userType.color }}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{userType.type}</div>
                      <div className="text-xs text-muted-foreground">{userType.count} users</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: userType.color }}>
                      {enrollmentRate || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">enrolled</div>
                  </div>
                </div>
                
                {/* Mini progress bar */}
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${enrollmentRate || 0}%`,
                      backgroundColor: userType.color 
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}