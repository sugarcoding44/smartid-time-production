'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function OfflineDashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow">
          <h1 className="text-3xl font-bold mb-4">✅ SmartID Dashboard (Offline Mode)</h1>
          
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 rounded">
            <p className="text-green-800 dark:text-green-200">
              🎉 <strong>Success!</strong> The dashboard is working! This version bypasses Supabase authentication.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded">
              <h2 className="font-semibold mb-2">🔍 Issue Diagnosis:</h2>
              <p>The main dashboard was stuck because of Supabase authentication loading. This offline version proves the UI components work fine.</p>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded">
              <h2 className="font-semibold mb-2">💡 Next Steps:</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Clear browser cache and cookies</li>
                <li>Try registration: <a href="/auth" className="text-blue-600 hover:underline">/auth</a></li>
                <li>Or direct sign-in: <a href="/auth/signin" className="text-blue-600 hover:underline">/auth/signin</a></li>
              </ul>
            </div>
          </div>
          
          {/* Mock Dashboard Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">👥</div>
                <h3 className="font-semibold">Users</h3>
                <p className="text-2xl font-bold text-blue-600">1,247</p>
                <p className="text-sm text-gray-600">Active users</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">🤚</div>
                <h3 className="font-semibold">Biometrics</h3>
                <p className="text-2xl font-bold text-green-600">89%</p>
                <p className="text-sm text-gray-600">Enrollment rate</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">💳</div>
                <h3 className="font-semibold">Smart Cards</h3>
                <p className="text-2xl font-bold text-purple-600">1,172</p>
                <p className="text-sm text-gray-600">Cards issued</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg">
            <h2 className="text-xl font-bold mb-2">🚀 Premium Features Available</h2>
            <p className="mb-4">Your SmartID system includes advanced attendance tracking, leave management, and biometric authentication.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">🕐 Attendance Management</h3>
                <ul className="text-sm space-y-1 opacity-90">
                  <li>• Custom work groups and schedules</li>
                  <li>• Biometric check-in/out</li>
                  <li>• Overtime tracking</li>
                  <li>• Real-time reporting</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📝 Leave Management</h3>
                <ul className="text-sm space-y-1 opacity-90">
                  <li>• Digital leave applications</li>
                  <li>• Approval workflows</li>
                  <li>• Quota management</li>
                  <li>• Holiday calendars</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
