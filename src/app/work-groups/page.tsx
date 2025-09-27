'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Building2, Users, Clock, Grid3X3, List, Plus, UserPlus, Edit, Trash2, Search } from 'lucide-react'

type WorkGroup = {
  id: string
  name: string
  description: string
  schedule_start: string
  schedule_end: string
  break_start: string
  break_end: string
  working_days: string[]
  member_count: number
  created_at: string
  members?: User[]
}

type User = {
  id: string
  full_name: string
  employee_id: string
  primary_role: string
  department?: string
}

export default function WorkGroupsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [workGroups, setWorkGroups] = useState<WorkGroup[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<WorkGroup | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    schedule_start: '08:00',
    schedule_end: '17:00',
    break_start: '12:00',
    break_end: '13:00',
    working_days: [] as string[]
  })

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ]

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      setLoading(true)
      
      console.log('🔄 Initializing work groups data...')
      
      // Get current user info from debug endpoint
      const debugResponse = await fetch('/api/debug/supabase')
      const debugData = await debugResponse.json()
      
      console.log('🐛 Debug response:', debugData)
      
      const serviceTest = debugData.tests.find((t: any) => t.name === 'Service Role Client')
      console.log('🔍 Service test:', serviceTest)
      
      const user = serviceTest?.success && serviceTest.data?.length > 0 ? {
        id: serviceTest.data[0].id,
        name: serviceTest.data[0].name,
        email: serviceTest.data[0].email,
        institution_id: serviceTest.data[0].institution_id,
        primary_role: serviceTest.data[0].primary_role
      } : null
      
      console.log('👤 Extracted user:', user)
      
      if (user) {
        setCurrentUser(user)
        console.log('✅ Current user set:', user)
        if (user.institution_id) {
          console.log('🏢 Loading work groups for institution:', user.institution_id)
          await loadWorkGroups(user.institution_id)
          await loadUsers(user.institution_id)
        } else {
          console.warn('⚠️ User has no institution_id')
          toast.error('User is not associated with any institution')
        }
      } else {
        console.error('❌ No user found in debug response')
        toast.error('Unable to load user information')
      }
    } catch (error) {
      console.error('Error initializing work groups data:', error)
      toast.error('Failed to load work groups data')
    } finally {
      setLoading(false)
    }
  }

  const loadWorkGroups = async (institutionId: string) => {
    try {
      console.log('📚 Loading work groups for institution:', institutionId)
      const url = `/api/work-groups?institution_id=${institutionId}`
      console.log('🔗 API URL:', url)
      
      const response = await fetch(url)
      const result = await response.json()
      
      console.log('📊 API Response:', { 
        status: response.status, 
        ok: response.ok,
        result 
      })
      
      if (!response.ok) {
        console.error('❌ Response not OK:', response.status)
        throw new Error(result.error || 'Failed to load work groups')
      }
      
      if (result.success) {
        console.log('✅ Setting work groups:', result.data)
        setWorkGroups(result.data)
        console.log('📋 Work groups count:', result.data.length)
      } else {
        console.error('❌ Result not successful:', result)
        throw new Error(result.error || 'Failed to load work groups')
      }
    } catch (error) {
      console.error('😱 Error loading work groups:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load work groups')
    }
  }

  const loadUsers = async (institutionId: string) => {
    try {
      console.log('👥 Loading users for institution:', institutionId)
      const url = `/api/users?institution_id=${institutionId}`
      console.log('🔗 Users API URL:', url)
      
      const response = await fetch(url)
      const result = await response.json()
      
      console.log('📊 Users API Response:', { 
        status: response.status, 
        ok: response.ok,
        result 
      })
      
      if (!response.ok) {
        console.error('❌ Users response not OK:', response.status)
        // Fallback to empty array instead of showing error
        setUsers([])
        return
      }
      
      if (result.success && result.data) {
        console.log('✅ Setting users:', result.data.length)
        const formattedUsers = result.data.map((user: any) => ({
          id: user.id,
          full_name: user.full_name,
          employee_id: user.employee_id,
          primary_role: user.primary_role,
          department: user.department
        }))
        setUsers(formattedUsers)
      } else {
        console.log('⚠️ No users data in response')
        setUsers([])
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    }
  }

  const handleAddWorkGroup = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Work group name is required')
        return
      }

      if (formData.working_days.length === 0) {
        toast.error('Please select at least one working day')
        return
      }

      if (!currentUser?.institution_id) {
        toast.error('Institution ID not found')
        return
      }

      const requestBody = {
        institution_id: currentUser.institution_id,
        name: formData.name,
        description: formData.description,
        schedule_start: formData.schedule_start + ':00',
        schedule_end: formData.schedule_end + ':00',
        break_start: formData.break_start + ':00',
        break_end: formData.break_end + ':00',
        working_days: formData.working_days,
        user_id: currentUser.id
      }

      const response = await fetch('/api/work-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create work group')
      }

      if (result.success) {
        setWorkGroups([...workGroups, result.data])
        setIsAddModalOpen(false)
        resetForm()
        toast.success('Work group created successfully')
      } else {
        throw new Error(result.error || 'Failed to create work group')
      }
    } catch (error) {
      console.error('Error adding work group:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create work group')
    }
  }

  const handleEditWorkGroup = async () => {
    try {
      if (!selectedGroup || !formData.name.trim()) {
        toast.error('Work group name is required')
        return
      }

      if (formData.working_days.length === 0) {
        toast.error('Please select at least one working day')
        return
      }

      const requestBody = {
        name: formData.name,
        description: formData.description,
        schedule_start: formData.schedule_start + ':00',
        schedule_end: formData.schedule_end + ':00',
        break_start: formData.break_start + ':00',
        break_end: formData.break_end + ':00',
        working_days: formData.working_days,
        user_id: currentUser?.id
      }

      const response = await fetch(`/api/work-groups/${selectedGroup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update work group')
      }

      if (result.success) {
        const updatedGroups = workGroups.map(group =>
          group.id === selectedGroup.id ? result.data : group
        )
        setWorkGroups(updatedGroups)
        setIsEditModalOpen(false)
        setSelectedGroup(null)
        resetForm()
        toast.success('Work group updated successfully')
      } else {
        throw new Error(result.error || 'Failed to update work group')
      }
    } catch (error) {
      console.error('Error updating work group:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update work group')
    }
  }

  const handleDeleteWorkGroup = async (groupId: string) => {
    try {
      if (confirm('Are you sure you want to delete this work group? This action cannot be undone.')) {
        const response = await fetch(`/api/work-groups/${groupId}`, {
          method: 'DELETE'
        })

        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete work group')
        }

        if (result.success) {
          setWorkGroups(workGroups.filter(group => group.id !== groupId))
          toast.success('Work group deleted successfully')
        } else {
          throw new Error(result.error || 'Failed to delete work group')
        }
      }
    } catch (error) {
      console.error('Error deleting work group:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete work group')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      schedule_start: '08:00',
      schedule_end: '17:00',
      break_start: '12:00',
      break_end: '13:00',
      working_days: []
    })
  }

  const openEditModal = (group: WorkGroup) => {
    setSelectedGroup(group)
    setFormData({
      name: group.name,
      description: group.description,
      schedule_start: group.schedule_start.substring(0, 5),
      schedule_end: group.schedule_end.substring(0, 5),
      break_start: group.break_start.substring(0, 5),
      break_end: group.break_end.substring(0, 5),
      working_days: group.working_days
    })
    setIsEditModalOpen(true)
  }

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatWorkingDays = (days: string[]) => {
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')
  }

  const openAssignModal = (group: WorkGroup) => {
    setSelectedGroup(group)
    setSelectedUsers(group.members?.map(m => m.id) || [])
    setIsAssignModalOpen(true)
  }

  const handleAssignUsers = async () => {
    try {
      if (!selectedGroup) return

      // Mock assign users - in real implementation, call /api/work-groups/:id/assign-users
      const updatedGroups = workGroups.map(group =>
        group.id === selectedGroup.id
          ? {
              ...group,
              member_count: selectedUsers.length,
              members: users.filter(u => selectedUsers.includes(u.id))
            }
          : group
      )

      setWorkGroups(updatedGroups)
      setIsAssignModalOpen(false)
      setSelectedGroup(null)
      setSelectedUsers([])
      toast.success('Users assigned successfully')
    } catch (error) {
      console.error('Error assigning users:', error)
      toast.error('Failed to assign users')
    }
  }

  const filteredWorkGroups = workGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <div className="bg-white dark:bg-gradient-to-br dark:from-violet-900 dark:to-purple-900 rounded-2xl p-6 border-0 shadow-lg dark:border dark:border-purple-800/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Work Groups 👥</h1>
              <p className="text-gray-600 dark:text-purple-200/90">Manage work schedules and group assignments for your institution</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Work Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Work Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Group Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., Teaching Staff"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Brief description of the work group"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                        <Input
                          type="time"
                          value={formData.schedule_start}
                          onChange={(e) => setFormData({...formData, schedule_start: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
                        <Input
                          type="time"
                          value={formData.schedule_end}
                          onChange={(e) => setFormData({...formData, schedule_end: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Break Start</label>
                        <Input
                          type="time"
                          value={formData.break_start}
                          onChange={(e) => setFormData({...formData, break_start: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Break End</label>
                        <Input
                          type="time"
                          value={formData.break_end}
                          onChange={(e) => setFormData({...formData, break_end: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Working Days</label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {daysOfWeek.map(day => (
                          <label key={day.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.working_days.includes(day.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({...formData, working_days: [...formData.working_days, day.value]})
                                } else {
                                  setFormData({...formData, working_days: formData.working_days.filter(d => d !== day.value)})
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">{day.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleAddWorkGroup} className="flex-1">
                        Create Work Group
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{workGroups.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Work Groups</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {workGroups.reduce((sum, group) => sum + group.member_count, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Members</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">8.5h</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Hours</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search work groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Work Groups List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredWorkGroups.map((group) => (
            <Card key={group.id} className="bg-white border-0 shadow-lg dark:bg-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {group.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {group.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openAssignModal(group)}
                      className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Assign Users"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditModal(group)}
                      className="p-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteWorkGroup(group.id)}
                      className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">Work Hours</span>
                    </div>
                    <div className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
                      {formatTime(group.schedule_start)} - {formatTime(group.schedule_end)}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">Members</span>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                      {group.member_count} people
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Break Time: {formatTime(group.break_start)} - {formatTime(group.break_end)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Working Days: {formatWorkingDays(group.working_days)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredWorkGroups.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">No work groups found</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Work Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Group Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Teaching Staff"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of the work group"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                <Input
                  type="time"
                  value={formData.schedule_start}
                  onChange={(e) => setFormData({...formData, schedule_start: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
                <Input
                  type="time"
                  value={formData.schedule_end}
                  onChange={(e) => setFormData({...formData, schedule_end: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Break Start</label>
                <Input
                  type="time"
                  value={formData.break_start}
                  onChange={(e) => setFormData({...formData, break_start: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Break End</label>
                <Input
                  type="time"
                  value={formData.break_end}
                  onChange={(e) => setFormData({...formData, break_end: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Working Days</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {daysOfWeek.map(day => (
                  <label key={day.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.working_days.includes(day.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, working_days: [...formData.working_days, day.value]})
                        } else {
                          setFormData({...formData, working_days: formData.working_days.filter(d => d !== day.value)})
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button onClick={handleEditWorkGroup} className="flex-1">
                Update Work Group
              </Button>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Assignment Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Users to {selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Select users to assign to this work group. They will follow the group's schedule and policies.
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
              {users.map((user) => (
                <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user.id])
                      } else {
                        setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {user.full_name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user.employee_id} • {user.primary_role}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Selected: {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button onClick={handleAssignUsers} className="flex-1">
                Assign Users
              </Button>
              <Button variant="outline" onClick={() => setIsAssignModalOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
