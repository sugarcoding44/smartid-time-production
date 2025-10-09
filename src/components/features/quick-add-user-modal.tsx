'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface QuickAddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserAdded: () => void
}

export function QuickAddUserModal({ isOpen, onClose, onUserAdded }: QuickAddUserModalProps) {
  const [adding, setAdding] = useState(false)
  const [newUser, setNewUser] = useState({
    fullName: '',
    userType: '',
    icNumber: '',
    email: '',
    phone: ''
  })

  const handleSubmit = async () => {
    if (!newUser.fullName || !newUser.userType || !newUser.icNumber) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setAdding(true)
      
      // Get institution ID from current user (same logic as simple-users-v2)
      const debugResponse = await fetch('/api/debug/supabase')
      const debugData = await debugResponse.json()
      
      const authTest = debugData.tests.find((t: any) => t.name === 'Auth Session')
      const currentAuthUserId = authTest?.data?.userId
      
      if (!currentAuthUserId) {
        toast.error('Authentication required')
        return
      }
      
      const serviceTest = debugData.tests.find((t: any) => t.name === 'Service Role Client')
      const allUsers = serviceTest?.data || []
      
      let currentUser = allUsers.find((u: any) => u.auth_user_id === currentAuthUserId)
      if (!currentUser) {
        currentUser = allUsers.find((u: any) => u.id === currentAuthUserId)
      }
      
      if (!currentUser?.institution_id) {
        toast.error('Institution not found')
        return
      }
      
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
          institution_id: currentUser.institution_id,
          smartid_time_role: newUser.userType,
          primary_system: 'time_web',
          status: 'active'
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(`User ${newUser.fullName} added successfully!`)
        setNewUser({ fullName: '', userType: '', icNumber: '', email: '', phone: '' })
        onUserAdded()
        onClose()
      } else {
        toast.error(result.error || 'Failed to add user')
      }
    } catch (error) {
      console.error('Error adding user:', error)
      toast.error('An unexpected error occurred while adding the user')
    } finally {
      setAdding(false)
    }
  }

  const resetForm = () => {
    setNewUser({ fullName: '', userType: '', icNumber: '', email: '', phone: '' })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm()
        onClose()
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">➕</span>
            Add New User
          </DialogTitle>
          <DialogDescription>
            Quickly register a new student, teacher, or staff member
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
          
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSubmit} 
              disabled={adding}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              {adding ? 'Adding...' : 'Add User'}
            </Button>
            <Button variant="outline" onClick={() => { resetForm(); onClose(); }} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
