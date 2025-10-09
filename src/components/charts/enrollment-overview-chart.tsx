'use client'

import React from 'react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'

interface EnrollmentOverviewChartProps {
  data: {
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
}

const COLORS = {
  enrolled: '#10b981', // green-500
  pending: '#f59e0b',  // amber-500
  teacher: '#059669',  // emerald-600
  staff: '#3b82f6',    // blue-500
  student: '#8b5cf6',  // violet-500
  admin: '#ef4444'     // red-500
}

export function EnrollmentOverviewChart({ data }: EnrollmentOverviewChartProps) {
  // Ensure data has default values
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

  // Generate sample weekly enrollment data
  const weeklyData = [
    { name: '7 days ago', enrolled: Math.max(0, safeData.enrollment.enrolled - 15), pending: 15 },
    { name: '6 days ago', enrolled: Math.max(0, safeData.enrollment.enrolled - 12), pending: 12 },
    { name: '5 days ago', enrolled: Math.max(0, safeData.enrollment.enrolled - 10), pending: 10 },
    { name: '4 days ago', enrolled: Math.max(0, safeData.enrollment.enrolled - 8), pending: 8 },
    { name: '3 days ago', enrolled: Math.max(0, safeData.enrollment.enrolled - 5), pending: 5 },
    { name: '2 days ago', enrolled: Math.max(0, safeData.enrollment.enrolled - 3), pending: 3 },
    { name: 'Yesterday', enrolled: Math.max(0, safeData.enrollment.enrolled - 1), pending: 1 },
    { name: 'Today', enrolled: safeData.enrollment.enrolled, pending: safeData.enrollment.total - safeData.enrollment.enrolled }
  ]

  // User type distribution data
  const userTypeData = [
    { name: 'Students', value: safeData.users.student, color: COLORS.student },
    { name: 'Teachers', value: safeData.users.teacher, color: COLORS.teacher },
    { name: 'Staff', value: safeData.users.staff, color: COLORS.staff },
    { name: 'Admin', value: safeData.users.admin, color: COLORS.admin }
  ].filter(item => item.value > 0)

  // Enrollment status data
  const enrollmentStatusData = [
    { name: 'Enrolled', value: safeData.enrollment.enrolled, color: COLORS.enrolled },
    { name: 'Pending', value: safeData.enrollment.total - safeData.enrollment.enrolled, color: COLORS.pending }
  ].filter(item => item.value > 0)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{data.payload.name}</p>
          <p className="text-sm" style={{ color: data.payload.color }}>
            {`Count: ${data.value}`}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {`${((data.value / data.payload.total) * 100).toFixed(1)}%`}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Weekly Enrollment Trend */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Weekly Enrollment Progress</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 11 }}
                stroke="#64748b"
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                stroke="#64748b"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="enrolled"
                stackId="1"
                stroke={COLORS.enrolled}
                fill={COLORS.enrolled}
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="pending"
                stackId="1"
                stroke={COLORS.pending}
                fill={COLORS.pending}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Type Distribution */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">User Distribution</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userTypeData.map(item => ({ ...item, total: safeData.users.total }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {userTypeData.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600 dark:text-slate-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enrollment Status */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Enrollment Status</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentStatusData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis 
                  type="category" 
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  stroke="#64748b"
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {enrollmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {enrollmentStatusData.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600 dark:text-slate-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}