'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { NotificationsSystem } from '@/components/features/notifications-system'

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <NotificationsSystem />
    </DashboardLayout>
  )
}