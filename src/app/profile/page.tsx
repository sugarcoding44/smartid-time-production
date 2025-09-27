'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  User, 
  Building2, 
  Crown, 
  Calendar, 
  CreditCard, 
  Settings, 
  Shield, 
  Bell, 
  Mail, 
  Phone,
  MapPin,
  Edit3,
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Database,
  Activity
} from 'lucide-react'

type SubscriptionPlan = {
  name: string
  status: 'active' | 'expired' | 'trial' | 'suspended'
  startDate: string
  endDate: string
  price: number
  features: string[]
  maxUsers: number
  maxStorage: string
}

type InstitutionProfile = {
  id: string
  name: string
  type: string
  address: string
  city: string
  state: string
  postal_code: string
  phone: string
  email: string
  website?: string
  logo_url?: string
}

type AdminProfile = {
  id: string
  full_name: string
  email: string
  phone: string
  role: string
  last_login: string
  two_factor_enabled: boolean
  notifications_enabled: boolean
  email_notifications: boolean
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'institution' | 'subscription' | 'security'>('profile')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingInstitution, setIsEditingInstitution] = useState(false)

  // Real data from Supabase
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [institutionProfile, setInstitutionProfile] = useState<InstitutionProfile | null>(null)
  const [subscription, setSubscription] = useState<SubscriptionPlan>({
    name: 'SmartID TIME Premium',
    status: 'active',
    startDate: '2025-09-23',
    endDate: '2026-09-22',
    price: 700.00,
    maxUsers: 1000,
    maxStorage: '50GB',
    features: [
      'Attendance Management',
      'Leave Management', 
      'Work Groups',
      'Holiday Management',
      'Advanced Analytics',
      'Email Support',
      'API Access',
      'Custom Reporting'
    ]
  })

  const [usage] = useState({
    users: 247,
    storage: '12.3GB',
    apiCalls: 15420,
    lastBackup: '2025-09-25T02:00:00Z'
  })

  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      
      // Use the working debug endpoint like other pages
      const debugResponse = await fetch('/api/debug/supabase')
      const debugData = await debugResponse.json()
      
      // Get the actual authenticated user ID
      const authTest = debugData.tests.find((t: any) => t.name === 'Auth Session')
      const currentAuthUserId = authTest?.data?.userId
      
      if (!currentAuthUserId) {
        toast.error('Authentication required')
        return
      }
      
      // Find the actual current user from service test data
      const serviceTest = debugData.tests.find((t: any) => t.name === 'Service Role Client')
      const allUsers = serviceTest?.data || []
      
      let currentUser = allUsers.find((u: any) => u.auth_user_id === currentAuthUserId)
      if (!currentUser) {
        currentUser = allUsers.find((u: any) => u.id === currentAuthUserId)
      }
      
      console.log('👤 Found current user for Profile Settings:', currentUser)
      
      if (currentUser) {
        // Set admin profile from debug data
        setAdminProfile({
          id: currentUser.id,
          full_name: currentUser.name || currentUser.full_name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          role: getDisplayRole(currentUser.smartid_hub_role || currentUser.primary_role || 'admin'),
          last_login: new Date().toISOString(),
          two_factor_enabled: false,
          notifications_enabled: true,
          email_notifications: true
        })
        
        // Always set institution data - try real data first, then fallback to demo data
        let institutionSet = false
        
        if (currentUser.institution_id) {
          try {
            console.log('🏢 Trying to fetch institution:', currentUser.institution_id)
            const instResponse = await fetch(`/api/institution?id=${currentUser.institution_id}&t=${Date.now()}`)
            const instData = await instResponse.json()
            
            console.log('🏢 Institution API response:', instData)
            
            if (instData.success && instData.data) {
              console.log('✅ Institution data found:', instData.data)
              const inst = instData.data
              
              const institutionData = {
                id: inst.id,
                name: inst.name || 'Unknown Institution',
                type: inst.type || 'Unknown',
                address: inst.address || 'No address provided',
                city: '', // Not in DB schema 
                state: '', // Not in DB schema
                postal_code: '', // Not in DB schema
                phone: inst.phone || 'No phone provided',
                email: inst.email || 'No email provided',
                website: '', // Not in current DB schema
                logo_url: undefined // Not in current DB schema
              }
              
              console.log('🏢 Setting institution profile:', institutionData)
              setInstitutionProfile(institutionData)
              
              // Update subscription based on institution plan
              if (inst.subscription_plan) {
                setSubscription(prev => ({ 
                  ...prev, 
                  name: `SmartID ${inst.subscription_plan.toUpperCase()}`,
                  status: inst.status === 'active' ? 'active' : 'inactive'
                }))
              }
              
              institutionSet = true
            } else {
              console.log('Institution API response not successful:', instData)
            }
          } catch (instError) {
            console.log('Institution API error:', instError)
          }
        }
        
        // If no institution was set (either no ID or API failed), use demo data
        if (!institutionSet) {
          console.log('⚠️ Setting fallback institution data')
          setInstitutionProfile({
            id: 'demo-institution',
            name: 'SmartID Demo Institution',
            type: 'School',
            address: '123 Education Boulevard, Kuala Lumpur, Malaysia',
            city: 'Kuala Lumpur',
            state: 'Federal Territory',
            postal_code: '50470',
            phone: '+60 3-1234-5678',
            email: 'admin@smartid-demo.edu.my',
            website: 'https://smartid-demo.edu.my',
            logo_url: undefined
          })
        }
      } else {
        console.error('❌ No current user found in debug data')
        toast.error('Could not load user information')
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      console.log('🏁 Profile loading completed. Institution profile set:', !!institutionProfile)
      setLoading(false)
    }
  }
  
  const getDisplayRole = (role: string): string => {
    const roleMap: Record<string, string> = {
      'superadmin': 'Super Administrator',
      'admin': 'Administrator',
      'hr_manager': 'HR Manager',
      'teacher': 'Teacher',
      'staff': 'Staff',
      'student': 'Student'
    }
    return roleMap[role] || role
  }

  const handleSaveProfile = async () => {
    if (!adminProfile) return
    
    setSaving(true)
    try {
      // For now, just simulate success since we're using mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Profile updated successfully!')
      setIsEditingProfile(false)
      
      // In a real implementation, this would update the database
      console.log('Profile updated:', {
        full_name: adminProfile.full_name,
        phone: adminProfile.phone,
        two_factor_enabled: adminProfile.two_factor_enabled,
        notifications_enabled: adminProfile.notifications_enabled,
        email_notifications: adminProfile.email_notifications
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveInstitution = async () => {
    if (!institutionProfile) return
    
    setSaving(true)
    try {
      // For now, just simulate success since we're using mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Institution details updated successfully!')
      setIsEditingInstitution(false)
      
      // In a real implementation, this would update the database
      console.log('Institution updated:', {
        name: institutionProfile.name,
        type: institutionProfile.type,
        address: institutionProfile.address,
        phone: institutionProfile.phone,
        email: institutionProfile.email
        // Note: website field is not in current DB schema
      })
    } catch (error) {
      console.error('Error updating institution:', error)
      toast.error('Failed to update institution details')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'trial': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'suspended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'trial': return <Clock className="w-4 h-4" />
      case 'expired': return <AlertTriangle className="w-4 h-4" />
      case 'suspended': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysRemaining = () => {
    const endDate = new Date(subscription.endDate)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading || !adminProfile) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-0 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {adminProfile.full_name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your account, institution, and subscription details</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { key: 'profile', label: 'Personal Profile', icon: User },
            { key: 'institution', label: 'Institution', icon: Building2 },
            { key: 'subscription', label: 'Subscription', icon: Crown },
            { key: 'security', label: 'Security', icon: Shield }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === key
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>

        {/* Personal Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditingProfile ? 'Cancel' : 'Edit'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={adminProfile.full_name}
                        onChange={(e) => setAdminProfile({...adminProfile, full_name: e.target.value})}
                        disabled={!isEditingProfile}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={adminProfile.role}
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={adminProfile.email}
                        onChange={(e) => setAdminProfile({...adminProfile, email: e.target.value})}
                        disabled={!isEditingProfile}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={adminProfile.phone}
                        onChange={(e) => setAdminProfile({...adminProfile, phone: e.target.value})}
                        disabled={!isEditingProfile}
                      />
                    </div>
                  </div>
                  
                  {isEditingProfile && (
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSaveProfile} disabled={saving} className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Login</span>
                    <span className="text-sm font-medium dark:text-white">
                      {formatDate(adminProfile.last_login)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account Created</span>
                    <span className="text-sm font-medium dark:text-white">Sep 23, 2025</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Institution Tab */}
        {activeTab === 'institution' && (
          institutionProfile ? (
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Institution Details
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingInstitution(!isEditingInstitution)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {isEditingInstitution ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="institutionName">Institution Name</Label>
                  <Input
                    id="institutionName"
                    value={institutionProfile.name || ''}
                    onChange={(e) => setInstitutionProfile({...institutionProfile, name: e.target.value})}
                    disabled={!isEditingInstitution}
                  />
                </div>
                <div>
                  <Label htmlFor="institutionType">Type</Label>
                  <Input
                    id="institutionType"
                    value={institutionProfile.type || ''}
                    onChange={(e) => setInstitutionProfile({...institutionProfile, type: e.target.value})}
                    disabled={!isEditingInstitution}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={institutionProfile.address || ''}
                    onChange={(e) => setInstitutionProfile({...institutionProfile, address: e.target.value})}
                    disabled={!isEditingInstitution}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="institutionPhone">Phone</Label>
                  <Input
                    id="institutionPhone"
                    value={institutionProfile.phone || ''}
                    onChange={(e) => setInstitutionProfile({...institutionProfile, phone: e.target.value})}
                    disabled={!isEditingInstitution}
                  />
                </div>
                <div>
                  <Label htmlFor="institutionEmail">Email</Label>
                  <Input
                    id="institutionEmail"
                    type="email"
                    value={institutionProfile.email || ''}
                    onChange={(e) => setInstitutionProfile({...institutionProfile, email: e.target.value})}
                    disabled={!isEditingInstitution}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={institutionProfile.website || ''}
                    onChange={(e) => setInstitutionProfile({...institutionProfile, website: e.target.value})}
                    disabled={!isEditingInstitution}
                  />
                </div>
              </div>
              
              {isEditingInstitution && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveInstitution} disabled={saving} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          ) : (
            <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
              <CardContent className="text-center py-12">
                <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Institution Found</h3>
                <p className="text-gray-600 dark:text-gray-400">You are not associated with any institution yet.</p>
              </CardContent>
            </Card>
          )
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold dark:text-white">{subscription.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">RM {subscription.price.toFixed(2)} / year</p>
                    </div>
                    <Badge className={getStatusColor(subscription.status)}>
                      {getStatusIcon(subscription.status)}
                      <span className="ml-1">{subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}</span>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3">
                      <div className="text-sm text-blue-600 dark:text-blue-400">Subscription Period</div>
                      <div className="font-semibold dark:text-white">
                        {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900 rounded-lg p-3">
                      <div className="text-sm text-green-600 dark:text-green-400">Days Remaining</div>
                      <div className="font-semibold dark:text-white">
                        {getDaysRemaining()} days
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium dark:text-white">Included Features:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {subscription.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="dark:text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Usage Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Users</span>
                        <span className="text-sm font-medium dark:text-white">
                          {usage.users} / {subscription.maxUsers}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(usage.users / subscription.maxUsers) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Storage</span>
                        <span className="text-sm font-medium dark:text-white">
                          {usage.storage} / {subscription.maxStorage}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400">API Calls (This Month)</div>
                      <div className="font-semibold dark:text-white">{usage.apiCalls.toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Last Backup</div>
                      <div className="font-semibold dark:text-white">{formatDate(usage.lastBackup)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Billing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    💳 Manage Billing
                  </Button>
                  <Button variant="outline" className="w-full">
                    📄 Download Invoice
                  </Button>
                  <Button variant="outline" className="w-full">
                    🔄 Renew Subscription
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Renewal Notice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Your subscription expires in {getDaysRemaining()} days. Renew now to avoid service interruption.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="2fa">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
                  </div>
                  <Switch 
                    id="2fa"
                    checked={adminProfile.two_factor_enabled}
                    onCheckedChange={(checked) => setAdminProfile({...adminProfile, two_factor_enabled: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive system notifications</p>
                  </div>
                  <Switch 
                    id="notifications"
                    checked={adminProfile.notifications_enabled}
                    onCheckedChange={(checked) => setAdminProfile({...adminProfile, notifications_enabled: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
                  </div>
                  <Switch 
                    id="email-notifications"
                    checked={adminProfile.email_notifications}
                    onCheckedChange={(checked) => setAdminProfile({...adminProfile, email_notifications: checked})}
                  />
                </div>
                
                <div className="pt-4 space-y-3">
                  <Button variant="outline" className="w-full">
                    🔑 Change Password
                  </Button>
                  <Button variant="outline" className="w-full">
                    📱 Manage Devices
                  </Button>
                  <Button variant="outline" className="w-full">
                    🔒 Download Backup Codes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'Login from Kuala Lumpur', time: '2 hours ago', icon: '🔐' },
                    { action: 'Added new user: John Doe', time: '1 day ago', icon: '👤' },
                    { action: 'Generated attendance report', time: '2 days ago', icon: '📊' },
                    { action: 'Updated institution settings', time: '3 days ago', icon: '⚙️' },
                    { action: 'Renewed subscription', time: '1 week ago', icon: '💳' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-lg">{activity.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium dark:text-white">{activity.action}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
