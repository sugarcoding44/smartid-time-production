'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { LeaveRequestWorkflow } from '@/components/features/leave-request-workflow'

export default function LeaveRequestsPage() {
  return (
    <DashboardLayout>
      <LeaveRequestWorkflow />
    </DashboardLayout>
  )
}