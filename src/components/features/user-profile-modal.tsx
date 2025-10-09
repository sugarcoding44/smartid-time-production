'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Users, 
  Shield, 
  CreditCard, 
  Hand, 
  Clock,
  AlertTriangle,
  CheckCircle,
  IdCard,
  Home,
  GraduationCap,
  Building2,
  Heart,
  UserCheck,
  Settings
} from 'lucide-react'

interface WorkGroup {
  id: string
  name: string
  description?: string | null
  default_start_time: string
  default_end_time: string
  late_threshold_minutes?: number
  early_threshold_minutes?: number
  working_days: number[]
  created_at: string
}

interface UserDetails {
  // Basic user info
  id: string
  full_name: string
  email: string | null
  phone: string | null
  employee_id: string
  ic_number: string
  primary_role: string
  primary_system?: string
  smartid_pos_role?: string | null
  status: string
  created_at: string
  
  // Extended details from user_details table
  date_of_birth?: string | null
  gender?: string | null
  address?: string | null
  avatar_url?: string | null
  emergency_contact?: any
  parent_contact?: any
  grade_class?: string | null
  department?: string | null
  pos_pin_code?: string | null
  palm_enrollment_status?: string
  palm_enrolled_hands?: string[]
  palm_last_enrollment?: string | null
  palm_enrollment_expires?: string | null
  palm_verification_failures?: number
  palm_locked_until?: string | null
  palm_id?: string | null
  palm_enrolled_at?: string | null
  last_palm_scan?: string | null
  palm_scan_count?: number
  palm_status?: string
  palm_quality?: number
  smart_card_id?: string | null
  card_issued_at?: string | null
  
  // Work group information
  work_group?: WorkGroup | null
  work_group_assigned_at?: string | null
}

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
}

