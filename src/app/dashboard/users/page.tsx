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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PalmEnrollmentModal } from '@/components/features/palm-enrollment-modal'
import { CardIssuanceModal } from '@/components/features/card-issuance-modal'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Grid3x3, List, GraduationCap, UserCheck, UserCog, Hand, CreditCard, Edit, Trash2 } from 'lucide-react'

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

// Database user type for Supabase responses
type DatabaseUser = {
  id: string
  full_name: string
  employee_id: string
  user_type: string
  ic_number: string
  email: string | null
  phone: string | null
  palm_id: string | null
  smart_card_id: string | null
  created_at: string | null
  biometric_enrolled: boolean
  card_issued: boolean
  is_active: boolean
  school_id: string
}

const userTypeColors = {
  teacher: 'bg-green-100 text-green-800 border-green-200',
  staff: 'bg-blue-100 text-blue-800 border-blue-200',
  student: 'bg-purple-100 text-purple-800 border-purple-200'
}

const userTypeIcons = {
  teacher: <UserCheck className="w-6 h-6" />,
  staff: <UserCog className="w-6 h-6" />,
  student: <GraduationCap className="w-6 h-6" />
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [palmModalOpen, setPalmModalOpen] = useState(false)
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    fullName: '',
    userType: '',
    icNumber: '',
    email: '',
    phone: ''
  })

  // Fetch users from Supabase on component mount
  useEffect(() => {
    fetchUsers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Use the debug endpoint to get user info reliably
      const debugResponse = await fetch('/api/debug/supabase')
      const debugData = await debugResponse.json()
      
      const authTest = debugData.tests.find((t: any) => t.name === 'Auth Session')
      const currentUserId = authTest?.data?.userId
      
      if (!currentUserId) {
        toast.error('Authentication error: Please sign in again')
        setLoading(false)
        return
      }

      // Get the current user's institution_id from users table
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('institution_id')
        .eq('id', currentUserId)
        .single()

      if (userError || !currentUser?.institution_id) {
        toast.error('Institution not found. Please contact administrator.')
        console.error('Current user lookup error:', userError)
        setLoading(false)
        return
      }

      // Fetch users from the same institution
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('institution_id', currentUser.institution_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (error) {
        toast.error('Failed to fetch users: ' + error.message)
        console.error('Error fetching users:', error)
        return
      }
      
      // Transform the data to match our User type
      const transformedUsers: User[] = (data || []).map((user: any) => ({
        id: user.id,
        fullName: user.full_name,
        employeeId: user.employee_id,
        userType: user.primary_role, // Using primary_role as userType
        icNumber: user.ic_number,
        email: user.email,
        phone: user.phone || '',
        palmId: user.palm_id,
        smartCardId: user.card_id,
        createdAt: user.created_at?.split('T')[0] || '',
        biometricEnrolled: user.biometric_status === 'enrolled',
        cardIssued: user.card_status === 'issued'
      }))
      
      setUsers(transformedUsers)
    } catch (error) {
      toast.error('An unexpected error occurred while fetching users')
      console.error('Unexpected error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.icNumber.includes(searchTerm)
    const matchesType = filterType === 'all' || user.userType === filterType
    return matchesSearch && matchesType
  })

  const handleAddUser = async () => {
    if (!newUser.fullName || !newUser.userType || !newUser.icNumber) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      // Generate employee ID
      const typePrefix = {
        teacher: 'TC',
        staff: 'ST',
        student: 'SD',
        admin: 'AD'
      }[newUser.userType] || 'US'

      const nextNumber = users.filter(u => u.userType === newUser.userType).length + 1
      const employeeId = `${typePrefix}${nextNumber.toString().padStart(4, '0')}`

      // Get current user info from debug endpoint
      const debugResponse = await fetch('/api/debug/supabase')
      const debugData = await debugResponse.json()
      
      const authTest = debugData.tests.find((t: any) => t.name === 'Auth Session')
      const currentUserId = authTest?.data?.userId
      
      if (!currentUserId) {
        toast.error('Authentication error: Please sign in again')
        return
      }

      // Get the current user's institution_id
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('institution_id')
        .eq('id', currentUserId)
        .single()

      if (userError || !currentUser?.institution_id) {
        toast.error('Institution not found. Please contact administrator.')
        console.error('Current user lookup error:', userError)
        return
      }

      // Prepare user data for Supabase
      const userData = {
        full_name: newUser.fullName,
        employee_id: employeeId,
        primary_role: newUser.userType,
        smartid_hub_role: newUser.userType,
        ic_number: newUser.icNumber,
        email: newUser.email || null,
        phone: newUser.phone || null,
        institution_id: currentUser.institution_id,
        palm_id: null,
        card_id: null,
        biometric_status: 'pending',
        card_status: 'pending',
        status: 'active'
      }

      // Insert user into Supabase
      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single()

      if (insertError) {
        if (insertError.message.includes('duplicate key')) {
          if (insertError.message.includes('employee_id')) {
            toast.error('Employee ID already exists. Please try again.')
          } else if (insertError.message.includes('ic_number')) {
            toast.error('IC Number already exists. Please check and try again.')
          } else {
            toast.error('Duplicate entry detected. Please check your data.')
          }
        } else {
          toast.error('Failed to add user: ' + insertError.message)
        }
        console.error('Insert error:', insertError)
        return
      }

      // Transform the inserted user to match our User type and add to local state
      const newUserForState: User = {
        id: insertedUser.id,
        fullName: insertedUser.full_name,
        employeeId: insertedUser.employee_id,
        userType: insertedUser.primary_role,
        icNumber: insertedUser.ic_number,
        email: insertedUser.email,
        phone: insertedUser.phone || '',
        palmId: insertedUser.palm_id,
        smartCardId: insertedUser.card_id,
        createdAt: insertedUser.created_at?.split('T')[0] || '',
        biometricEnrolled: insertedUser.biometric_status === 'enrolled',
        cardIssued: insertedUser.card_status === 'issued'
      }

      // Update local state
      setUsers([newUserForState, ...users])
      setNewUser({ fullName: '', userType: '', icNumber: '', email: '', phone: '' })
      setIsAddUserOpen(false)
      toast.success(`User ${newUserForState.fullName} added successfully!`)

    } catch (error) {
      toast.error('An unexpected error occurred while adding the user')
      console.error('Unexpected error:', error)
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
      // Update Supabase
      const { error } = await supabase
        .from('users')
        .update({ 
          palm_id: palmId, 
          biometric_status: 'enrolled' 
        })
        .eq('id', userId)

      if (error) {
        toast.error('Failed to update palm enrollment: ' + error.message)
        console.error('Palm enrollment error:', error)
        return
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, palmId, biometricEnrolled: true }
          : user
      ))
      toast.success('Palm biometric enrollment updated successfully!')
    } catch (error) {
      toast.error('An unexpected error occurred during palm enrollment')
      console.error('Unexpected error:', error)
    }
  }

  const handleCardIssuance = async (userId: string, cardId: string) => {
    try {
      // Update Supabase
      const { error } = await supabase
        .from('users')
        .update({ 
          card_id: cardId, 
          card_status: 'issued' 
        })
        .eq('id', userId)

      if (error) {
        toast.error('Failed to update card issuance: ' + error.message)
        console.error('Card issuance error:', error)
        return
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, smartCardId: cardId, cardIssued: true }
          : user
      ))
      toast.success('Smart card issuance updated successfully!')
    } catch (error) {
      toast.error('An unexpected error occurred during card issuance')
      console.error('Unexpected error:', error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Gradient Header */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-violet-900 dark:to-purple-900 rounded-2xl p-8 border-0 shadow-lg dark:border dark:border-purple-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management 👥</h1>
              <p className="text-gray-600 dark:text-purple-200/90">SMK Bukit Jelutong • Add and manage students, teachers, and staff with biometric enrollment</p>
            </div>
            <div className="flex gap-6 mt-4 lg:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</div>
                <div className="text-sm text-gray-500 dark:text-purple-200/70">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round((users.filter(u => u.biometricEnrolled && u.cardIssued).length / users.length) * 100)}%</div>
                <div className="text-sm text-gray-500 dark:text-purple-200/70">Complete</div>
              </div>
            </div>
          </div>
        </div>

        {/* Add User Section */}
        <div className="flex justify-end">
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
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
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
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
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleAddUser} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600">
                    Add User
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
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
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
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                </SelectContent>
              </Select>
              
              {/* View Toggle */}
              <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                <Button
                  variant={viewMode === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className={viewMode === 'card' ? 'bg-white dark:bg-indigo-600 shadow-sm dark:text-white' : 'dark:text-slate-300 dark:hover:bg-slate-600'}
                >
                  <Grid3x3 className="w-4 h-4 mr-1" />
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-white dark:bg-indigo-600 shadow-sm dark:text-white' : 'dark:text-slate-300 dark:hover:bg-slate-600'}
                >
                  <List className="w-4 h-4 mr-1" />
                  List
                </Button>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-slate-400 flex items-center">
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
              <Card key={user.id} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-indigo-600 dark:to-indigo-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-white font-semibold text-lg">
                        {userTypeIcons[user.userType as keyof typeof userTypeIcons]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-slate-100 leading-tight">{user.fullName}</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{user.employeeId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={userTypeColors[user.userType as keyof typeof userTypeColors]}>
                        {user.userType}
                      </Badge>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="p-1.5 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Edit User"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete User"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-slate-400">IC:</span>
                      <span className="font-medium dark:text-slate-100">{user.icNumber}</span>
                    </div>
                    {user.email && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-slate-400">Email:</span>
                        <span className="font-medium dark:text-slate-100 truncate max-w-[150px]">{user.email}</span>
                      </div>
                    )}
                    {user.phone && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-slate-400">Phone:</span>
                        <span className="font-medium dark:text-slate-100">{user.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Palm Biometric</span>
                      {user.biometricEnrolled ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-emerald-600 dark:text-emerald-100 dark:border-emerald-500">
                          ✓ Enrolled
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openPalmModal(user)}
                          className="text-xs dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <Hand className="w-3 h-3 mr-1" />
                          Enroll Palm
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Smart Card</span>
                      {user.cardIssued ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-600 dark:text-blue-100 dark:border-blue-500">
                          ✓ Issued
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openCardModal(user)}
                          className="text-xs dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          Issue Card
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Registered: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>IC Number</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Palm Biometric</TableHead>
                  <TableHead>Smart Card</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center text-gray-600 font-semibold text-sm">
                          {userTypeIcons[user.userType as keyof typeof userTypeIcons]}
                        </div>
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.employeeId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={userTypeColors[user.userType as keyof typeof userTypeColors]}>
                        {user.userType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{user.icNumber}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.email && <div>{user.email}</div>}
                        {user.phone && <div className="text-gray-500">{user.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.biometricEnrolled ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          ✓ Enrolled
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openPalmModal(user)}
                        >
                          <Hand className="w-3 h-3 mr-1" />
                          Enroll
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.cardIssued ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          ✓ Issued
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openCardModal(user)}
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          Issue
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="p-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Edit User"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete User"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {!loading && filteredUsers.length === 0 && (
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first user'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsAddUserOpen(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  Add First User
                </Button>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Biometric Enrollment Modals */}
        {selectedUser && (
          <>
            <PalmEnrollmentModal
              isOpen={palmModalOpen}
              onClose={() => {
                setPalmModalOpen(false)
                setSelectedUser(null)
              }}
              user={selectedUser}
              onEnrollmentComplete={handlePalmEnrollment}
            />
            <CardIssuanceModal
              isOpen={cardModalOpen}
              onClose={() => {
                setCardModalOpen(false)
                setSelectedUser(null)
              }}
              user={selectedUser}
              onIssuanceComplete={handleCardIssuance}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
