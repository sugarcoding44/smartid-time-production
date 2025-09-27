'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type User = {
  id: string
  full_name: string
  employee_id: string
  primary_role: string
  ic_number: string
  email: string | null
  phone: string | null
}

interface QuickUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserSelect: (user: User) => void
  title: string
  description: string
  filterCondition?: (user: User) => boolean
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

export function QuickUserModal({ 
  isOpen, 
  onClose, 
  onUserSelect, 
  title, 
  description, 
  filterCondition 
}: QuickUserModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      setSearchTerm('')
    }
  }, [isOpen])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Get institution ID from debug endpoint (same as simple-users page)
      const debugResponse = await fetch('/api/debug/supabase')
      const debugData = await debugResponse.json()
      
      const serviceTest = debugData.tests.find((t: any) => t.name === 'Service Role Client')
      const currentUser = serviceTest?.data?.[0]
      
      if (!currentUser) {
        toast.error('Could not load user information')
        return
      }
      
      const mockInstitutionId = 'e808b0a5-af6b-4905-b3c1-f93d327a2559'
      
      // Fetch users using the API endpoint
      const response = await fetch(`/api/users?institutionId=${mockInstitutionId}`)
      const result = await response.json()
      
      if (result.success) {
        setUsers(result.users)
      } else {
        toast.error(result.error || 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.ic_number.includes(searchTerm)
    
    const matchesFilter = filterCondition ? filterCondition(user) : true
    
    return matchesSearch && matchesFilter
  })

  const handleUserSelect = (user: User) => {
    onUserSelect(user)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <Input
            placeholder="Search users by name, ID, or IC number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          
          {/* User List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md cursor-pointer transition-all duration-200"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                          {userTypeIcons[user.primary_role as keyof typeof userTypeIcons] || '👤'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">{user.full_name}</h3>
                            <Badge className={userTypeColors[user.primary_role as keyof typeof userTypeColors] || 'bg-gray-100 text-gray-800'}>
                              {user.primary_role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <span>ID: {user.employee_id}</span>
                            <span>IC: {user.ic_number}</span>
                            {user.email && <span>Email: {user.email}</span>}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Select
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">👥</div>
                <p className="text-gray-600 dark:text-gray-300">
                  {searchTerm ? 'No users found matching your search' : 'No users available'}
                </p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} shown
            </span>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
