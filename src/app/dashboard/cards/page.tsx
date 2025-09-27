
'use client'

import React, { useState } from 'react'
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

type CardUser = {
  id: string
  fullName: string
  employeeId: string
  userType: string
  cardId: string | null
  issuedAt: string | null
  lastUsed: string | null
  transactionCount: number
  balance: number
  status: 'active' | 'pending' | 'blocked' | 'expired'
  cardType: string | null
}

// Sample card data
const cardDataInitial = [
  {
    id: '1',
    fullName: 'Siti Aminah binti Rahman',
    employeeId: 'TC0001',
    userType: 'teacher',
    cardId: 'CRD67890',
    issuedAt: '2024-01-16T09:00:00',
    lastUsed: '2024-03-15T12:30:00',
    transactionCount: 45,
    balance: 25.50,
    status: 'active',
    cardType: 'SmartID NFC'
  },
  {
    id: '2',
    fullName: 'Mohammad bin Abdullah',
    employeeId: 'ST0001',
    userType: 'staff',
    cardId: 'CRD67891',
    issuedAt: '2024-01-11T10:30:00',
    lastUsed: '2024-03-14T15:45:00',
    transactionCount: 23,
    balance: 12.75,
    status: 'active',
    cardType: 'SmartID NFC'
  },
  {
    id: '3',
    fullName: 'Nur Aisyah binti Hassan',
    employeeId: 'SD0001',
    userType: 'student',
    cardId: null,
    issuedAt: null,
    lastUsed: null,
    transactionCount: 0,
    balance: 0,
    status: 'pending',
    cardType: null
  },
  {
    id: '4',
    fullName: 'Lim Kai Wei',
    employeeId: 'TC0002',
    userType: 'teacher',
    cardId: 'CRD67892',
    issuedAt: '2024-01-22T14:15:00',
    lastUsed: '2024-03-16T11:20:00',
    transactionCount: 67,
    balance: 38.25,
    status: 'active',
    cardType: 'SmartID NFC'
  },
  {
    id: '5',
    fullName: 'Ahmad Ali bin Hassan',
    employeeId: 'SD0002',
    userType: 'student',
    cardId: 'CRD67893',
    issuedAt: '2024-02-10T16:00:00',
    lastUsed: '2024-03-10T13:15:00',
    transactionCount: 31,
    balance: 5.00,
    status: 'blocked',
    cardType: 'SmartID NFC'
  }
]

