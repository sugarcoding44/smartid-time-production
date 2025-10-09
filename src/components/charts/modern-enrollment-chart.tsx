'use client'

import React from 'react'
import { TrendingUp, Users, UserCheck, GraduationCap, Shield, User } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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

interface ModernEnrollmentChartProps {
  data: EnrollmentData
}

export function ModernEnrollmentChart({ data }: ModernEnrollmentChartProps) {
  // Ensure data has safe defaults
  const safeData = {
    users: {
      total: data?.users?.total || 0,
      teacher: data?.users?.teacher || 0,
      staff: data?.users?.staff || 0,
      student: data?.users?.student || 0,
      admin: data?.users?.admin || 0
    },
    enrollment: {
      rate: data?.enrollment?.rate || 0,
      enrolled: data?.enrollment?.enrolled || 0,
      total: data?.enrollment?.total || 0
    }
  }

  // Generate mock weekly enrollment progress data
  const weeklyEnrollmentData = [
    { date: '2024-01', enrolled: Math.max(0, safeData.enrollment.enrolled - 15), pending: 15 },
    { date: '2024-02', enrolled: Math.max(0, safeData.enrollment.enrolled - 12), pending: 12 },
    { date: '2024-03', enrolled: Math.max(0, safeData.enrollment.enrolled - 8), pending: 8 },
    { date: '2024-04', enrolled: Math.max(0, safeData.enrollment.enrolled - 5), pending: 5 },
    { date: '2024-05', enrolled: Math.max(0, safeData.enrollment.enrolled - 2), pending: 2 },
    { date: '2024-06', enrolled: safeData.enrollment.enrolled || 0, pending: Math.max(1, safeData.enrollment.total - safeData.enrollment.enrolled) }
  ]

  // User type distribution for pie chart
  const userDistributionData = [
    { userType: 'Students', count: safeData.users.student, fill: 'hsl(var(--chart-1))' },
    { userType: 'Teachers', count: safeData.users.teacher, fill: 'hsl(var(--chart-2))' },
    { userType: 'Staff', count: safeData.users.staff, fill: 'hsl(var(--chart-3))' },
    { userType: 'Admin', count: safeData.users.admin, fill: 'hsl(var(--chart-4))' }
  ].filter(item => item.count > 0)

  // Enrollment progress data for bar chart  
  const enrollmentProgressData = [
    {
      status: 'Enrolled',
      count: safeData.enrollment.enrolled,
      fill: 'hsl(var(--chart-2))'
    },
    {
      status: 'Pending',
      count: safeData.enrollment.total - safeData.enrollment.enrolled,
      fill: 'hsl(var(--chart-5))'
    }
  ]

  const weeklyChartConfig = {
    enrolled: {
      label: 'Enrolled',
      color: 'hsl(var(--chart-2))'
    },
    pending: {
      label: 'Pending',
      color: 'hsl(var(--chart-5))'
    }
  } satisfies ChartConfig

  const distributionChartConfig = {
    count: {
      label: 'Users'
    },
    Students: {
      label: 'Students',
      color: 'hsl(var(--chart-1))'
    },
    Teachers: {
      label: 'Teachers', 
      color: 'hsl(var(--chart-2))'
    },
    Staff: {
      label: 'Staff',
      color: 'hsl(var(--chart-3))'
    },
    Admin: {
      label: 'Admin',
      color: 'hsl(var(--chart-4))'
    }
  } satisfies ChartConfig

  const progressChartConfig = {
    count: {
      label: 'Count'
    },
    Enrolled: {
      label: 'Enrolled',
      color: 'hsl(var(--chart-2))'
    },
    Pending: {
      label: 'Pending',
      color: 'hsl(var(--chart-5))'
    }
  } satisfies ChartConfig

  return (
    <div className="grid gap-4 md:gap-8">
      {/* Weekly Enrollment Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Enrollment Progress
          </CardTitle>
          <CardDescription>
            Enrollment progress over the last 6 periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={weeklyChartConfig}>
            <AreaChart accessibilityLayer data={weeklyEnrollmentData}>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(5)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="pending"
                type="natural"
                fill="var(--color-pending)"
                fillOpacity={0.4}
                stroke="var(--color-pending)"
                stackId="a"
              />
              <Area
                dataKey="enrolled"
                type="natural"
                fill="var(--color-enrolled)"
                fillOpacity={0.4}
                stroke="var(--color-enrolled)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 font-medium leading-none">
                {safeData.enrollment.rate}% enrollment rate <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                {safeData.enrollment.enrolled} out of {safeData.enrollment.total} users enrolled
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* User Distribution and Enrollment Status */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* User Distribution Pie Chart */}
        <Card>
          <CardHeader className="items-center pb-0">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Distribution
            </CardTitle>
            <CardDescription>Breakdown by user type</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={distributionChartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={userDistributionData}
                  dataKey="count"
                  nameKey="userType"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {userDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="grid grid-cols-2 gap-4 w-full">
              {userDistributionData.map((item) => {
                const Icon = item.userType === 'Students' ? GraduationCap :
                           item.userType === 'Teachers' ? UserCheck :
                           item.userType === 'Staff' ? User : Shield
                return (
                  <div key={item.userType} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" style={{ color: item.fill }} />
                    <span>{item.userType}: {item.count}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-2 font-medium leading-none">
              Total: {safeData.users.total} users
            </div>
          </CardFooter>
        </Card>

        {/* Enrollment Status Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Enrollment Status
            </CardTitle>
            <CardDescription>Current biometric enrollment status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={progressChartConfig}>
              <BarChart
                accessibilityLayer
                data={enrollmentProgressData}
                layout="horizontal"
                margin={{
                  left: 0
                }}
              >
                <YAxis
                  dataKey="status"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <XAxis dataKey="count" type="number" hide />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="count" layout="horizontal" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 font-medium leading-none">
              {safeData.enrollment.rate}% completion rate
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              {safeData.enrollment.enrolled} enrolled, {safeData.enrollment.total - safeData.enrollment.enrolled} pending
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}