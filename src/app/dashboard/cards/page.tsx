
'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CardIssuanceModal } from '@/components/features/card-issuance-modal'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { HeaderSkeleton, StatCardSkeleton, TableSkeleton, ActivityFeedSkeleton } from '@/components/ui/loading-skeletons'

type CardUser = {
  id: string
  user_id: string
  card_number: string | null
  status: 'active' | 'inactive' | 'lost' | 'stolen'
  issued_at?: string
  expires_at?: string
  users: {
    full_name: string
    employee_id: string
    primary_role: string
  }
}

const statusColors = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-600 dark:text-emerald-100 dark:border-emerald-500',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-600 dark:text-yellow-100 dark:border-yellow-500',
  blocked: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-600 dark:text-red-100 dark:border-red-500',
  expired: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500'
}

const activityIcons = {
  transaction: '💰',
  topup: '⬆️',
  issued: '💳',
  blocked: '🚫'
}

const activityColors = {
  transaction: 'bg-blue-500',
  topup: 'bg-emerald-500',
  issued: 'bg-indigo-500',
  blocked: 'bg-red-500'
}

export default function CardManagementPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [cardData, setCardData] = useState<CardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [manualIssueOpen, setManualIssueOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<CardUser | null>(null)
  const [manualCardDetails, setManualCardDetails] = useState({
    cardId: '',
    initialBalance: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  
  // Stock tracking - simulating orders from order page
  const [totalOrderedCards] = useState(1200) // Simulated total ordered cards
  const issuedCardsCount = cardData.filter(user => user.card_number).length
  const availableStock = totalOrderedCards - issuedCardsCount

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      setLoading(true)
      
      // Get current user from Supabase auth
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        toast.error('Please sign in to view smart cards')
        return
      }
      
      // Get user profile data
      const { data: currentUser } = await supabase
        .from('users')
        .select('*')
        .or(`auth_user_id.eq.${authUser.id},id.eq.${authUser.id}`)
        .single()
      
      console.log('👤 Found current user for Smart Cards:', currentUser)
      
      if (currentUser) {
        setCurrentUser(currentUser)
        if (currentUser.institution_id) {
          await loadSmartCards(currentUser.institution_id)
        }
      }
    } catch (error) {
      console.error('Error initializing smart cards data:', error)
      toast.error('Failed to load smart cards data')
    } finally {
      setLoading(false)
    }
  }

  const loadSmartCards = async (institutionId: string) => {
    try {
      console.log('Loading smart cards for institution:', institutionId)
      
      const response = await fetch(`/api/smart-cards?institutionId=${institutionId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch smart cards')
      }
      
      console.log('Smart cards loaded:', data.data?.length || 0)
      setCardData(data.data || [])
      
      // Set mock recent activity for now
      setRecentActivity([
        {
          id: 1,
          type: 'issued',
          user: data.data?.[0]?.users?.full_name || 'User',
          employeeId: data.data?.[0]?.users?.employee_id || 'N/A',
          action: 'SmartID NFC Card issued',
          timestamp: new Date().toISOString(),
          cardId: data.data?.[0]?.card_number || 'N/A',
          amount: null
        }
      ])
    } catch (error) {
      console.error('Error loading smart cards:', error)
      toast.error('Failed to load smart cards')
    }
  }

  const openCardModal = (user: CardUser) => {
    if (availableStock <= 0) {
      toast.error('No cards available in stock. Please order more cards.')
      return
    }
    setSelectedUser(user)
    setCardModalOpen(true)
  }

  const openManualIssue = (user: CardUser) => {
    setSelectedUser(user)
    setManualIssueOpen(true)
  }

  const handleCardIssuance = async (userId: string, cardId: string) => {
    try {
      const response = await fetch('/api/smart-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          card_number: cardId
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to issue smart card')
      }
      
      // Reload smart cards data
      if (currentUser?.institution_id) {
        await loadSmartCards(currentUser.institution_id)
      }
      
      toast.success(data.message || 'SmartID NFC Card issued successfully!')
    } catch (error) {
      console.error('Error issuing smart card:', error)
      toast.error('Failed to issue smart card')
    }
  }

  const handleManualCardIssuance = async () => {
    if (!manualCardDetails.cardId || !selectedUser) {
      toast.error('Please enter card ID')
      return
    }
    
    try {
      const response = await fetch('/api/smart-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUser.user_id,
          card_number: manualCardDetails.cardId
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to issue smart card')
      }
      
      // Reload smart cards data
      if (currentUser?.institution_id) {
        await loadSmartCards(currentUser.institution_id)
      }
      
      setManualCardDetails({ cardId: '', initialBalance: 0 })
      setManualIssueOpen(false)
      setSelectedUser(null)
      toast.success(data.message || 'SmartID NFC Card issued manually!')
    } catch (error) {
      console.error('Error issuing smart card manually:', error)
      toast.error('Failed to issue smart card')
    }
  }

  const filteredData = cardData.filter(user => {
    const matchesSearch = user.users.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.users.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.card_number && user.card_number.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    const matchesType = filterType === 'all' || user.users.primary_role === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: cardData.length,
    active: cardData.filter(u => u.status === 'active').length,
    pending: cardData.filter(u => !u.card_number).length,
    blocked: cardData.filter(u => u.status === 'inactive' || u.status === 'lost' || u.status === 'stolen').length,
    totalBalance: 0, // Mock balance for now
    transactions: 0 // Mock transactions for now
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <HeaderSkeleton />
          
          {/* Stats Overview Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          
          {/* Stock Information Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TableSkeleton rows={8} />
            </div>
            <div className="space-y-6">
              <ActivityFeedSkeleton items={8} />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Gradient Header */}
        <div className="rounded-2xl p-8 border-0 shadow-lg header-card">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">SmartID NFC Card Management 💳</h1>
              <p className="text-gray-600 dark:text-purple-200/90">SMK Bukit Jelutong • Monitor card issuance, eWallet balances, and transaction activities</p>
            </div>
            <div className="flex gap-6 mt-4 lg:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</div>
                <div className="text-sm text-gray-500 dark:text-purple-200/70">Active Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">RM {stats.totalBalance.toFixed(2)}</div>
                <div className="text-sm text-gray-500 dark:text-purple-200/70">Total Balance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">👥</span>
              </div>
              <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Total Users</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✅</span>
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{stats.active}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Active Cards</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">⏳</span>
              </div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">{stats.pending}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Pending</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🚫</span>
              </div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">{stats.blocked}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Blocked</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">💰</span>
              </div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">RM {stats.totalBalance.toFixed(2)}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Total Balance</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">💳</span>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stats.transactions}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Transactions</div>
            </CardContent>
          </Card>

        </div>

        {/* Stock Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">📦</span>
              </div>
              <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-1">{totalOrderedCards}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Total Ordered</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">💳</span>
              </div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{issuedCardsCount}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Cards Issued</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                availableStock < 50 ? 'bg-red-600' : 
                availableStock < 100 ? 'bg-amber-600' : 
                'bg-green-600'
              }`}>
                <span className="text-white text-lg">📋</span>
              </div>
              <div className={`text-3xl font-bold mb-1 ${
                availableStock < 50 ? 'text-red-600 dark:text-red-400' : 
                availableStock < 100 ? 'text-amber-600 dark:text-amber-400' : 
                'text-green-600 dark:text-green-400'
              }`}>{availableStock}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Available Stock</div>
              {availableStock < 50 && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-1">Low Stock!</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Card Records Table */}
          <div className="xl:col-span-2">
            <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-slate-50">SmartID NFC Card Records</CardTitle>
                <div className="flex flex-col lg:flex-row gap-4 mt-4">
                  <Input
                    placeholder="Search by name, ID, or Card ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="lg:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="lg:w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="teacher">Teachers</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Card ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-slate-100">{card.users.full_name}</div>
                            <div className="text-sm text-gray-500 dark:text-slate-400">{card.users.employee_id} • {card.users.primary_role}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {card.card_number ? (
                            <span className="font-mono text-sm bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                              {card.card_number}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-slate-500">Not issued</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[card.status === 'active' ? 'active' : card.status === 'inactive' || card.status === 'lost' || card.status === 'stolen' ? 'blocked' : 'pending']}>
                            {card.status === 'active' ? 'active' : card.status === 'inactive' || card.status === 'lost' || card.status === 'stolen' ? 'blocked' : 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">RM 0.00</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">0</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-400 dark:text-slate-500">Never</span>
                        </TableCell>
                        <TableCell>
                          {!card.card_number ? (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => openCardModal(card)}
                                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white"
                                disabled={availableStock <= 0}
                              >
                                💳 Issue
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openManualIssue(card)}
                                className="text-xs dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                              >
                                Manual
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-slate-400">Issued</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-slate-50 flex items-center gap-2">
                  🔔 Recent Activity
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      <div className={`w-8 h-8 ${activityColors[activity.type as keyof typeof activityColors]} rounded-full flex items-center justify-center text-white text-sm flex-shrink-0`}>
                        {activityIcons[activity.type as keyof typeof activityIcons]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          {activity.user}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                          {activity.action}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            {activity.employeeId}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                            {activity.cardId}
                          </span>
                          {activity.amount && (
                            <>
                              <span className="text-xs text-gray-400">•</span>
                              <span className={`text-xs font-medium ${
                                activity.amount > 0 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {activity.amount > 0 ? '+' : ''}RM {Math.abs(activity.amount).toFixed(2)}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Card Info */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">💳</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 mb-2">SmartID NFC Card Features</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">Secure encrypted technology with built-in eWallet functionality</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div className="text-3xl mb-3">🔐</div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">Encrypted Security</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Cannot be duplicated or cloned. Advanced encryption ensures maximum security.</p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">eWallet System</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Integrated digital wallet for cashless payments at SmartPOS terminals.</p>
              </div>
              
              <div className="text-center p-6 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div className="text-3xl mb-3">📱</div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2">Easy Top-up</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">Top-up with cash at merchant terminals or via SmartPay mobile app.</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-1">Card Price: RM 10.00 per card</h3>
                  <p className="text-sm text-indigo-700 dark:text-indigo-400">Minimum order: 100 cards • Free delivery for orders above 500 cards</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Order Cards
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card Issuance Modal */}
      {selectedUser && (
        <CardIssuanceModal
          isOpen={cardModalOpen}
          onClose={() => {
            setCardModalOpen(false)
            setSelectedUser(null)
          }}
          user={{
            id: selectedUser.user_id,
            fullName: selectedUser.users.full_name,
            employeeId: selectedUser.users.employee_id,
            userType: selectedUser.users.primary_role
          }}
          onIssuanceComplete={handleCardIssuance}
        />
      )}

      {/* Manual Card Entry Modal */}
      <Dialog open={manualIssueOpen} onOpenChange={setManualIssueOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Card Issuance</DialogTitle>
            <DialogDescription>
              Manually enter SmartID NFC Card details for {selectedUser?.users?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardId">Card ID *</Label>
              <Input
                id="cardId"
                placeholder="e.g., CRD67890"
                value={manualCardDetails.cardId}
                onChange={(e) => setManualCardDetails(prev => ({...prev, cardId: e.target.value}))}
              />
            </div>
            <div>
              <Label htmlFor="initialBalance">Initial Balance (RM)</Label>
              <Input
                id="initialBalance"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={manualCardDetails.initialBalance}
                onChange={(e) => setManualCardDetails(prev => ({...prev, initialBalance: parseFloat(e.target.value) || 0}))}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleManualCardIssuance} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600">
                Issue Card
              </Button>
              <Button variant="outline" onClick={() => {
                setManualIssueOpen(false)
                setSelectedUser(null)
                setManualCardDetails({ cardId: '', initialBalance: 0 })
              }} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
