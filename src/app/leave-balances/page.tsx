'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Search, Filter, Users, Calendar, Edit, RefreshCw, Download, Plus, Eye, History, FileText } from 'lucide-react'

type User = {
  id: string
  full_name: string
  employee_id: string
  ic_number?: string
  primary_role: string
  department?: string
}

type LeaveType = {
  id: string
  name: string
  max_days: number
  color: string
  icon: string
}

type LeaveBalance = {
  id: string
  user_id: string
  leave_type_id: string
  allocated_days: number
  used_days: number
  remaining_days: number
  carried_forward: number
  year: number
  user?: User
  leave_type?: LeaveType
}

export default function LeaveBalancesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [filteredBalances, setFilteredBalances] = useState<LeaveBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [leaveHistory, setLeaveHistory] = useState<any[]>([])

  // Form state
  const [editFormData, setEditFormData] = useState({
    allocated_days: 0,
    carried_forward: 0
  })

  const [bulkFormData, setBulkFormData] = useState({
    leave_type_id: '',
    allocated_days: 0,
    apply_to_all: false,
    selected_roles: [] as string[]
  })

  useEffect(() => {
    initializeData()
  }, [])

  useEffect(() => {
    filterBalances()
  }, [balances, searchTerm, userFilter, leaveTypeFilter, selectedYear])

  const initializeData = async () => {
    try {
      setLoading(true)
      
      // Get current user info from debug endpoint
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
      
      let user = allUsers.find((u: any) => u.auth_user_id === currentAuthUserId)
      if (!user) {
        user = allUsers.find((u: any) => u.id === currentAuthUserId)
      }
      
      if (user) {
        setCurrentUser(user)
        await Promise.all([
          loadUsers(user.institution_id),
          loadLeaveTypes(user.institution_id),
          loadBalances(user.institution_id)
        ])
      }
    } catch (error) {
      console.error('Error initializing leave balances data:', error)
      toast.error('Failed to load leave balances data')
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async (institutionId: string) => {
    try {
      // Mock users data - in real implementation, fetch from /api/users
      const mockUsers: User[] = [
        { id: '1', full_name: 'John Doe', employee_id: 'TC001', ic_number: '880123-10-1234', primary_role: 'teacher', department: 'Mathematics' },
        { id: '2', full_name: 'Jane Smith', employee_id: 'ST001', ic_number: '900456-08-5678', primary_role: 'staff', department: 'Administration' },
        { id: '3', full_name: 'Bob Johnson', employee_id: 'SD001', ic_number: '050789-12-9012', primary_role: 'student', department: 'Grade 10' },
        { id: '4', full_name: 'Alice Brown', employee_id: 'TC002', ic_number: '920345-06-3456', primary_role: 'teacher', department: 'Science' }
      ]
      setUsers(mockUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    }
  }

  const loadLeaveTypes = async (institutionId: string) => {
    try {
      // Mock leave types data - in real implementation, fetch from /api/leave-types
      const mockLeaveTypes: LeaveType[] = [
        { id: '1', name: 'Annual Leave', max_days: 21, color: 'blue', icon: '🏖️' },
        { id: '2', name: 'Sick Leave', max_days: 14, color: 'red', icon: '🏥' },
        { id: '3', name: 'Emergency Leave', max_days: 5, color: 'orange', icon: '🚨' },
        { id: '4', name: 'Study Leave', max_days: 10, color: 'green', icon: '📚' }
      ]
      setLeaveTypes(mockLeaveTypes)
    } catch (error) {
      console.error('Error loading leave types:', error)
      toast.error('Failed to load leave types')
    }
  }

  const loadBalances = async (institutionId: string) => {
    try {
      // Mock leave balances data - in real implementation, fetch from /api/leave-balances
      const currentYear = new Date().getFullYear()
      const mockBalances: LeaveBalance[] = []
      
      // Generate balances for each user-leave type combination
      const mockUsers = [
        { id: '1', full_name: 'John Doe', employee_id: 'TC001', ic_number: '880123-10-1234', primary_role: 'teacher' },
        { id: '2', full_name: 'Jane Smith', employee_id: 'ST001', ic_number: '900456-08-5678', primary_role: 'staff' },
        { id: '3', full_name: 'Bob Johnson', employee_id: 'SD001', ic_number: '050789-12-9012', primary_role: 'student' },
        { id: '4', full_name: 'Alice Brown', employee_id: 'TC002', ic_number: '920345-06-3456', primary_role: 'teacher' }
      ]
      
      const mockLeaveTypesData = [
        { id: '1', name: 'Annual Leave', max_days: 21, color: 'blue', icon: '🏖️' },
        { id: '2', name: 'Sick Leave', max_days: 14, color: 'red', icon: '🏥' },
        { id: '3', name: 'Emergency Leave', max_days: 5, color: 'orange', icon: '🚨' },
        { id: '4', name: 'Study Leave', max_days: 10, color: 'green', icon: '📚' }
      ]

        mockUsers.forEach(user => {
          mockLeaveTypesData.forEach(leaveType => {
            // Simulate realistic used days based on user and leave type
            let used = 0
            switch (leaveType.name) {
              case 'Annual Leave':
                used = Math.floor(Math.random() * 12) + 3 // 3-15 days used
                break
              case 'Sick Leave':
                used = Math.floor(Math.random() * 8) + 1 // 1-8 days used
                break
              case 'Emergency Leave':
                used = Math.floor(Math.random() * 3) // 0-3 days used
                break
              case 'Study Leave':
                used = Math.floor(Math.random() * 5) + 1 // 1-5 days used
                break
              default:
                used = Math.floor(Math.random() * (leaveType.max_days * 0.5))
            }
            
            const carried = Math.floor(Math.random() * 5)
            const allocated = leaveType.max_days + carried
            
            mockBalances.push({
              id: `${user.id}-${leaveType.id}-${currentYear}`,
              user_id: user.id,
              leave_type_id: leaveType.id,
              allocated_days: allocated,
              used_days: used,
              remaining_days: allocated - used,
              carried_forward: carried,
              year: currentYear,
              user: user,
              leave_type: leaveType
            })
          })
        })
      
      setBalances(mockBalances)
    } catch (error) {
      console.error('Error loading leave balances:', error)
      toast.error('Failed to load leave balances')
    }
  }

  const filterBalances = () => {
    let filtered = balances.filter(balance => balance.year === selectedYear)

    if (searchTerm) {
      filtered = filtered.filter(balance =>
        balance.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        balance.user?.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (userFilter !== 'all') {
      filtered = filtered.filter(balance => balance.user?.primary_role === userFilter)
    }

    if (leaveTypeFilter !== 'all') {
      filtered = filtered.filter(balance => balance.leave_type_id === leaveTypeFilter)
    }

    setFilteredBalances(filtered)
  }

  const handleEditBalance = async () => {
    try {
      if (!selectedBalance) return

      // Mock edit balance - in real implementation, call /api/leave-balances/:id
      const updatedBalances = balances.map(balance =>
        balance.id === selectedBalance.id
          ? {
              ...balance,
              allocated_days: editFormData.allocated_days,
              carried_forward: editFormData.carried_forward,
              remaining_days: editFormData.allocated_days - balance.used_days
            }
          : balance
      )

      setBalances(updatedBalances)
      setIsEditModalOpen(false)
      setSelectedBalance(null)
      toast.success('Leave balance updated successfully')
    } catch (error) {
      console.error('Error updating leave balance:', error)
      toast.error('Failed to update leave balance')
    }
  }

  const handleBulkUpdate = async () => {
    try {
      if (!bulkFormData.leave_type_id || bulkFormData.allocated_days <= 0) {
        toast.error('Please select a leave type and enter allocated days')
        return
      }

      let usersToUpdate = users
      if (!bulkFormData.apply_to_all && bulkFormData.selected_roles.length > 0) {
        usersToUpdate = users.filter(user => bulkFormData.selected_roles.includes(user.primary_role))
      }

      // Mock bulk update - in real implementation, call /api/leave-balances/bulk-update
      const updatedBalances = balances.map(balance => {
        if (balance.leave_type_id === bulkFormData.leave_type_id && 
            usersToUpdate.some(u => u.id === balance.user_id)) {
          return {
            ...balance,
            allocated_days: bulkFormData.allocated_days,
            remaining_days: bulkFormData.allocated_days - balance.used_days
          }
        }
        return balance
      })

      setBalances(updatedBalances)
      setIsBulkModalOpen(false)
      setBulkFormData({ leave_type_id: '', allocated_days: 0, apply_to_all: false, selected_roles: [] })
      toast.success(`Updated balances for ${usersToUpdate.length} users`)
    } catch (error) {
      console.error('Error bulk updating balances:', error)
      toast.error('Failed to bulk update balances')
    }
  }

  const openEditModal = (balance: LeaveBalance) => {
    setSelectedBalance(balance)
    setEditFormData({
      allocated_days: balance.allocated_days,
      carried_forward: balance.carried_forward
    })
    setIsEditModalOpen(true)
  }

  const openDetailsModal = (balance: LeaveBalance) => {
    setSelectedBalance(balance)
    setSelectedUser(balance.user || null)
    setIsDetailsModalOpen(true)
  }

  const openHistoryModal = async (user: User) => {
    setSelectedUser(user)
    setIsHistoryModalOpen(true)
    
    // Mock leave history data - in real implementation, fetch from /api/leave-history/:userId
    const mockHistory = [
      {
        id: '1',
        leave_type: 'Annual Leave',
        start_date: '2024-03-15',
        end_date: '2024-03-18',
        days: 4,
        status: 'approved',
        applied_date: '2024-03-01',
        reason: 'Family vacation'
      },
      {
        id: '2',
        leave_type: 'Sick Leave',
        start_date: '2024-02-20',
        end_date: '2024-02-21',
        days: 2,
        status: 'approved',
        applied_date: '2024-02-19',
        reason: 'Medical appointment'
      },
      {
        id: '3',
        leave_type: 'Emergency Leave',
        start_date: '2024-01-10',
        end_date: '2024-01-10',
        days: 1,
        status: 'approved',
        applied_date: '2024-01-09',
        reason: 'Family emergency'
      }
    ]
    
    setLeaveHistory(mockHistory)
  }

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-800'
      case 'red': return 'bg-red-100 text-red-800'
      case 'orange': return 'bg-orange-100 text-orange-800'
      case 'green': return 'bg-green-100 text-green-800'
      case 'purple': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'teacher': return 'bg-purple-100 text-purple-800'
      case 'staff': return 'bg-blue-100 text-blue-800'
      case 'student': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const exportBalances = () => {
    toast.success('Leave balances exported successfully')
  }

  const roleOptions = [...new Set(users.map(u => u.primary_role))]
  const yearOptions = [selectedYear - 1, selectedYear, selectedYear + 1]

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
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-0 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leave Balances Management 📊</h1>
              <p className="text-gray-600 dark:text-gray-400">Set and manage individual leave quotas for all users</p>
            </div>
            <div className="mt-4 lg:mt-0 flex gap-3">
              <Button onClick={exportBalances} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button onClick={() => setIsBulkModalOpen(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Bulk Update
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by employee name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="w-40">
                    <Users className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roleOptions.map(role => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Leave Types</SelectItem>
                    {leaveTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Balances */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Leave Balances ({selectedYear})
              <Badge variant="secondary" className="ml-auto">
                {filteredBalances.length} records
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredBalances.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 dark:text-gray-400">No leave balances found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredBalances.map((balance) => (
                    <div
                      key={balance.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {balance.user?.full_name.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {balance.user?.full_name}
                            </div>
                            <Badge className={getRoleColor(balance.user?.primary_role || '')} variant="outline">
                              {balance.user?.primary_role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 flex-wrap">
                            <Badge className={getColorClass(balance.leave_type?.color || 'gray')}>
                              {balance.leave_type?.icon} {balance.leave_type?.name}
                            </Badge>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              ID: {balance.user?.employee_id}
                            </div>
                            {balance.user?.ic_number && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                IC: {balance.user.ic_number}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {balance.remaining_days}/{balance.allocated_days}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Used: {balance.used_days}
                            {balance.carried_forward > 0 && ` • CF: ${balance.carried_forward}`}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openDetailsModal(balance)}
                            className="p-2"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => balance.user && openHistoryModal(balance.user)}
                            className="p-2"
                            title="View Leave History"
                          >
                            <History className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openEditModal(balance)}
                            className="p-2"
                            title="Edit Balance"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Leave Balance</DialogTitle>
          </DialogHeader>
          {selectedBalance && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="font-medium text-gray-900 dark:text-white">
                  {selectedBalance.user?.full_name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedBalance.leave_type?.icon} {selectedBalance.leave_type?.name}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allocated Days</label>
                <Input
                  type="number"
                  value={editFormData.allocated_days}
                  onChange={(e) => setEditFormData({...editFormData, allocated_days: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Carried Forward Days</label>
                <Input
                  type="number"
                  value={editFormData.carried_forward}
                  onChange={(e) => setEditFormData({...editFormData, carried_forward: parseInt(e.target.value) || 0})}
                  min="0"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <div>Used Days: {selectedBalance.used_days}</div>
                  <div>Remaining Days: {editFormData.allocated_days - selectedBalance.used_days}</div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleEditBalance} className="flex-1">
                  Update Balance
                </Button>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Update Modal */}
      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Update Leave Balances</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Leave Type</label>
              <Select value={bulkFormData.leave_type_id} onValueChange={(value) => setBulkFormData({...bulkFormData, leave_type_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allocated Days</label>
              <Input
                type="number"
                value={bulkFormData.allocated_days}
                onChange={(e) => setBulkFormData({...bulkFormData, allocated_days: parseInt(e.target.value) || 0})}
                min="0"
                placeholder="Enter days to allocate"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="apply_to_all"
                  checked={bulkFormData.apply_to_all}
                  onChange={(e) => setBulkFormData({...bulkFormData, apply_to_all: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="apply_to_all" className="text-sm text-gray-700 dark:text-gray-300">
                  Apply to all users
                </label>
              </div>

              {!bulkFormData.apply_to_all && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Roles</label>
                  <div className="space-y-2 mt-2">
                    {roleOptions.map(role => (
                      <label key={role} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={bulkFormData.selected_roles.includes(role)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkFormData({...bulkFormData, selected_roles: [...bulkFormData.selected_roles, role]})
                            } else {
                              setBulkFormData({...bulkFormData, selected_roles: bulkFormData.selected_roles.filter(r => r !== role)})
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleBulkUpdate} className="flex-1">
                Update Balances
              </Button>
              <Button variant="outline" onClick={() => setIsBulkModalOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Balance Details</DialogTitle>
          </DialogHeader>
          {selectedBalance && selectedUser && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                  {selectedUser.full_name.charAt(0)}
                </div>
                <div className="font-medium text-gray-900 dark:text-white text-lg">
                  {selectedUser.full_name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedUser.primary_role} • {selectedUser.department}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Employee ID</div>
                  <div className="text-sm text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {selectedUser.employee_id}
                  </div>
                </div>
                {selectedUser.ic_number && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">IC Number</div>
                    <div className="text-sm text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {selectedUser.ic_number}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm`}>
                    {selectedBalance.leave_type?.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {selectedBalance.leave_type?.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Year {selectedBalance.year}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedBalance.allocated_days}
                    </div>
                    <div className="text-xs text-blue-700 dark:text-blue-300">Allocated</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {selectedBalance.used_days}
                    </div>
                    <div className="text-xs text-red-700 dark:text-red-300">Used</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {selectedBalance.remaining_days}
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300">Remaining</div>
                  </div>
                </div>

                {selectedBalance.carried_forward > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>Carried Forward:</strong> {selectedBalance.carried_forward} days from previous year
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => selectedUser && openHistoryModal(selectedUser)} 
                  variant="outline" 
                  className="flex-1"
                >
                  <History className="w-4 h-4 mr-2" />
                  View History
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDetailsModalOpen(false)} 
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Leave History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave History</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedUser.full_name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {selectedUser.full_name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedUser.employee_id} {selectedUser.ic_number && `• ${selectedUser.ic_number}`}
                  </div>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {leaveHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 dark:text-gray-400">No leave history found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaveHistory.map((record) => (
                      <div key={record.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={record.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                       record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                       'bg-red-100 text-red-800'}
                            >
                              {record.leave_type}
                            </Badge>
                            <Badge variant="outline">
                              {record.days} {record.days === 1 ? 'day' : 'days'}
                            </Badge>
                          </div>
                          <Badge 
                            variant="outline"
                            className={record.status === 'approved' ? 'border-green-200 text-green-700' : 
                                     record.status === 'pending' ? 'border-yellow-200 text-yellow-700' : 
                                     'border-red-200 text-red-700'}
                          >
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600 dark:text-gray-400">Leave Period</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {new Date(record.start_date).toLocaleDateString()} - {new Date(record.end_date).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600 dark:text-gray-400">Applied On</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {new Date(record.applied_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        {record.reason && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reason</div>
                            <div className="text-sm text-gray-900 dark:text-white">{record.reason}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
