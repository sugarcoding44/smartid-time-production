'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AttendanceAnalyticsSimple } from '@/components/features/attendance-analytics-simple'

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <AttendanceAnalyticsSimple />
    </DashboardLayout>
  )
}
