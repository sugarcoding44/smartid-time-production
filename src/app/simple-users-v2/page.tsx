'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PalmEnrollmentModal } from '@/components/features/palm-enrollment-modal'
import { CardIssuanceModal } from '@/components/features/card-issuance-modal'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { UserPlus } from 'lucide-react'

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
}

const userTypeColors = {
  teacher: 'bg-green-100 text-green-800 border-green-200',
  staff: 'bg-blue-100 text-blue-800 border-blue-200',
  student: 'bg-purple-100 text-purple-800 border-purple-200',
  admin: 'bg-red-100 text-red-800 border-red-200',
  superadmin: 'bg-purple-100 text-purple-800 border-purple-200'
}

const userTypeIcons = {
  teacher: '👨‍🏫',
  staff: '👩‍💼',
  student: '🎓',
  admin: '👑',
  superadmin: '⭐'
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [newUser, setNewUser] = useState({
    fullName: '',
    userType: '',
    icNumber: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      // Get current authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        toast.error('Please sign in to access user management')
        return
      }
      
      console.log('🔐 Authenticated user:', authUser.email)
      
      // Find the user in the users table by multiple methods
      let currentUser = null
      
      // Try by auth_user_id first
      const { data: userByAuthId } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .single()
      
      if (userByAuthId) {
        currentUser = userByAuthId
      } else {
        // Try by ID (for Wan Farah Nadia case)
        const { data: userById } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        if (userById) {
          currentUser = userById
        } else if (authUser.email) {
          // Try by email as last resort (only if email exists)
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
      
      console.log('✅ Found current user:', currentUser.full_name)
      console.log('🏢 Institution ID:', currentUser.institution_id)
      console.log('🎭 Primary system:', currentUser.primary_system)
      console.log('👤 Role:', currentUser.primary_role, currentUser.smartid_hub_role)
      
      // Check if user has access to TIME system
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
      
      // Fetch users from the same institution
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
        // Filter to only show TIME system users
        const timeUsers = (result.users || []).filter((user: any) => {
          return ['time_web', 'time_mobile'].includes(user.primary_system)
        })
        
        // Transform the data to match our User type
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
          cardIssued: !!user.smart_card_id
        }))
        
        setUsers(transformedUsers)
        console.log(`✅ Loaded ${transformedUsers.length} TIME users`)
      } else {
        toast.error(result.error || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    }
  }

  const handleAddUser = async () => {
    if (!newUser.fullName || !newUser.userType || !newUser.icNumber) {
      toast.error('Please fill in all required fields')
      return
    }

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
          full_name: newUser.fullName,
          primary_role: newUser.userType,
          ic_number: newUser.icNumber,
          email: newUser.email || null,
          phone: newUser.phone,
          institution_id: institutionId
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(result.message || 'User added successfully!')
        setIsAddUserOpen(false)
        setNewUser({
          fullName: '',
          userType: '',
          icNumber: '',
          email: '',
          phone: '',
        })
        
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

  const openPalmModal = (user: User) => {
    setSelectedUser(user)
    setPalmModalOpen(true)
  }

  const openCardModal = (user: User) => {
    setSelectedUser(user)
    setCardModalOpen(true)
  }

  const handlePalmEnrollment = async (userId: string, palmId: string) => {
    console.log('Palm enrollment completed:', { userId, palmId })
    await fetchUsers(institutionId!)
  }

  const handleCardIssuance = async (userId: string, cardId: string) => {
    console.log('Card issuance completed:', { userId, cardId })
    await fetchUsers(institutionId!)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = searchTerm === '' || 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.icNumber.includes(searchTerm) ||
      user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = filterType === 'all' || user.userType === filterType
    
    return matchesSearch && matchesFilter
  })

  if (loading) {
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
        {/* Page Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                User Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Managing users for SmartID TIME system • {currentUserName}
              </p>
            </div>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New TIME User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the SmartID TIME system. They will receive access to the mobile app.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="e.g., Ahmad bin Ali"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="userType">User Type *</Label>
                    <Select value={newUser.userType} onValueChange={(value) => setNewUser({...newUser, userType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="teacher">👨‍🏫 Teacher</SelectItem>
                        <SelectItem value="staff">👩‍💼 Staff</SelectItem>
                        <SelectItem value="student">🎓 Student</SelectItem>
                        <SelectItem value="admin">👑 Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="icNumber">IC Number *</Label>
                    <Input
                      id="icNumber"
                      placeholder="e.g., 990101-14-5555"
                      value={newUser.icNumber}
                      onChange={(e) => setNewUser({...newUser, icNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@school.edu.my"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="e.g., 012-345-6789"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleAddUser} 
                      disabled={addingUser}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
                    >
                      {addingUser ? 'Adding...' : 'Add User'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddUserOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search users by name, IC, or employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="lg:w-48 h-12">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="teacher">👨‍🏫 Teachers</SelectItem>
                  <SelectItem value="staff">👩‍💼 Staff</SelectItem>
                  <SelectItem value="student">🎓 Students</SelectItem>
                  <SelectItem value="admin">👑 Admins</SelectItem>
                  <SelectItem value="superadmin">⭐ Super Admins</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                {filteredUsers.length} of {users.length} users
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Display */}
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by adding your first TIME user'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg">
                        {userTypeIcons[user.userType as keyof typeof userTypeIcons] || '👤'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">{user.fullName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.employeeId}</p>
                      </div>
                    </div>
                    <Badge className={userTypeColors[user.userType as keyof typeof userTypeColors] || 'bg-gray-100'}>
                      {user.userType}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">IC:</span>
                      <span className="font-medium dark:text-white">{user.icNumber}</span>
                    </div>
                    {user.email && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Email:</span>
                        <span className="font-medium dark:text-white truncate max-w-[150px]">{user.email}</span>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                        <span className="font-medium dark:text-white">{user.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Palm Biometric</span>
                      {user.biometricEnrolled ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          ✓ Enrolled{user.palmId ? ` (${user.palmId})` : ''}
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          ⏳ Pending
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Smart Card</span>
                      {user.cardIssued ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          ✓ Issued{user.smartCardId ? ` #${user.smartCardId}` : ''}
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          ⏳ Pending
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    {!user.biometricEnrolled && (
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openPalmModal(user)}>
                        🤚 Enroll Palm
                      </Button>
                    )}
                    {!user.cardIssued && (
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openCardModal(user)}>
                        💳 Issue Card
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
          </>
        )}
      </div>
    </DashboardLayout>
  )
}