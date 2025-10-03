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
import { Settings, CheckCircle, Calendar, Clock, Plus, Edit, Trash2, Search, Users, Grid3X3, List, UserCheck, ClipboardList } from 'lucide-react'
import type { Database } from '@/types/database'

type LeaveType = Database['public']['Tables']['leave_types']['Row']

export default function LeaveTypesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [filteredTypes, setFilteredTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<LeaveType | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    color: '#3B82F6',
    is_paid: true,
    requires_approval: true,
    requires_medical_certificate: false,
    max_consecutive_days: null as number | null,
    min_advance_notice_days: 1,
    has_annual_quota: true,
    default_quota_days: 14.0,
    quota_calculation_method: 'yearly' as 'yearly' | 'monthly' | 'fixed',
    allow_carry_forward: false,
    max_carry_forward_days: 5.0,
    carry_forward_expiry_months: 3,
    is_prorated: true,
    is_active: true
  })

  useEffect(() => {
    initializeData()
  }, [])

  useEffect(() => {
    filterTypes()
  }, [leaveTypes, searchTerm])

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
      
      console.log('👤 Found current user for Leave Types:', user)
      
      if (user) {
        setCurrentUser(user)
        await loadLeaveTypes(user.institution_id)
      }
    } catch (error) {
      console.error('Error initializing leave types data:', error)
      toast.error('Failed to load leave types data')
    } finally {
      setLoading(false)
    }
  }

  const loadLeaveTypes = async (institutionId: string) => {
    try {
      console.log('Loading leave types for institution:', institutionId)
      
      const response = await fetch(`/api/leave-types?institution_id=${institutionId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leave types')
      }
      
      console.log('Leave types loaded:', data.data?.length || 0)
      setLeaveTypes(data.data || [])
    } catch (error) {
      console.error('Error loading leave types:', error)
      toast.error('Failed to load leave types')
    }
  }

  const filterTypes = () => {
    let filtered = leaveTypes

    if (searchTerm) {
      filtered = filtered.filter(type =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name))
    setFilteredTypes(filtered)
  }

  const handleAddLeaveType = async () => {
    try {
      if (!formData.name.trim() || !formData.code.trim()) {
        toast.error('Please fill in all required fields')
        return
      }

      if (!currentUser?.institution_id) {
        toast.error('Institution ID not found')
        return
      }

      const response = await fetch('/api/leave-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          institution_id: currentUser.institution_id,
          ...formData,
          user_id: currentUser.id
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create leave type')
      }
      
      setLeaveTypes([...leaveTypes, data.data])
      setIsAddModalOpen(false)
      resetForm()
      toast.success('Leave type added successfully')
    } catch (error) {
      console.error('Error adding leave type:', error)
      toast.error('Failed to add leave type')
    }
  }

  const handleEditLeaveType = async () => {
    try {
      if (!selectedType || !formData.name.trim() || !formData.code.trim()) {
        toast.error('Please fill in all required fields')
        return
      }

      const response = await fetch(`/api/leave-types/${selectedType.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update leave type')
      }
      
      const updatedTypes = leaveTypes.map(type =>
        type.id === selectedType.id ? data.data : type
      )

      setLeaveTypes(updatedTypes)
      setIsEditModalOpen(false)
      setSelectedType(null)
      resetForm()
      toast.success('Leave type updated successfully')
    } catch (error) {
      console.error('Error updating leave type:', error)
      toast.error('Failed to update leave type')
    }
  }

  const handleDeleteLeaveType = async (typeId: string) => {
    try {
      if (confirm('Are you sure you want to delete this leave type? This action cannot be undone.')) {
        const response = await fetch(`/api/leave-types/${typeId}`, {
          method: 'DELETE'
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete leave type')
        }
        
        setLeaveTypes(leaveTypes.filter(type => type.id !== typeId))
        toast.success('Leave type deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting leave type:', error)
      toast.error('Failed to delete leave type')
    }
  }

  const openEditModal = (type: LeaveType) => {
    setSelectedType(type)
    setFormData({
      name: type.name,
      code: type.code,
      description: type.description || '',
      color: type.color || '#3B82F6',
      is_paid: type.is_paid ?? true,
      requires_approval: type.requires_approval ?? true,
      requires_medical_certificate: type.requires_medical_certificate ?? false,
      max_consecutive_days: type.max_consecutive_days,
      min_advance_notice_days: type.min_advance_notice_days ?? 1,
      has_annual_quota: type.has_annual_quota ?? true,
      default_quota_days: type.default_quota_days ?? 14.0,
      quota_calculation_method: (type.quota_calculation_method as 'yearly' | 'monthly' | 'fixed') ?? 'yearly',
      allow_carry_forward: type.allow_carry_forward ?? false,
      max_carry_forward_days: type.max_carry_forward_days ?? 5.0,
      carry_forward_expiry_months: type.carry_forward_expiry_months ?? 3,
      is_prorated: type.is_prorated ?? true,
      is_active: type.is_active ?? true
    })
    setIsEditModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      color: '#3B82F6',
      is_paid: true,
      requires_approval: true,
      requires_medical_certificate: false,
      max_consecutive_days: null,
      min_advance_notice_days: 1,
      has_annual_quota: true,
      default_quota_days: 14.0,
      quota_calculation_method: 'yearly',
      allow_carry_forward: false,
      max_carry_forward_days: 5.0,
      carry_forward_expiry_months: 3,
      is_prorated: true,
      is_active: true
    })
  }

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <ClipboardList className="w-8 h-8" />
                Leave Types Configuration
              </h1>
              <p className="text-gray-600 dark:text-purple-200/90">Manage leave policies, quotas, and rules for your institution</p>
            </div>
            <div className="mt-4 lg:mt-0 flex gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Button
                  variant={viewMode === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className="px-3 py-1 text-sm"
                >
                  <Grid3X3 className="w-4 h-4 mr-1" />
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3 py-1 text-sm"
                >
                  <List className="w-4 h-4 mr-1" />
                  List
                </Button>
              </div>
              
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Leave Type
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Leave Type</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Leave Type Name *</label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="e.g., Annual Leave"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Leave Code *</label>
                        <Input
                          value={formData.code}
                          onChange={(e) => setFormData({...formData, code: e.target.value})}
                          placeholder="AL"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Brief description of this leave type"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Quota Days *</label>
                <Input
                  type="number"
                  value={formData.default_quota_days?.toString() || ''}
                  onChange={(e) => setFormData({...formData, default_quota_days: parseFloat(e.target.value) || 0})}
                  min="0"
                  step="0.5"
                  placeholder="21"
                />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                        <div className="relative">
                          <input
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({...formData, color: e.target.value})}
                            className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
                          />
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                            style={{ backgroundColor: formData.color }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Min Advance Notice (days)</label>
                        <Input
                          type="number"
                          value={formData.min_advance_notice_days?.toString() || ''}
                          onChange={(e) => setFormData({...formData, min_advance_notice_days: parseInt(e.target.value) || 1})}
                          min="0"
                          placeholder="7"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Consecutive Days</label>
                        <Input
                          type="number"
                          value={formData.max_consecutive_days || ''}
                          onChange={(e) => setFormData({...formData, max_consecutive_days: e.target.value ? parseInt(e.target.value) : null})}
                          min="1"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    {formData.allow_carry_forward && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Carry Forward Days</label>
                          <Input
                            type="number"
                            value={formData.max_carry_forward_days}
                            onChange={(e) => setFormData({...formData, max_carry_forward_days: parseFloat(e.target.value) || 0})}
                            min="0"
                            step="0.5"
                            placeholder="5"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Carry Forward Expiry (months)</label>
                          <Input
                            type="number"
                            value={formData.carry_forward_expiry_months}
                            onChange={(e) => setFormData({...formData, carry_forward_expiry_months: parseInt(e.target.value) || 3})}
                            min="1"
                            placeholder="3"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quota Calculation Method</label>
                      <Select value={formData.quota_calculation_method} onValueChange={(value: 'yearly' | 'monthly' | 'fixed') => setFormData({...formData, quota_calculation_method: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="fixed">Fixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_paid"
                          checked={formData.is_paid}
                          onChange={(e) => setFormData({...formData, is_paid: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="is_paid" className="text-sm text-gray-700 dark:text-gray-300">
                          Paid leave
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="allow_carry_forward"
                          checked={formData.allow_carry_forward}
                          onChange={(e) => setFormData({...formData, allow_carry_forward: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="allow_carry_forward" className="text-sm text-gray-700 dark:text-gray-300">
                          Allow carry forward to next year
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="requires_approval"
                          checked={formData.requires_approval}
                          onChange={(e) => setFormData({...formData, requires_approval: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="requires_approval" className="text-sm text-gray-700 dark:text-gray-300">
                          Requires admin approval
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="requires_medical_certificate"
                          checked={formData.requires_medical_certificate}
                          onChange={(e) => setFormData({...formData, requires_medical_certificate: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="requires_medical_certificate" className="text-sm text-gray-700 dark:text-gray-300">
                          Requires medical certificate
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="has_annual_quota"
                          checked={formData.has_annual_quota}
                          onChange={(e) => setFormData({...formData, has_annual_quota: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="has_annual_quota" className="text-sm text-gray-700 dark:text-gray-300">
                          Has annual quota
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_prorated"
                          checked={formData.is_prorated}
                          onChange={(e) => setFormData({...formData, is_prorated: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="is_prorated" className="text-sm text-gray-700 dark:text-gray-300">
                          Prorated for new employees
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
                          Active (available for use)
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleAddLeaveType} className="flex-1">
                        Create Leave Type
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

        {/* Search */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search leave types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Leave Types Display */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Leave Types
              <Badge variant="secondary" className="ml-auto">
                {filteredTypes.length} types
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTypes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500 dark:text-gray-400">No leave types found</p>
                <p className="text-sm text-gray-400 mt-2">Create your first leave type to get started</p>
              </div>
            ) : viewMode === 'card' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredTypes.map((type) => (
                  <div key={type.id} className="bg-white border border-gray-200 dark:bg-slate-700 dark:border-slate-600 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl text-white font-bold"
                          style={{ backgroundColor: type.color || '#3B82F6' }}
                        >
                          {type.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {type.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Code: {type.code}</p>
                          {type.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {type.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={type.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {type.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditModal(type)}
                          className="p-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteLeaveType(type.id)}
                          className="p-2 text-red-600 hover:text-red-700 border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3">
                        <span className="text-blue-700 dark:text-blue-300 font-medium">Default Days</span>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {type.default_quota_days || 0}
                        </div>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-900 rounded-lg p-3">
                        <span className="text-green-700 dark:text-green-300 font-medium">Notice Period</span>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {type.min_advance_notice_days || 0} days
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Info */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {type.is_paid && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          💰 Paid Leave
                        </Badge>
                      )}
                      {type.allow_carry_forward && (
                        <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                          📅 Carry Forward ({type.max_carry_forward_days || 0} days)
                        </Badge>
                      )}
                      {type.requires_approval && (
                        <Badge className="bg-orange-100 text-orange-800 text-xs">
                          ✋ Requires Approval
                        </Badge>
                      )}
                      {type.requires_medical_certificate && (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          🏥 Medical Cert Required
                        </Badge>
                      )}
                      {type.max_consecutive_days && (
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
                          📊 Max {type.max_consecutive_days} consecutive days
                        </Badge>
                      )}
                      {type.has_annual_quota && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          📈 Annual Quota ({type.quota_calculation_method})
                        </Badge>
                      )}
                      {type.is_prorated && (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                          ⚖️ Prorated
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="grid grid-cols-1 gap-4">
                {filteredTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: type.color || '#3B82F6' }}
                      >
                        {type.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {type.name}
                          </div>
                          <Badge className={type.is_active ? 'bg-green-100 text-green-800 text-xs' : 'bg-gray-100 text-gray-800 text-xs'}>
                            {type.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Code: {type.code} • Default: {type.default_quota_days || 0} days • Notice: {type.min_advance_notice_days || 0} days
                        </div>
                        {type.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {type.description}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditModal(type)}
                        className="p-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteLeaveType(type.id)}
                        className="p-2 text-red-600 hover:text-red-700 border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Leave Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Leave Type Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Annual Leave"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Leave Code *</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="AL"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of this leave type"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Default Quota Days *</label>
                <Input
                  type="number"
                  value={formData.max_carry_forward_days?.toString() || ''}
                  onChange={(e) => setFormData({...formData, max_carry_forward_days: parseFloat(e.target.value) || 0})}
                  min="0"
                  step="0.5"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                <div className="relative">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
                  />
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    style={{ backgroundColor: formData.color }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Min Advance Notice (days)</label>
                <Input
                  type="number"
                  value={formData.min_advance_notice_days?.toString() || ''}
                  onChange={(e) => setFormData({...formData, min_advance_notice_days: parseInt(e.target.value) || 1})}
                  min="0"
                  placeholder="7"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Consecutive Days</label>
                <Input
                  type="number"
                  value={formData.max_consecutive_days?.toString() || ''}
                  onChange={(e) => setFormData({...formData, max_consecutive_days: e.target.value ? parseInt(e.target.value) : null})}
                  min="1"
                  placeholder="Optional"
                />
              </div>
            </div>

            {formData.allow_carry_forward && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Carry Forward Days</label>
                  <Input
                    type="number"
                    value={formData.max_carry_forward_days}
                    onChange={(e) => setFormData({...formData, max_carry_forward_days: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.5"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Carry Forward Expiry (months)</label>
                <Input
                  type="number"
                  value={formData.carry_forward_expiry_months?.toString() || ''}
                  onChange={(e) => setFormData({...formData, carry_forward_expiry_months: parseInt(e.target.value) || 3})}
                  min="1"
                  placeholder="3"
                />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quota Calculation Method</label>
              <Select value={formData.quota_calculation_method} onValueChange={(value: 'yearly' | 'monthly' | 'fixed') => setFormData({...formData, quota_calculation_method: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_is_paid"
                  checked={formData.is_paid}
                  onChange={(e) => setFormData({...formData, is_paid: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="edit_is_paid" className="text-sm text-gray-700 dark:text-gray-300">
                  Paid leave
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_allow_carry_forward"
                  checked={formData.allow_carry_forward}
                  onChange={(e) => setFormData({...formData, allow_carry_forward: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="edit_allow_carry_forward" className="text-sm text-gray-700 dark:text-gray-300">
                  Allow carry forward to next year
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_requires_approval"
                  checked={formData.requires_approval}
                  onChange={(e) => setFormData({...formData, requires_approval: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="edit_requires_approval" className="text-sm text-gray-700 dark:text-gray-300">
                  Requires admin approval
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_requires_medical_certificate"
                  checked={formData.requires_medical_certificate}
                  onChange={(e) => setFormData({...formData, requires_medical_certificate: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="edit_requires_medical_certificate" className="text-sm text-gray-700 dark:text-gray-300">
                  Requires medical certificate
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_has_annual_quota"
                  checked={formData.has_annual_quota}
                  onChange={(e) => setFormData({...formData, has_annual_quota: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="edit_has_annual_quota" className="text-sm text-gray-700 dark:text-gray-300">
                  Has annual quota
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_is_prorated"
                  checked={formData.is_prorated}
                  onChange={(e) => setFormData({...formData, is_prorated: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="edit_is_prorated" className="text-sm text-gray-700 dark:text-gray-300">
                  Prorated for new employees
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="edit_is_active" className="text-sm text-gray-700 dark:text-gray-300">
                  Active (available for use)
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button onClick={handleEditLeaveType} className="flex-1">
                Update Leave Type
              </Button>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
