'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PalmEnrollmentModal } from '@/components/features/palm-enrollment-modal'
import { CardIssuanceModal } from '@/components/features/card-issuance-modal'
import { UserProfileModal } from '@/components/features/user-profile-modal'
import { UserEditModal } from '@/components/features/user-edit-modal'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, LayoutGrid, ListIcon, Search, User, Mail, Phone, Calendar, Clock, AlertTriangle, CheckCircle, Edit, Trash2, Smartphone, Shield, Plus, GraduationCap, Users, Crown, Star, Hand, CreditCard, Eye, Download, Upload, ChevronDown, FileText } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog'
import { Switch } from '@/components/ui/switch'
import * as XLSX from 'xlsx'

type User = {
  id: string
  fullName: string
  employeeId: string
  userType: string
  icNumber: string
  email: string | null
  phone: string
  palmId: string | null
  smartCardId: string | null
  createdAt: string
  biometricEnrolled: boolean
  cardIssued: boolean
  avatar_url?: string
  status: 'active' | 'inactive' | 'suspended'
}

const userTypeColors = {
  teacher: 'bg-green-100 text-green-800 border-green-200',
  staff: 'bg-blue-100 text-blue-800 border-blue-200',
  student: 'bg-purple-100 text-purple-800 border-purple-200',
  admin: 'bg-red-100 text-red-800 border-red-200',
  superadmin: 'bg-purple-100 text-purple-800 border-purple-200'
}

const userTypeIcons = {
  teacher: Users,
  staff: User,
  student: GraduationCap,
  admin: Shield,
  superadmin: Crown
}