const recentActivity = [
  {
    id: 1,
    type: 'transaction',
    user: 'Lim Kai Wei',
    employeeId: 'TC0002',
    action: 'Purchased lunch - RM 8.50',
    timestamp: '2024-03-16T11:20:00',
    cardId: 'CRD67892',
    amount: -8.50
  },
  {
    id: 2,
    type: 'topup',
    user: 'Siti Aminah binti Rahman',
    employeeId: 'TC0001',
    action: 'eWallet topped up - RM 20.00',
    timestamp: '2024-03-16T10:15:00',
    cardId: 'CRD67890',
    amount: 20.00
  },
  {
    id: 3,
    type: 'issued',
    user: 'Nurul Huda binti Ahmad',
    employeeId: 'SD0055',
    action: 'SmartID NFC Card issued',
    timestamp: '2024-03-16T08:45:00',
    cardId: 'CRD67895',
    amount: null
  },
  {
    id: 4,
    type: 'blocked',
    user: 'Ahmad Ali bin Hassan',
    employeeId: 'SD0002',
    action: 'Card blocked due to suspicious activity',
    timestamp: '2024-03-15T16:30:00',
    cardId: 'CRD67893',
    amount: null
  }
]

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
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [cardData, setCardData] = useState<CardUser[]>(cardDataInitial as CardUser[])
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [manualIssueOpen, setManualIssueOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<CardUser | null>(null)
  const [manualCardDetails, setManualCardDetails] = useState({
    cardId: '',
    initialBalance: 0
  })
  
  // Stock tracking - simulating orders from order page
  const [totalOrderedCards] = useState(1200) // Simulated total ordered cards
  const issuedCardsCount = cardData.filter(user => user.cardId).length
  const availableStock = totalOrderedCards - issuedCardsCount

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

  const handleCardIssuance = (userId: string, cardId: string) => {
    setCardData(prevData => prevData.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            cardId, 
            status: 'active' as const, 
            issuedAt: new Date().toISOString(),
            lastUsed: null,
            balance: 0,
            cardType: 'SmartID NFC'
          }
        : user
    ))
    toast.success('SmartID NFC Card issued successfully!')
  }

  const handleManualCardIssuance = () => {
    if (!manualCardDetails.cardId || !selectedUser) {
      toast.error('Please enter card ID')
      return
    }
    
    setCardData(prevData => prevData.map(user => 
      user.id === selectedUser.id 
        ? { 
            ...user, 
            cardId: manualCardDetails.cardId, 
            status: 'active' as const, 
            issuedAt: new Date().toISOString(),
            lastUsed: null,
            balance: manualCardDetails.initialBalance,
            cardType: 'SmartID NFC'
          }
        : user
    ))
    
    setManualCardDetails({ cardId: '', initialBalance: 0 })
    setManualIssueOpen(false)
    setSelectedUser(null)
    toast.success('SmartID NFC Card issued manually!')
  }

  const filteredData = cardData.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.cardId && user.cardId.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    const matchesType = filterType === 'all' || user.userType === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: cardData.length,
    active: cardData.filter(u => u.status === 'active').length,
    pending: cardData.filter(u => u.status === 'pending').length,
    blocked: cardData.filter(u => u.status === 'blocked').length,
    totalBalance: cardData.reduce((sum, u) => sum + u.balance, 0),
    transactions: cardData.reduce((sum, u) => sum + u.transactionCount, 0)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Gradient Header */}
        <div className="bg-white dark:bg-gradient-to-br dark:from-violet-900 dark:to-purple-900 rounded-2xl p-8 border-0 shadow-lg dark:border dark:border-purple-800/50">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-slate-50 mb-1">{stats.total}</div>
                <div className="text-sm text-gray-600 dark:text-slate-400">Total Users</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{stats.active}</div>
                <div className="text-sm text-gray-600 dark:text-slate-400">Active Cards</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">{stats.pending}</div>
                <div className="text-sm text-gray-600 dark:text-slate-400">Pending</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">{stats.blocked}</div>
                <div className="text-sm text-gray-600 dark:text-slate-400">Blocked</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">RM {stats.totalBalance.toFixed(2)}</div>
                <div className="text-sm text-gray-600 dark:text-slate-400">Total Balance</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{stats.transactions}</div>
                <div className="text-sm text-gray-600 dark:text-slate-400">Transactions</div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Stock Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-slate-50 mb-1">{totalOrderedCards}</div>
                <div className="text-sm text-gray-600 dark:text-slate-400">Total Ordered</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{issuedCardsCount}</div>
                <div className="text-sm text-gray-600 dark:text-slate-400">Cards Issued</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  availableStock < 50 ? 'text-red-600 dark:text-red-400' : 
                  availableStock < 100 ? 'text-yellow-600 dark:text-yellow-400' : 
                  'text-emerald-600 dark:text-emerald-400'
                }`}>{availableStock}</div>
                <div className="text-sm text-gray-600 dark:text-slate-400">Available Stock</div>
                {availableStock < 50 && (
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">Low Stock!</div>
                )}
              </div>
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
                    {filteredData.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-slate-100">{user.fullName}</div>
                            <div className="text-sm text-gray-500 dark:text-slate-400">{user.employeeId} • {user.userType}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.cardId ? (
                            <span className="font-mono text-sm bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                              {user.cardId}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-slate-500">Not issued</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[user.status as keyof typeof statusColors]}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">RM {user.balance.toFixed(2)}</span>
                            {user.balance < 10 && user.balance > 0 && (
                              <div className="w-2 h-2 bg-amber-400 rounded-full" title="Low balance" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{user.transactionCount}</span>
                        </TableCell>
                        <TableCell>
                          {user.lastUsed ? (
                            <div className="text-sm">
                              <div>{new Date(user.lastUsed).toLocaleDateString()}</div>
                              <div className="text-gray-500 dark:text-slate-400">
                                {new Date(user.lastUsed).toLocaleTimeString()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-slate-500">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {!user.cardId ? (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => openCardModal(user)}
                                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white"
                                disabled={availableStock <= 0}
                              >
                                💳 Issue
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openManualIssue(user)}
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
          user={selectedUser}
          onIssuanceComplete={handleCardIssuance}
        />
      )}

      {/* Manual Card Entry Modal */}
      <Dialog open={manualIssueOpen} onOpenChange={setManualIssueOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manual Card Issuance</DialogTitle>
            <DialogDescription>
              Manually enter SmartID NFC Card details for {selectedUser?.fullName}
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
