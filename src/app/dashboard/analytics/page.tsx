'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Sample analytics data
const enrollmentTrends = [
  { month: 'Jan 2024', students: 95, teachers: 8, staff: 4, total: 107 },
  { month: 'Feb 2024', students: 187, teachers: 12, staff: 6, total: 205 },
  { month: 'Mar 2024', students: 298, teachers: 18, staff: 8, total: 324 },
  { month: 'Apr 2024', students: 456, teachers: 25, staff: 12, total: 493 },
  { month: 'May 2024', students: 612, teachers: 31, staff: 15, total: 658 },
  { month: 'Jun 2024', students: 789, teachers: 38, staff: 18, total: 845 },
  { month: 'Jul 2024', students: 923, teachers: 42, staff: 21, total: 986 },
  { month: 'Aug 2024', students: 1089, teachers: 47, staff: 23, total: 1159 },
  { month: 'Sep 2024', students: 1117, teachers: 50, staff: 25, total: 1192 }
]

const biometricStats = {
  palmEnrollmentRate: 89,
  cardIssuanceRate: 94,
  completionRate: 82,
  averageEnrollmentTime: '3.2',
  successRate: 98.5,
  failureReasons: [
    { reason: 'Palm scan quality issue', count: 23, percentage: 45 },
    { reason: 'Hardware malfunction', count: 12, percentage: 24 },
    { reason: 'User cancelled process', count: 8, percentage: 16 },
    { reason: 'Network timeout', count: 5, percentage: 10 },
    { reason: 'Other', count: 3, percentage: 5 }
  ]
}

const userTypeDistribution = [
  { type: 'Students', count: 1117, percentage: 89.4, color: 'bg-purple-500' },
  { type: 'Teachers', count: 87, percentage: 7.0, color: 'bg-green-500' },
  { type: 'Staff', count: 43, percentage: 3.4, color: 'bg-blue-500' }
]

const recentAlerts = [
  { id: 1, type: 'warning', title: 'Low card stock', message: 'Only 45 smart cards remaining in inventory', time: '2 hours ago' },
  { id: 2, type: 'info', title: 'Scheduled maintenance', message: 'Biometric scanner will be offline tomorrow 2-4 PM', time: '4 hours ago' },
  { id: 3, type: 'success', title: 'Backup completed', message: 'Daily database backup completed successfully', time: '8 hours ago' },
  { id: 4, type: 'error', title: 'Failed enrollments', message: '5 palm scans failed in the last hour', time: '1 day ago' }
]


const alertIcons = {
  warning: '⚠️',
  info: 'ℹ️',
  success: '✅',
  error: '❌'
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6months')
  
  const getMaxValue = () => {
    return Math.max(...enrollmentTrends.map(item => item.total))
  }

  const maxValue = getMaxValue()

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Gradient Header */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-violet-900 dark:to-purple-900 rounded-2xl p-8 border-0 shadow-lg dark:border dark:border-purple-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics & Insights 📈</h1>
              <p className="text-gray-600 dark:text-purple-200/90">SMK Bukit Jelutong • Track enrollment progress, user patterns, and system performance</p>
            </div>
            <div className="flex gap-6 mt-4 lg:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">89%</div>
                <div className="text-sm text-gray-500 dark:text-purple-200/70">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">1,247</div>
                <div className="text-sm text-gray-500 dark:text-purple-200/70">Total Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-end gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="gap-2">
              📊 Export Report
            </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Enrollment Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">{biometricStats.palmEnrollmentRate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-slate-400">+5% this month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-xl">
                  ✋
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Card Issuance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">{biometricStats.cardIssuanceRate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-slate-400">+2% this month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl">
                  💳
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">{biometricStats.successRate}%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-slate-400">+1.2% this month</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center text-white text-xl">
                  ✅
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Avg Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">{biometricStats.averageEnrollmentTime}<span className="text-lg">min</span></p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-slate-400">-0.5min improved</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white text-xl">
                  ⏱️
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enrollment Trends Chart */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-slate-50">Enrollment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Simple Bar Chart */}
                <div className="space-y-4">
                  {enrollmentTrends.slice(-6).map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700 dark:text-slate-300">{item.month}</span>
                        <span className="font-semibold text-gray-900 dark:text-slate-100">{item.total} total</span>
                      </div>
                      <div className="space-y-1">
                        {/* Students Bar */}
                        <div className="flex items-center gap-2">
                          <div className="w-16 text-xs text-gray-500 dark:text-slate-400">Students</div>
                          <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-violet-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(item.students / maxValue) * 100}%` }}
                            />
                          </div>
                          <div className="w-12 text-xs text-gray-600 dark:text-slate-300">{item.students}</div>
                        </div>
                        {/* Teachers Bar */}
                        <div className="flex items-center gap-2">
                          <div className="w-16 text-xs text-gray-500 dark:text-slate-400">Teachers</div>
                          <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(item.teachers / maxValue) * 100}%` }}
                            />
                          </div>
                          <div className="w-12 text-xs text-gray-600 dark:text-slate-300">{item.teachers}</div>
                        </div>
                        {/* Staff Bar */}
                        <div className="flex items-center gap-2">
                          <div className="w-16 text-xs text-gray-500 dark:text-slate-400">Staff</div>
                          <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(item.staff / maxValue) * 100}%` }}
                            />
                          </div>
                          <div className="w-12 text-xs text-gray-600 dark:text-slate-300">{item.staff}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* User Distribution */}
            <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-slate-50">User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userTypeDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 ${item.color} rounded-full`}></div>
                        <span className="font-medium text-gray-700 dark:text-slate-300">{item.type}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-slate-100">{item.count}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Visual representation */}
                <div className="mt-6 h-4 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                  {userTypeDistribution.map((item, index) => (
                    <div 
                      key={index}
                      className={`${item.color} transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-slate-50 flex items-center gap-2">
                  System Alerts
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="p-3 rounded-xl border bg-gray-50/50 dark:bg-slate-700/30 hover:bg-gray-100/50 dark:hover:bg-slate-700 dark:border-slate-600 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="text-lg flex-shrink-0">
                          {alertIcons[alert.type as keyof typeof alertIcons]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-slate-100 text-sm">{alert.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">{alert.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Failure Analysis */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-slate-50">Enrollment Failure Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {biometricStats.failureReasons.map((reason, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-1">{reason.count}</div>
                  <div className="text-sm text-gray-600 dark:text-slate-300 mb-2">{reason.reason}</div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${reason.percentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{reason.percentage}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