export default function SimpleUserManagementV2Page() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [institutionId, setInstitutionId] = useState<string | null>(null)
  const [currentUserName, setCurrentUserName] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [addingUser, setAddingUser] = useState(false)
  const [palmModalOpen, setPalmModalOpen] = useState(false)
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        toast.error('Please sign in to access user management')
        return
      }
      
      let currentUser = null
      
      const { data: userByAuthId } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()
      
      if (userByAuthId) {
        currentUser = userByAuthId
      } else {
        const { data: userById } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        if (userById) {
          currentUser = userById
        } else if (authUser.email) {
          const { data: userByEmail } = await supabase
            .from('users')
            .select('*')
            .eq('email', authUser.email)
            .single()
          
          currentUser = userByEmail
        }
      }
      
      if (!currentUser) {
        toast.error('User profile not found. Please contact support.')
        return
      }
      
      if (!['time_web', 'time_mobile'].includes(currentUser.primary_system)) {
        toast.error('Access denied. This page is only for TIME system users.')
        return
      }
      
      if (!currentUser.institution_id) {
        toast.error('User is not associated with any institution')
        return
      }
      
      setInstitutionId(currentUser.institution_id)
      setCurrentUserName(currentUser.full_name)
      
      await fetchUsers(currentUser.institution_id)
      
    } catch (error) {
      console.error('Initialization error:', error)
      toast.error('Failed to initialize user management')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async (instId: string) => {
    try {
      const response = await fetch(`/api/users?institutionId=${instId}`)
      const result = await response.json()
      
      if (result.success) {
        const timeUsers = (result.users || []).filter((user: any) => {
          return ['time_web', 'time_mobile'].includes(user.primary_system)
        })
        
        const transformedUsers: User[] = timeUsers.map((user: any) => ({
          id: user.id,
          fullName: user.full_name,
          employeeId: user.employee_id,
          userType: user.smartid_hub_role || user.primary_role,
          icNumber: user.ic_number,
          email: user.email,
          phone: user.phone || '',
          palmId: user.palm_id || null,
          smartCardId: user.smart_card_id || null,
          createdAt: user.created_at?.split('T')[0] || '',
          biometricEnrolled: !!user.palm_id,
          cardIssued: !!user.smart_card_id,
          avatar_url: user.avatar_url,
          status: user.status || 'active'
        }))
        
        setUsers(transformedUsers)
      } else {
        toast.error(result.error || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    }
  }

  const handleAddUser = async (data: any) => {
    if (!institutionId) {
      toast.error('Institution not found')
      return
    }

    try {
      setAddingUser(true)
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          institution_id: institutionId,
          smartid_time_role: data.primary_role,
          primary_system: 'time_web',
          status: 'active'
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success('User added successfully!')
        // Refresh users list
        await fetchUsers(institutionId)
      } else {
        toast.error(result.error || 'Failed to add user')
      }
    } catch (error) {
      console.error('Error adding user:', error)
      toast.error('Failed to add user')
    } finally {
      setAddingUser(false)
    }
  }

  const handlePalmEnrollment = async (userId: string, palmId: string) => {
    console.log('Palm enrollment completed:', { userId, palmId })
    if (institutionId) {
      await fetchUsers(institutionId)
    }
  }

  const handleCardIssuance = async (userId: string, cardId: string) => {
    console.log('Card issuance completed:', { userId, cardId })
    if (institutionId) {
      await fetchUsers(institutionId)
    }
  }

  const confirmDelete = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    setIsDeleting(true)
    try {
      await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE'
      })

      toast.success(`${userToDelete.fullName} has been removed`)
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      
      if (institutionId) {
        await fetchUsers(institutionId)
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('Failed to remove user')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleResendEmail = async (user: User) => {
    try {
      const response = await fetch('/api/users/resend-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(`Welcome email sent to ${user.email}!`)
      } else {
        toast.error(result.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error resending email:', error)
      toast.error('Failed to send email')
    }
  }

  const openPalmModal = (user: User) => {
    setSelectedUser(user)
    setPalmModalOpen(true)
  }

  const openCardModal = (user: User) => {
    setSelectedUser(user)
    setCardModalOpen(true)
  }

  const openProfileModal = (user: User) => {
    setSelectedUser(user)
    setProfileModalOpen(true)
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setEditModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const UserCard = ({ user }: { user: User }) => (
    <div className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-slate-700 transition-all duration-200 hover:scale-[1.01] overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {/* Status indicator */}
            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
              user.status === 'active' ? 'bg-green-500' : 
              user.status === 'suspended' ? 'bg-red-500' : 'bg-gray-400'
            }`}></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">{user.fullName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {(() => {
                    const IconComponent = userTypeIcons[user.userType as keyof typeof userTypeIcons] || User;
                    return <IconComponent className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
                  })()}
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 capitalize">
                    {user.userType}
                  </span>
                </div>
              </div>
              
              {/* Quick Actions - Always Visible */}
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-600" 
                  title="View details"
                  onClick={() => openProfileModal(user)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
                  title="Edit user"
                  onClick={() => openEditModal(user)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                {user.email && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-green-50 dark:hover:bg-green-900 text-green-600"
                    title="Resend welcome email"
                    onClick={() => handleResendEmail(user)}
                  >
                    <Mail className="h-3 w-3" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 hover:bg-red-50 dark:hover:bg-red-900 text-red-500"
                  title="Delete user"
                  onClick={() => confirmDelete(user)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Contact Details */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4" />
                <span className="font-medium">{user.employeeId}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="h-4 w-4" />
                <span>{user.phone}</span>
              </div>
              {user.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{user.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Services Section */}
      <div className="border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 p-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-3">Services</h4>
        
        <div className="space-y-3">
          {/* Palm Biometric */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hand className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Palm Biometric</span>
            </div>
            {user.biometricEnrolled ? (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">Active</span>
              </div>
            ) : (
              <Button size="sm" className="h-7 text-xs px-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-sm" onClick={() => openPalmModal(user)}>
                Enroll
              </Button>
            )}
          </div>
          
          {/* Smart Card */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Smart Card</span>
            </div>
            {user.cardIssued ? (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">Issued</span>
              </div>
            ) : (
              <Button size="sm" className="h-7 text-xs px-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-sm" onClick={() => openCardModal(user)}>
                Issue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const UserRow = ({ user }: { user: User }) => (
    <div className="group p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all duration-200 border-b border-gray-100 dark:border-slate-700/50 last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-slate-600 shadow-sm">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold">
                {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
              user.status === 'active' ? 'bg-green-500' : 
              user.status === 'suspended' ? 'bg-red-500' : 'bg-gray-400'
            }`}></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate">{user.fullName}</h3>
              {(() => {
                const IconComponent = userTypeIcons[user.userType as keyof typeof userTypeIcons] || User;
                return <IconComponent className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
              })()}
              <Badge className="text-xs px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{user.employeeId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{user.phone}</span>
              </div>
              {user.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="truncate max-w-xs">{user.email}</span>
                </div>
              )}
            </div>
            
            {/* Services status */}
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${user.biometricEnrolled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Palm {user.biometricEnrolled ? 'Enrolled' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${user.cardIssued ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Card {user.cardIssued ? 'Issued' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Service buttons */}
          <div className="flex items-center gap-2">
            {!user.biometricEnrolled && (
              <Button size="sm" className="h-8 text-xs px-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-sm flex items-center gap-1" onClick={() => openPalmModal(user)}>
                <Hand className="h-3 w-3" />
                Enroll Palm
              </Button>
            )}
            {!user.cardIssued && (
              <Button size="sm" className="h-8 text-xs px-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-sm flex items-center gap-1" onClick={() => openCardModal(user)}>
                <CreditCard className="h-3 w-3" />
                Issue Card
              </Button>
            )}
          </div>
          
          {/* Action buttons - Always Visible */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600" 
              title="View details"
              onClick={() => openProfileModal(user)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-slate-700"
              title="Edit user"
              onClick={() => openEditModal(user)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {user.email && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900 text-green-600"
                onClick={() => handleResendEmail(user)}
                title="Resend welcome email"
              >
                <Mail className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
              onClick={() => confirmDelete(user)}
              title="Delete user"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  // Export users to Excel
  const exportUsersToExcel = async () => {
    setIsExporting(true)
    
    try {
      // Add small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Calculate current filtered users for export
      const currentFilteredUsers = users.filter(user => {
        // Search filter
        const matchesSearch = !searchTerm || 
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
        
        // Type filter
        const matchesType = filterType === 'all' || user.userType === filterType
        
        // Status filter
        const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
        
        return matchesSearch && matchesType && matchesStatus
      })
      
      // Prepare user data for export
      const exportData = currentFilteredUsers.map(user => ({
        'Full Name': user.fullName,
        'Employee ID': user.employeeId,
        'IC Number': user.icNumber,
        'Role': user.userType.charAt(0).toUpperCase() + user.userType.slice(1),
        'Email': user.email || 'Not provided',
        'Phone': user.phone,
        'Status': user.status.charAt(0).toUpperCase() + user.status.slice(1),
        'Biometric Enrolled': user.biometricEnrolled ? 'Yes' : 'No',
        'Card Issued': user.cardIssued ? 'Yes' : 'No',
        'Palm ID': user.palmId || 'Not enrolled',
        'Smart Card ID': user.smartCardId || 'Not issued',
        'Created Date': user.createdAt || 'Unknown'
      }))

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(exportData)

      // Set column widths
      const columnWidths = [
        { wch: 25 }, // Full Name
        { wch: 15 }, // Employee ID
        { wch: 15 }, // IC Number
        { wch: 12 }, // Role
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 10 }, // Status
        { wch: 18 }, // Biometric Enrolled
        { wch: 12 }, // Card Issued
        { wch: 15 }, // Palm ID
        { wch: 15 }, // Smart Card ID
        { wch: 12 }  // Created Date
      ]
      worksheet['!cols'] = columnWidths

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')

      // Add summary sheet
      const summaryData = [
        { 'Metric': 'Total Users', 'Value': users.length },
        { 'Metric': 'Active Users', 'Value': users.filter(u => u.status === 'active').length },
        { 'Metric': 'Teachers', 'Value': users.filter(u => u.userType === 'teacher').length },
        { 'Metric': 'Staff', 'Value': users.filter(u => u.userType === 'staff').length },
        { 'Metric': 'Students', 'Value': users.filter(u => u.userType === 'student').length },
        { 'Metric': 'Admins', 'Value': users.filter(u => u.userType === 'admin').length },
        { 'Metric': 'Biometric Enrolled', 'Value': users.filter(u => u.biometricEnrolled).length },
        { 'Metric': 'Cards Issued', 'Value': users.filter(u => u.cardIssued).length },
        { 'Metric': 'Export Date', 'Value': new Date().toLocaleDateString() }
      ]
      
      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData)
      summaryWorksheet['!cols'] = [{ wch: 25 }, { wch: 20 }]
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary')

      // Generate filename
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-')
      
      const filename = `User_Management_Report_${currentDate}.xlsx`

      // Save file
      XLSX.writeFile(workbook, filename)
      
      // Show success message
      const userCount = currentFilteredUsers.length
      const userText = userCount === 0 
        ? 'Empty user report exported'
        : `${userCount} user${userCount !== 1 ? 's' : ''} exported`
      
      toast.success(
        `✅ User report exported successfully!\n` +
        `👥 ${userText}\n` +
        `📁 File: ${filename}\n` +
        `📋 Includes: User data + Summary sheet`,
        { duration: 6000 }
      )
      
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export user report. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  // Download template for bulk import
  const downloadTemplate = () => {
    try {
      // Create template data with sample rows
      const templateData = [
        {
          'Full Name': 'John Doe',
          'IC Number': '010308-03-0644',
          'Email': 'john.doe@example.com',
          'Phone': '+60123456789',
          'Role': 'Teacher'
        },
        {
          'Full Name': 'Jane Smith',
          'IC Number': '950715-08-1234',
          'Email': 'jane.smith@example.com',
          'Phone': '+60123456788',
          'Role': 'Staff'
        },
        {
          'Full Name': 'Bob Johnson',
          'IC Number': '021225-01-5678',
          'Email': '',
          'Phone': '+60123456787',
          'Role': 'Student'
        }
      ]

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(templateData)

      // Set column widths
      const columnWidths = [
        { wch: 25 }, // Full Name
        { wch: 15 }, // IC Number
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 12 }  // Role
      ]
      worksheet['!cols'] = columnWidths

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users Template')

      // Create instructions sheet
      const instructionsData = [
        { 'Field': 'Full Name', 'Required': 'Yes', 'Description': 'Complete name of the user', 'Example': 'John Doe' },
        { 'Field': 'IC Number', 'Required': 'No', 'Description': 'Identity card number (optional)', 'Example': '990101-01-9999' },
        { 'Field': 'Email', 'Required': 'No', 'Description': 'Email address (optional)', 'Example': 'user@example.com' },
        { 'Field': 'Phone', 'Required': 'Yes', 'Description': 'Phone number with country code', 'Example': '+60123456789' },
        { 'Field': 'Role', 'Required': 'Yes', 'Description': 'Must be: Teacher, Staff, Student, or Admin', 'Example': 'Teacher' }
      ]

      const instructionsWorksheet = XLSX.utils.json_to_sheet(instructionsData)
      instructionsWorksheet['!cols'] = [
        { wch: 12 }, // Field
        { wch: 10 }, // Required
        { wch: 40 }, // Description
        { wch: 20 }  // Example
      ]
      XLSX.utils.book_append_sheet(workbook, instructionsWorksheet, 'Instructions')

      // Generate filename
      const filename = 'User_Import_Template.xlsx'

      // Save file
      XLSX.writeFile(workbook, filename)
      
      toast.success(
        `📥 Import template downloaded!\n` +
        `📋 File: ${filename}\n` +
        `✏️ Fill in your user data and import back`,
        { duration: 5000 }
      )
      
    } catch (error) {
      console.error('Template download error:', error)
      toast.error('Failed to download template. Please try again.')
    }
  }

  // Import users from Excel
  const handleBulkImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls,.csv'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setIsImporting(true)
      
      try {
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // Validate and process imported data
        const validUsers = []
        const errors = []

        jsonData.forEach((row: any, index) => {
          const rowNum = index + 1
          
          // Required fields validation
          if (!row['Full Name'] || !row['Phone'] || !row['Role']) {
            errors.push(`Row ${rowNum}: Missing required fields (Full Name, Phone, Role)`)
            return
          }

          // IC Number format validation (if provided)
          const icNumber = row['IC Number']?.toString().trim()
          if (icNumber && icNumber !== '') {
            const icPattern = /^\d{6}-\d{2}-\d{4}$/
            if (!icPattern.test(icNumber)) {
              errors.push(`Row ${rowNum}: Invalid IC number format "${icNumber}". Please check the format.`)
              return
            }
          }

          // Role validation
          const role = row['Role']?.toLowerCase()
          if (!['teacher', 'staff', 'student', 'admin'].includes(role)) {
            errors.push(`Row ${rowNum}: Invalid role "${row['Role']}". Must be Teacher, Staff, Student, or Admin`)
            return
          }

          validUsers.push({
            full_name: row['Full Name'],
            email: row['Email'] || null,
            phone: row['Phone'],
            primary_role: role,
            ic_number: icNumber || '',
            status: 'active',
            primary_system: 'time_mobile',
            can_access_web_portal: ['admin', 'teacher'].includes(role),
            can_access_mobile: true
          })
        })

        if (errors.length > 0) {
          toast.error(`Import validation failed:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? `\n...and ${errors.length - 3} more errors` : ''}`)
          return
        }

        if (validUsers.length === 0) {
          toast.warning('No valid users found in the file.')
          return
        }

        // Confirm import
        if (!confirm(`Import ${validUsers.length} users? This will create new user accounts.`)) {
          return
        }

        // Import users one by one
        let successCount = 0
        let failureCount = 0

        for (const userData of validUsers) {
          try {
            await handleAddUser(userData)
            successCount++
          } catch (error) {
            failureCount++
            console.error('Failed to import user:', userData.full_name, error)
          }
        }

        // Show results
        if (successCount > 0) {
          toast.success(`✅ Successfully imported ${successCount} user${successCount !== 1 ? 's' : ''}!${failureCount > 0 ? ` (${failureCount} failed)` : ''}`)
          if (institutionId) {
            await fetchUsers(institutionId)
          }
        } else {
          toast.error('Failed to import users. Please check the file format and try again.')
        }

      } catch (error) {
        console.error('Import error:', error)
        toast.error('Failed to process import file. Please check the file format.')
      } finally {
        setIsImporting(false)
      }
    }
    
    input.click()
  }

  // Calculate filtered users based on search term, filter type, and selected status
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = !searchTerm || 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Type filter
    const matchesType = filterType === 'all' || user.userType === filterType
    
    // Status filter
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl p-6 shadow-lg header-card">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                User Management
              </h1>
              <p className="text-white/90">Manage your institution users with modern tools and insights</p>
            </div>
            <div className="mt-4 lg:mt-0 flex items-center gap-3">
              {/* Export Button */}
              <Button 
                type="button" 
                variant="outline"
                onClick={exportUsersToExcel}
                disabled={isExporting}
                className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 shadow-lg"
                aria-label="Export users to Excel"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export to Excel
                  </>
                )}
              </Button>
              
              {/* Bulk Import Dropdown */}
              <div className="relative">
                <div className="flex">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleBulkImport}
                    disabled={isImporting}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 shadow-lg rounded-r-none border-r-0"
                    aria-label="Import users from Excel"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Bulk Import
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={downloadTemplate}
                    disabled={isImporting}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 shadow-lg rounded-l-none px-2"
                    aria-label="Download import template"
                    title="Download Template"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Enhanced Add User Button */}
              <AddStaffDialog
                roles={[
                  { id: 'teacher', name: 'Teacher' },
                  { id: 'staff', name: 'Staff' },
                  { id: 'student', name: 'Student' },
                  { id: 'admin', name: 'Admin' }
                ]}
                onSubmit={handleAddUser}
                isPending={addingUser}
              />
            </div>
          </div>
          
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-indigo-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{filteredUsers.length}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Active Users</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
                <Hand className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{users.filter(u => u.biometricEnrolled).length}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Biometric Enrolled</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{users.filter(u => u.cardIssued).length}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Cards Issued</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border border-gray-100 dark:border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="teacher"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-gray-600 dark:text-gray-400" /> Teachers</div></SelectItem>
                    <SelectItem value="staff"><div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-600 dark:text-gray-400" /> Staff</div></SelectItem>
                    <SelectItem value="student"><div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-gray-600 dark:text-gray-400" /> Students</div></SelectItem>
                    <SelectItem value="admin"><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-gray-600 dark:text-gray-400" /> Admins</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Active</div></SelectItem>
                    <SelectItem value="inactive"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-400"></div> Inactive</div></SelectItem>
                    <SelectItem value="suspended"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Suspended</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                {/* View Toggle with icons only */}
                <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'card' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('card')}
                    className={`h-8 w-8 p-0 ${viewMode === 'card' ? 'bg-white dark:bg-slate-600 shadow-sm text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`h-8 w-8 p-0 ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    <ListIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Display */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredUsers.map(user => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        ) : (
          <Card className="border border-gray-100 dark:border-slate-700">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map(user => (
                  <UserRow key={user.id} user={user} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {filteredUsers.length === 0 && !loading && (
          <Card className="border border-gray-100 dark:border-slate-700">
            <CardContent className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No users found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
              <div className="text-sm text-gray-400 space-y-1">
                <p>• Check your search terms</p>
                <p>• Try different filters</p>
                <p>• Add new users to your institution</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        {selectedUser && (
          <>
            <PalmEnrollmentModal
              isOpen={palmModalOpen}
              onClose={() => setPalmModalOpen(false)}
              user={{
                id: selectedUser.id,
                full_name: selectedUser.fullName,
                employee_id: selectedUser.employeeId,
                role: selectedUser.userType,
                palm_id: selectedUser.palmId,
                isReEnrollment: false
              }}
              onEnrollmentComplete={handlePalmEnrollment}
            />

            <CardIssuanceModal
              isOpen={cardModalOpen}
              onClose={() => setCardModalOpen(false)}
              user={{
                id: selectedUser.id,
                fullName: selectedUser.fullName,
                employeeId: selectedUser.employeeId,
                userType: selectedUser.userType
              }}
              onIssuanceComplete={handleCardIssuance}
            />

            <UserProfileModal
              isOpen={profileModalOpen}
              onClose={() => setProfileModalOpen(false)}
              userId={selectedUser.id}
            />

            <UserEditModal
              isOpen={editModalOpen}
              onClose={() => setEditModalOpen(false)}
              userId={selectedUser.id}
              onUserUpdated={() => {
                if (institutionId) {
                  fetchUsers(institutionId)
                }
              }}
            />
          </>
        )}

        {/* Delete Confirmation */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Remove User"
          description={`Are you sure you want to remove ${userToDelete?.fullName} from your institution? This action cannot be undone.`}
          confirmText="Remove User"
          cancelText="Cancel"
          variant="destructive"
          isLoading={isDeleting}
          onConfirm={handleDeleteUser}
        />
      </div>
    </DashboardLayout>
  )
}

// Add Staff Dialog Component
interface AddStaffDialogProps {
  roles: { id: string; name: string }[]
  onSubmit: (data: any) => Promise<void>
  isPending: boolean
}

function AddStaffDialog({ roles, onSubmit, isPending }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    icNumber: '',
    employeeCode: '',
    isActive: true
  })

  // Auto-generate employee code when name changes
  React.useEffect(() => {
    if (formData.name && !formData.employeeCode) {
      const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase()
      const timestamp = Date.now().toString().slice(-4)
      setFormData(prev => ({
        ...prev,
        employeeCode: `${initials}${timestamp}`
      }))
    }
  }, [formData.name])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone || !formData.role || !formData.icNumber) {
      toast.error('Please fill in all required fields')
      return
    }
    
    // Validate IC format
    const icPattern = /^\d{6}-\d{2}-\d{4}$/
    if (!icPattern.test(formData.icNumber)) {
      toast.error('Invalid IC number format. Please check and try again.')
      return
    }

    try {
      await onSubmit({
        full_name: formData.name,
        email: formData.email || null,
        phone: formData.phone,
        primary_role: formData.role,
        ic_number: formData.icNumber,
        status: 'active',
        primary_system: 'time_mobile',
        can_access_web_portal: ['admin', 'teacher'].includes(formData.role),
        can_access_mobile: true
      })
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        icNumber: '',
        employeeCode: '',
        isActive: true
      })
      setOpen(false)
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account for SmartID TIME
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 pr-2">
          <form id="staff-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff-name">Full Name *</Label>
                <Input 
                  id="staff-name" 
                  placeholder="Enter full name" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="staff-ic">IC Number *</Label>
                <Input 
                  id="staff-ic" 
                  placeholder="990101-01-9999"
                  value={formData.icNumber}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^0-9-]/g, '')
                    // Auto-format as user types: add dashes at positions 6 and 9
                    if (value.length >= 7 && value.charAt(6) !== '-') {
                      value = value.substring(0, 6) + '-' + value.substring(6)
                    }
                    if (value.length >= 10 && value.charAt(9) !== '-') {
                      value = value.substring(0, 9) + '-' + value.substring(9)
                    }
                    // Limit to correct length
                    if (value.length > 14) {
                      value = value.substring(0, 14)
                    }
                    setFormData(prev => ({ ...prev, icNumber: value }))
                  }}
                  maxLength={14}
                  pattern="\d{6}-\d{2}-\d{4}"
                  title="Identity card number"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="staff-email">Email</Label>
                  <Input 
                    id="staff-email" 
                    type="email" 
                    placeholder="email@example.com" 
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="staff-phone">Phone *</Label>
                  <Input 
                    id="staff-phone" 
                    placeholder="+60123456789" 
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff-role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="staff-employee-code">Employee ID</Label>
                <Input 
                  id="staff-employee-code" 
                  placeholder="Auto-generated" 
                  value={formData.employeeCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeCode: e.target.value }))}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">Auto-generated from name - used for system login</p>
              </div>
            </div>
          </form>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t bg-white dark:bg-gray-900">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="staff-form"
            disabled={isPending || !formData.name || !formData.phone || !formData.role || !formData.icNumber}
          >
            {isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                Creating...
              </>
            ) : (
              'Create User'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
