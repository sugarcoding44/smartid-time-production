'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  BellRing,
  Mail,
  MessageSquare,
  Clock,
  UserCheck,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Settings,
  Trash2,
  Eye,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

type Notification = {
  id: string
  type: 'attendance' | 'leave' | 'system' | 'reminder'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  priority: 'low' | 'medium' | 'high'
  actionUrl?: string
  actionText?: string
  relatedUser?: {
    name: string
    avatar?: string
  }
  metadata?: {
    [key: string]: any
  }
}

type NotificationSettings = {
  emailNotifications: boolean
  pushNotifications: boolean
  attendanceAlerts: boolean
  leaveRequests: boolean
  systemUpdates: boolean
  reminderNotifications: boolean
  weeklyReports: boolean
  realTimeUpdates: boolean
}

export function NotificationsSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    attendanceAlerts: true,
    leaveRequests: true,
    systemUpdates: false,
    reminderNotifications: true,
    weeklyReports: true,
    realTimeUpdates: true
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadNotifications()
    loadSettings()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications')
      const result = await response.json()

      if (result.success) {
        setNotifications(result.notifications || [])
      } else {
        toast.error('Failed to load notifications')
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
      // For demo, create sample notifications
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          type: 'attendance',
          title: 'Late Check-in Alert',
          message: 'John Doe checked in 30 minutes late today',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          isRead: false,
          priority: 'medium',
          relatedUser: { name: 'John Doe' }
        },
        {
          id: '2',
          type: 'leave',
          title: 'Leave Request Pending',
          message: 'Sarah Johnson submitted a leave request for next week',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          isRead: false,
          priority: 'high',
          actionUrl: '/leave-requests',
          actionText: 'Review Request',
          relatedUser: { name: 'Sarah Johnson' }
        },
        {
          id: '3',
          type: 'system',
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur tonight at 11 PM',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          isRead: true,
          priority: 'low'
        },
        {
          id: '4',
          type: 'reminder',
          title: 'Weekly Report Due',
          message: 'Your weekly attendance report is due tomorrow',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          isRead: false,
          priority: 'medium'
        }
      ]
      setNotifications(sampleNotifications)
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/notifications/settings')
      const result = await response.json()

      if (result.success) {
        setSettings(result.settings || settings)
      }
    } catch (error) {
      console.error('Error loading notification settings:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      })

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT'
      })

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })))
        toast.success('All notifications marked as read')
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== notificationId))
        toast.success('Notification deleted')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const updateSettings = async (newSettings: NotificationSettings) => {
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })

      if (response.ok) {
        setSettings(newSettings)
        toast.success('Notification settings updated')
      }
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Failed to update settings')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'attendance': return <UserCheck className="w-5 h-5" />
      case 'leave': return <Calendar className="w-5 h-5" />
      case 'system': return <Settings className="w-5 h-5" />
      case 'reminder': return <Clock className="w-5 h-5" />
      default: return <Bell className="w-5 h-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'attendance': return 'text-blue-600 bg-blue-100'
      case 'leave': return 'text-green-600 bg-green-100'
      case 'system': return 'text-purple-600 bg-purple-100'
      case 'reminder': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-300'
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.isRead
    return notification.type === filter
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BellRing className="w-6 h-6" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                {unreadCount} unread
              </Badge>
            )}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Stay updated with real-time alerts and system notifications
          </p>
        </div>

        <div className="flex gap-3">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Notifications</p>
                <p className="text-3xl font-bold text-blue-600">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
                <p className="text-3xl font-bold text-red-600">{unreadCount}</p>
              </div>
              <BellRing className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
                <p className="text-3xl font-bold text-orange-600">
                  {notifications.filter(n => n.priority === 'high').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
                <p className="text-3xl font-bold text-green-600">
                  {notifications.filter(n => 
                    new Date(n.timestamp).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All ({notifications.length})
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                >
                  Unread ({unreadCount})
                </Button>
                <Button
                  variant={filter === 'attendance' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('attendance')}
                >
                  Attendance ({notifications.filter(n => n.type === 'attendance').length})
                </Button>
                <Button
                  variant={filter === 'leave' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('leave')}
                >
                  Leave ({notifications.filter(n => n.type === 'leave').length})
                </Button>
                <Button
                  variant={filter === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('system')}
                >
                  System ({notifications.filter(n => n.type === 'system').length})
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                          {getTypeIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{new Date(notification.timestamp).toLocaleString()}</span>
                            {notification.relatedUser && (
                              <span>by {notification.relatedUser.name}</span>
                            )}
                            <Badge variant="outline" className="capitalize">
                              {notification.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {notification.actionUrl && (
                          <Button size="sm" variant="outline">
                            {notification.actionText || 'View'}
                          </Button>
                        )}
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No notifications found</p>
                  <p className="text-sm text-gray-400">You're all caught up!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => 
                      updateSettings({ ...settings, emailNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Push Notifications</h4>
                    <p className="text-sm text-gray-500">Receive browser notifications</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => 
                      updateSettings({ ...settings, pushNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Attendance Alerts</h4>
                    <p className="text-sm text-gray-500">Get notified about late arrivals and absences</p>
                  </div>
                  <Switch
                    checked={settings.attendanceAlerts}
                    onCheckedChange={(checked) => 
                      updateSettings({ ...settings, attendanceAlerts: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Leave Requests</h4>
                    <p className="text-sm text-gray-500">Get notified about new leave requests</p>
                  </div>
                  <Switch
                    checked={settings.leaveRequests}
                    onCheckedChange={(checked) => 
                      updateSettings({ ...settings, leaveRequests: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">System Updates</h4>
                    <p className="text-sm text-gray-500">Get notified about system maintenance and updates</p>
                  </div>
                  <Switch
                    checked={settings.systemUpdates}
                    onCheckedChange={(checked) => 
                      updateSettings({ ...settings, systemUpdates: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Reminder Notifications</h4>
                    <p className="text-sm text-gray-500">Get reminded about pending tasks</p>
                  </div>
                  <Switch
                    checked={settings.reminderNotifications}
                    onCheckedChange={(checked) => 
                      updateSettings({ ...settings, reminderNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Weekly Reports</h4>
                    <p className="text-sm text-gray-500">Receive weekly summary reports</p>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => 
                      updateSettings({ ...settings, weeklyReports: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Real-time Updates</h4>
                    <p className="text-sm text-gray-500">Get instant notifications for important events</p>
                  </div>
                  <Switch
                    checked={settings.realTimeUpdates}
                    onCheckedChange={(checked) => 
                      updateSettings({ ...settings, realTimeUpdates: checked })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}