export function UserProfileModal({ isOpen, onClose, userId }: UserProfileModalProps) {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails(userId)
    }
  }, [isOpen, userId])

  const fetchUserDetails = async (id: string) => {
    try {
      setLoading(true)
      console.log('Fetching user details for ID:', id)
      
      const response = await fetch(`/api/users/${id}/details`)
      console.log('Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('API response:', result)
      
      if (result.success) {
        setUserDetails(result.data)
        toast.success('User details loaded successfully')
      } else {
        toast.error(`Failed to load user details: ${result.error}`)
        console.error('API Error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(`Network error: ${errorMessage}. Using demo data.`)
      
      // Fallback to mock data for development
      setUserDetails({
        id: id,
        full_name: 'Demo User',
        email: 'demo@example.com',
        phone: '+60123456789',
        employee_id: 'DEMO001',
        ic_number: '123456789012',
        primary_role: 'student',
        status: 'active',
        created_at: new Date().toISOString(),
        date_of_birth: '2000-01-01',
        gender: 'male',
        address: '123 Demo Street, Demo City',
        avatar_url: null,
        emergency_contact: {
          name: 'Demo Emergency Contact',
          phone: '+60987654321',
          relationship: 'Parent'
        },
        parent_contact: {
          name: 'Demo Parent',
          phone: '+60111222333'
        },
        grade_class: 'Grade 12',
        department: 'Science',
        pos_pin_code: null,
        palm_enrollment_status: 'not_enrolled',
        palm_enrolled_hands: [],
        palm_last_enrollment: null,
        palm_enrollment_expires: null,
        palm_verification_failures: 0,
        palm_locked_until: null,
        palm_id: null,
        palm_enrolled_at: null,
        last_palm_scan: null,
        palm_scan_count: 0,
        palm_status: 'pending',
        palm_quality: undefined,
        smart_card_id: null,
        card_issued_at: null
      })
    } finally {
      setLoading(false)
    }
  }

  const getUserTypeIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'teacher': return <UserCheck className="w-5 h-5 text-green-600" />
      case 'staff': return <User className="w-5 h-5 text-blue-600" />
      case 'student': return <GraduationCap className="w-5 h-5 text-purple-600" />
      case 'admin': return <Shield className="w-5 h-5 text-red-600" />
      default: return <User className="w-5 h-5 text-gray-600" />
    }
  }

  const getUserTypeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'teacher': return 'bg-green-100 text-green-800 border-green-200'
      case 'staff': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'student': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'admin': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPalmStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'enrolled': return 'bg-green-100 text-green-800 border-green-200'
      case 'enrolling': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'not_enrolled': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'needs_re_enrollment': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'disabled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never'
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <User className="w-5 h-5" />
            User Profile
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : userDetails ? (
          <div className="space-y-4">
            {/* Simple User Header */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                      {userDetails.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{userDetails.full_name}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ID: {userDetails.employee_id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                    {userDetails.primary_role}
                  </span>
                  {userDetails.work_group && (
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {userDetails.work_group.name}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    userDetails.status === 'active' 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {userDetails.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Simple Tab Navigation */}
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <TabsTrigger value="basic" className="text-sm data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700">Basic Info</TabsTrigger>
                <TabsTrigger value="contact" className="text-sm data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700">Contact</TabsTrigger>
                <TabsTrigger value="workgroup" className="text-sm data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700">Work Group</TabsTrigger>
                <TabsTrigger value="palm" className="text-sm data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700">Biometric</TabsTrigger>
                <TabsTrigger value="academic" className="text-sm data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700">Academic</TabsTrigger>
                <TabsTrigger value="system" className="text-sm data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700">System</TabsTrigger>
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="basic" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                      <p className="text-gray-900 dark:text-gray-100">{userDetails.full_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                      <p className="text-gray-900 dark:text-gray-100 capitalize">{userDetails.gender || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IC Number</label>
                      <p className="text-gray-900 dark:text-gray-100 font-mono">{userDetails.ic_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                      <p className="text-gray-900 dark:text-gray-100">{formatDate(userDetails.date_of_birth)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Contact Information */}
              <TabsContent value="contact" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <p className="text-gray-900 dark:text-gray-100">{userDetails.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <p className="text-gray-900 dark:text-gray-100">{userDetails.phone || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <p className="text-gray-900 dark:text-gray-100">{userDetails.address || 'Not provided'}</p>
                  </div>
                </div>
                
                {(userDetails.emergency_contact || userDetails.parent_contact) && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Emergency Contacts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userDetails.emergency_contact && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Emergency Contact</label>
                          <div className="text-gray-900 dark:text-gray-100">
                            <p>{userDetails.emergency_contact.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{userDetails.emergency_contact.phone}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{userDetails.emergency_contact.relationship}</p>
                          </div>
                        </div>
                      )}
                      {userDetails.parent_contact && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Parent/Guardian</label>
                          <div className="text-gray-900 dark:text-gray-100">
                            <p>{userDetails.parent_contact.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{userDetails.parent_contact.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Work Group Information */}
              <TabsContent value="workgroup" className="mt-6 space-y-6">
                {userDetails.work_group ? (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Work Group Assignment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
                        <p className="text-gray-900 dark:text-gray-100 font-semibold">{userDetails.work_group.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Date</label>
                        <p className="text-gray-900 dark:text-gray-100">{formatDate(userDetails.work_group_assigned_at)}</p>
                      </div>
                      {userDetails.work_group.description && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                          <p className="text-gray-900 dark:text-gray-100">{userDetails.work_group.description}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Action buttons for assigned users */}
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Settings className="w-3 h-3 mr-1" />
                        Change Assignment
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Remove Assignment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No Work Group Assigned</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">This user is not currently assigned to any work group. Assign them to configure their attendance schedule.</p>
                    
                    {/* Action buttons for unassigned users */}
                    <div className="flex flex-col items-center gap-2">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Users className="w-4 h-4 mr-2" />
                        Assign to Work Group
                      </Button>
                      <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50">
                        <Building2 className="w-3 h-3 mr-1" />
                        Create New Work Group
                      </Button>
                    </div>
                  </div>
                )}

                {userDetails.work_group && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Schedule & Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                        <p className="text-gray-900 dark:text-gray-100 font-mono">{userDetails.work_group.default_start_time}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                        <p className="text-gray-900 dark:text-gray-100 font-mono">{userDetails.work_group.default_end_time}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Working Days</label>
                        <p className="text-gray-900 dark:text-gray-100">
                          {userDetails.work_group.working_days?.map(day => {
                            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                            return dayNames[day] || day
                          }).join(', ') || 'Not specified'}
                        </p>
                      </div>
                      {userDetails.work_group.late_threshold_minutes && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Late Threshold</label>
                          <p className="text-gray-900 dark:text-gray-100">
                            <span className="inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-orange-500" />
                              {userDetails.work_group.late_threshold_minutes} minutes
                            </span>
                          </p>
                        </div>
                      )}
                      {userDetails.work_group.early_threshold_minutes && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Early Threshold</label>
                          <p className="text-gray-900 dark:text-gray-100">
                            <span className="inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {userDetails.work_group.early_threshold_minutes} minutes
                            </span>
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created</label>
                        <p className="text-gray-900 dark:text-gray-100">{formatDate(userDetails.work_group.created_at)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Palm Biometric */}
              <TabsContent value="palm" className="mt-6 space-y-6">
                {/* Palm Biometric Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Palm Biometric</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enrollment Status</label>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        userDetails.palm_enrollment_status === 'enrolled' 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        {userDetails.palm_enrollment_status?.replace('_', ' ') || 'Not enrolled'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Palm ID</label>
                      <p className="text-gray-900 dark:text-gray-100 font-mono">{userDetails.palm_id || 'Not assigned'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enrolled Hands</label>
                      <p className="text-gray-900 dark:text-gray-100">
                        {userDetails.palm_enrolled_hands?.join(', ') || 'None'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scan Count</label>
                      <p className="text-gray-900 dark:text-gray-100">{userDetails.palm_scan_count || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Scan</label>
                      <p className="text-gray-900 dark:text-gray-100">{formatDateTime(userDetails.last_palm_scan)}</p>
                    </div>
                  </div>
                </div>
                
                {/* SmartID Card Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">SmartID Card</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Status</label>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        userDetails.smart_card_id 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}>
                        {userDetails.smart_card_id ? 'Issued' : 'Not issued'}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card ID</label>
                      <p className="text-gray-900 dark:text-gray-100 font-mono">{userDetails.smart_card_id || 'Not assigned'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Date</label>
                      <p className="text-gray-900 dark:text-gray-100">{formatDate(userDetails.card_issued_at) || 'Not issued'}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Academic/Work Information */}
              <TabsContent value="academic" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                    <p className="text-gray-900 dark:text-gray-100">{userDetails.department || 'Not assigned'}</p>
                  </div>
                  {userDetails.primary_role?.toLowerCase() === 'student' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grade/Class</label>
                      <p className="text-gray-900 dark:text-gray-100">{userDetails.grade_class || 'Not assigned'}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID</label>
                    <p className="text-gray-900 dark:text-gray-100 font-mono">{userDetails.employee_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <p className="text-gray-900 dark:text-gray-100 capitalize">{userDetails.primary_role}</p>
                  </div>
                </div>
              </TabsContent>

              {/* System Information */}
              <TabsContent value="system" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID</label>
                    <p className="text-gray-900 dark:text-gray-100 font-mono">{userDetails.employee_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      userDetails.status === 'active' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {userDetails.status}
                    </span>
                  </div>
                  {(userDetails.primary_system === 'smartid_pos' || userDetails.smartid_pos_role) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">POS PIN Code</label>
                      <p className="text-gray-900 dark:text-gray-100">{userDetails.pos_pin_code ? '••••' : 'Not set'}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created</label>
                    <p className="text-gray-900 dark:text-gray-100">{formatDate(userDetails.created_at)}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">User details not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
