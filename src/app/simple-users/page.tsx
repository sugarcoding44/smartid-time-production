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
  admin: 'bg-red-100 text-red-800 border-red-200'
}

const userTypeIcons = {
  teacher: '👨‍🏫',
  staff: '👩‍💼',
  student: '🎓',
  admin: '👑'
}

export default function SimpleUserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [institutionId, setInstitutionId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [addingUser, setAddingUser] = useState(false)
  const [palmModalOpen, setPalmModalOpen] = useState(false)
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [workGroups, setWorkGroups] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [newUser, setNewUser] = useState({
    fullName: '',
    userType: '',
    icNumber: '',
    email: '',
    phone: '',
    workGroupId: 'none'
  })

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      setLoading(true)
      
      // Get current user info from debug endpoint
      const debugResponse = await fetch('/api/debug/supabase')
      const debugData = await debugResponse.json()
      
      // Get the actual authenticated user ID
      const authTest = debugData.tests.find((t: any) => t.name === 'Auth Session')
      const currentAuthUserId = authTest?.data?.userId
      
      console.log('🔍 Auth user ID:', currentAuthUserId)
      
      if (!currentAuthUserId) {
        toast.error('Authentication required')
        return
      }
      
      // Find the actual current user from service test data
      const serviceTest = debugData.tests.find((t: any) => t.name === 'Service Role Client')
      const allUsers = serviceTest?.data || []
      
      console.log('🔍 All users from service test:', allUsers)
      console.log('🔍 Looking for user with auth ID:', currentAuthUserId)
      
      // Try to match by the user's auth_user_id field or the id field
      let currentUser = allUsers.find((u: any) => u.auth_user_id === currentAuthUserId)
      if (!currentUser) {
        currentUser = allUsers.find((u: any) => u.id === currentAuthUserId)
      }
      
      console.log('👤 Found current user:', currentUser)
      
      if (!currentUser) {
        toast.error('Could not load user information')
        return
      }
      
      console.log('🔍 Simple Users - Current user:', currentUser)
      console.log('🏢 Simple Users - Institution ID:', currentUser.institution_id)
      
      if (!currentUser.institution_id) {
        toast.error('User is not associated with any institution')
        return
      }
      
      setInstitutionId(currentUser.institution_id)
      
      // Fetch users using the API endpoint
      await Promise.all([
        fetchUsers(currentUser.institution_id),
        fetchWorkGroups(currentUser.institution_id)
      ])
      
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
        // Transform the data to match our User type
        const transformedUsers: User[] = result.users.map((user: any) => ({
          id: user.id,
          fullName: user.full_name,
          employeeId: user.employee_id,
          userType: user.primary_role,
          icNumber: user.ic_number,
          email: user.email,
          phone: user.phone || '',
          palmId: null, // Will be populated from biometric_enrollments table later
          smartCardId: null, // Will be populated from smart_cards table later
          createdAt: user.created_at?.split('T')[0] || '',
          biometricEnrolled: false, // Will check biometric_enrollments table
          cardIssued: false // Will check smart_cards table
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

  const fetchWorkGroups = async (instId: string) => {
    try {
      // Mock work groups data - in real implementation, fetch from /api/work-groups
      const mockWorkGroups = [
        { id: '1', name: 'Teaching Staff', description: 'Standard teaching schedule' },
        { id: '2', name: 'Administrative Staff', description: 'Office hours for admin staff' },
        { id: '3', name: 'Security Team', description: '24/7 security coverage' }
      ]
      setWorkGroups(mockWorkGroups)
    } catch (error) {
      console.error('Error fetching work groups:', error)
      toast.error('Failed to fetch work groups')
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
          phone: newUser.phone || null,
          institution_id: institutionId
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`User ${newUser.fullName} added successfully!`)
        
        // Add the new user to local state
        const newUserForState: User = {
          id: result.user.id,
          fullName: result.user.full_name,
          employeeId: result.user.employee_id,
          userType: result.user.primary_role,
          icNumber: result.user.ic_number,
          email: result.user.email,
          phone: result.user.phone || '',
          palmId: null,
          smartCardId: null,
          createdAt: result.user.created_at?.split('T')[0] || '',
          biometricEnrolled: false,
          cardIssued: false
        }
        
        setUsers([newUserForState, ...users])
        setNewUser({ fullName: '', userType: '', icNumber: '', email: '', phone: '', workGroupId: 'none' })
        setIsAddUserOpen(false)
      } else {
        toast.error(result.error || 'Failed to add user')
      }
    } catch (error) {
      console.error('Error adding user:', error)
      toast.error('An unexpected error occurred while adding the user')
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
    try {
      // For now, just update local state. In a real implementation, this would
      // create a record in the biometric_enrollments table
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, palmId, biometricEnrolled: true }
          : user
      ))
      toast.success('Palm biometric enrollment completed successfully!')
    } catch (error) {
      console.error('Palm enrollment error:', error)
      toast.error('Failed to complete palm enrollment')
    }
  }

  const handleCardIssuance = async (userId: string, cardId: string) => {
    try {
      // For now, just update local state. In a real implementation, this would
      // create a record in the smart_cards table
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, smartCardId: cardId, cardIssued: true }
          : user
      ))
      toast.success('Smart card issued successfully!')
    } catch (error) {
      console.error('Card issuance error:', error)
      toast.error('Failed to issue smart card')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.icNumber.includes(searchTerm)
    const matchesType = filterType === 'all' || user.userType === filterType
    return matchesSearch && matchesType
  })

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border-0 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management 👥</h1>
              <p className="text-gray-600 dark:text-gray-400">Add and manage students, teachers, and staff with biometric enrollment</p>
            </div>
            <div className="flex gap-6 mt-4 lg:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.length > 0 ? Math.round((users.filter(u => u.biometricEnrolled && u.cardIssued).length / users.length) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Complete</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex justify-between items-center">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="px-3 py-1 text-sm"
            >
              📱 Cards
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3 py-1 text-sm"
            >
              📋 List
            </Button>
          </div>
          
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                <span className="text-lg mr-2">➕</span>
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Register a new student, teacher, or staff member
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="e.g., Ahmad bin Ali Rahman"
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
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="icNumber">IC Number *</Label>
                  <Input
                    id="icNumber"
                    placeholder="e.g., 901234567890"
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
                <div>
                  <Label htmlFor="workGroup">Work Group</Label>
                  <Select value={newUser.workGroupId} onValueChange={(value) => setNewUser({...newUser, workGroupId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select work group (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Work Group</SelectItem>
                      {workGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                {filteredUsers.length} of {users.length} users
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg">
                        {userTypeIcons[user.userType as keyof typeof userTypeIcons]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white leading-tight">{user.fullName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.employeeId}</p>
                      </div>
                    </div>
                    <Badge className={userTypeColors[user.userType as keyof typeof userTypeColors]}>
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
                          ✓ Enrolled
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
                          ✓ Issued
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
            
            {filteredUsers.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Start by adding your first user'
                  }
                </p>
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-0">
              {filteredUsers.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                            {userTypeIcons[user.userType as keyof typeof userTypeIcons]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{user.fullName}</h3>
                              <Badge className={userTypeColors[user.userType as keyof typeof userTypeColors]}>
                                {user.userType}
                              </Badge>
                              <Badge className={user.biometricEnrolled ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                                {user.biometricEnrolled ? '✓ Biometric' : '⏳ Biometric'}
                              </Badge>
                              <Badge className={user.cardIssued ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                                {user.cardIssued ? '✓ Card' : '⏳ Card'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                              <span><strong>ID:</strong> {user.employeeId}</span>
                              <span><strong>IC:</strong> {user.icNumber}</span>
                              {user.email && <span><strong>Email:</strong> {user.email}</span>}
                              {user.phone && <span><strong>Phone:</strong> {user.phone}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!user.biometricEnrolled && (
                            <Button size="sm" variant="outline" onClick={() => openPalmModal(user)}>
                              🤚 Enroll Palm
                            </Button>
                          )}
                          {!user.cardIssued && (
                            <Button size="sm" variant="outline" onClick={() => openCardModal(user)}>
                              💳 Issue Card
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm || filterType !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Start by adding your first user'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Palm Enrollment Modal */}
      <PalmEnrollmentModal
        isOpen={palmModalOpen}
        onClose={() => setPalmModalOpen(false)}
        user={selectedUser}
        onEnroll={handlePalmEnrollment}
      />

      {/* Card Issuance Modal */}
      <CardIssuanceModal
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        user={selectedUser}
        onIssue={handleCardIssuance}
      />
    </DashboardLayout>
  )
}
