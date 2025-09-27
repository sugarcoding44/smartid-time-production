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
import { Calendar, Clock, Flag, School, Plus, Search, ChevronDown, CalendarDays, Edit, Trash2, Grid3X3 } from 'lucide-react'

type Holiday = {
  id: string
  name: string
  description?: string
  start_date: string
  end_date: string
  type: 'public' | 'school' | 'religious' | 'cultural'
  recurring: boolean
  created_at: string
  created_by?: string
}

const holidayTypes = [
  { value: 'public', label: 'Public Holiday', color: 'blue' },
  { value: 'school', label: 'School Holiday', color: 'green' },
  { value: 'religious', label: 'Religious Holiday', color: 'purple' },
  { value: 'cultural', label: 'Cultural Event', color: 'orange' }
]

// Holiday Calendar View Component
function HolidayCalendarView({ 
  holidays, 
  onEditHoliday, 
  onDeleteHoliday 
}: { 
  holidays: Holiday[]
  onEditHoliday: (holiday: Holiday) => void
  onDeleteHoliday: (holidayId: string) => void
}) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const [viewDate, setViewDate] = useState(new Date(currentYear, currentMonth))
  
  // Get calendar grid
  const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)
  const startDate = new Date(startOfMonth)
  
  // Calculate how many days to go back to get to Sunday
  const daysToGoBack = startOfMonth.getDay() // 0 = Sunday, 1 = Monday, etc.
  startDate.setDate(startDate.getDate() - daysToGoBack)
  
  console.log(`Calendar for ${viewDate.toLocaleDateString()}:`)
  console.log(`Start of month: ${startOfMonth.toLocaleDateString()} (day of week: ${startOfMonth.getDay()})`)
  console.log(`Calendar starts from: ${startDate.toLocaleDateString()}`)
  
  const days = []
  const currentDate = new Date(startDate)
  
  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  const getHolidaysForDate = (date: Date) => {
    // Use local date string to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    const matchingHolidays = holidays.filter(holiday => {
      const startDate = holiday.start_date
      const endDate = holiday.end_date
      
      // Check if date is in the holiday range
      let isInRange = dateStr >= startDate && dateStr <= endDate
      
      // If it's a recurring holiday, check for other years too
      if (!isInRange && holiday.recurring) {
        const holidayStartDate = new Date(startDate)
        const currentDate = new Date(dateStr)
        
        // For recurring holidays, check if month and day match
        const holidayMonth = holidayStartDate.getMonth()
        const holidayDay = holidayStartDate.getDate()
        const currentMonth = currentDate.getMonth()
        const currentDay = currentDate.getDate()
        
        // For multi-day holidays, check the full range
        if (startDate !== endDate) {
          const holidayEndDate = new Date(endDate)
          const endMonth = holidayEndDate.getMonth()
          const endDay = holidayEndDate.getDate()
          
          // Check if current date falls within the recurring date range
          const currentYear = currentDate.getFullYear()
          const recurringStart = new Date(currentYear, holidayMonth, holidayDay)
          const recurringEnd = new Date(currentYear, endMonth, endDay)
          
          // Use date-only comparison to avoid time component issues
          const currentDateOnly = new Date(currentYear, currentMonth, currentDay)
          
          // For recurring multi-day holidays, check if current date is within the range
          if (currentDateOnly >= recurringStart && currentDateOnly <= recurringEnd) {
            isInRange = true
          }
          
          // Debug multi-day holiday logic
          if (currentMonth === 0 && currentDay <= 3) { // January 1-3
            console.log(`🗓️ Multi-day holiday check for ${dateStr}:`)
            console.log(`  Holiday: ${holiday.name} (${startDate} to ${endDate})`)
            console.log(`  Recurring start: ${recurringStart.toLocaleDateString()}`)
            console.log(`  Recurring end: ${recurringEnd.toLocaleDateString()}`)
            console.log(`  Current date only: ${currentDateOnly.toLocaleDateString()}`)
            console.log(`  In range: ${currentDateOnly >= recurringStart && currentDateOnly <= recurringEnd}`)
            console.log(`  Times - Start: ${recurringStart.getTime()}, Current: ${currentDateOnly.getTime()}, End: ${recurringEnd.getTime()}`)
          }
        } else {
          // For single-day holidays, simple match
          if (currentMonth === holidayMonth && currentDay === holidayDay) {
            isInRange = true
          }
        }
      }
      
      // Debug logging
      if (isInRange && date.getMonth() === viewDate.getMonth()) {
        console.log(`✅ Holiday found for ${dateStr}: ${holiday.name} (${startDate} to ${endDate}, recurring: ${holiday.recurring})`)
      }
      
      // Extra debugging for Jan 1st specifically
      if (dateStr.endsWith('-01-01') || dateStr.endsWith('-01-02')) {
        console.log(`🔍 Checking Jan 1/2: ${dateStr} against holiday ${holiday.name} (${startDate} to ${endDate}), recurring: ${holiday.recurring}, match: ${isInRange}`)
      }
      
      return isInRange
    })
    
    // Debug: Show what we're returning
    if (dateStr.endsWith('-01-01') || dateStr.endsWith('-01-02')) {
      console.log(`📤 Returning ${matchingHolidays.length} holidays for ${dateStr}:`, matchingHolidays.map(h => h.name))
    }
    
    return matchingHolidays
  }
  
  const getTypeColor = (type: string) => {
    const typeConfig = holidayTypes.find(t => t.value === type)
    switch (typeConfig?.color) {
      case 'blue': return 'bg-blue-500'
      case 'green': return 'bg-green-500'
      case 'purple': return 'bg-purple-500'
      case 'orange': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setViewDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }
  
  // Debug: Log holidays data
  console.log('HolidayCalendarView - Total holidays:', holidays.length)
  if (holidays.length > 0) {
    console.log('Sample holiday:', holidays[0])
  }
  
  return (
    <div className="space-y-4">
      {/* Debug Info - Only show if there are issues */}
      {process.env.NODE_ENV === 'development' && false && (
        <div className="text-xs text-gray-500 p-2 bg-gray-100 dark:bg-gray-800 rounded space-y-1">
          <div>Debug: {holidays.length} holidays loaded for {viewDate.toLocaleDateString()}</div>
        </div>
      )}
      
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigateMonth('prev')}
          className="p-2"
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
        </Button>
        
        <h3 className="text-lg font-semibold">
          {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        
        <Button
          variant="outline"
          onClick={() => navigateMonth('next')}
          className="p-2"
        >
          <ChevronDown className="w-4 h-4 -rotate-90" />
        </Button>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === viewDate.getMonth()
          const isToday = date.toDateString() === today.toDateString()
          
          // Get holidays for this date
          const dayHolidays = getHolidaysForDate(date)
          
          // Special debug for January 1st issue
          if (isCurrentMonth && date.getDate() === 1 && date.getMonth() === 0) {
            console.log(`🎯 JANUARY 1ST DEBUG:`)
            console.log(`  Date object:`, date)
            console.log(`  ISO String:`, date.toISOString())
            console.log(`  Date string for comparison:`, date.toISOString().split('T')[0])
            console.log(`  Holidays found:`, dayHolidays)
            console.log(`  Holiday function called again:`, getHolidaysForDate(date))
          }
          
          // Debug for first few days of January
          if (isCurrentMonth && date.getDate() <= 3) {
            console.log(`Calendar cell ${index}: ${date.toLocaleDateString()} (day ${date.getDate()}), holidays: ${dayHolidays.length}`, dayHolidays)
          }
          
          return (
            <div
              key={index}
              className={`
                min-h-[100px] p-2 border relative transition-all duration-200
                ${
                  dayHolidays.length > 0
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-700 shadow-sm'
                    : isCurrentMonth 
                      ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700'
                      : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-gray-700'
                }
                ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                hover:shadow-sm hover:scale-[1.02]
              `}
            >
              <div className={`
                text-sm font-bold mb-2
                ${isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'}
                ${isToday ? 'text-blue-600' : ''}
              `}>
                <div className="flex items-center justify-between">
                  <span>{date.getDate()}</span>
                  {dayHolidays.length > 0 && (
                    <div className="relative">
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg border border-white/20 animate-pulse hover:animate-none hover:scale-110 transition-transform duration-200">
                        {dayHolidays.length}
                      </span>
                    </div>
                  )}
                </div>
                {process.env.NODE_ENV === 'development' && isCurrentMonth && date.getDate() <= 3 && (
                  <div className="text-xs text-gray-400">
                    {date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                  </div>
                )}
              </div>
              
              {/* Holidays for this date */}
              <div className="space-y-1">
                {dayHolidays.slice(0, 3).map(holiday => (
                  <div
                    key={holiday.id}
                    className={`
                      px-2 py-1 rounded-md text-xs text-white cursor-pointer truncate shadow-sm
                      ${getTypeColor(holiday.type)} hover:opacity-80 transition-opacity
                    `}
                    title={`${holiday.name}${holiday.description ? ' - ' + holiday.description : ''}`}
                    onClick={() => onEditHoliday(holiday)}
                  >
                    {holiday.name}
                  </div>
                ))}
                {dayHolidays.length > 3 && (
                  <div className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md">
                    +{dayHolidays.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function HolidaysPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [filteredHolidays, setFilteredHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString())
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    type: 'public' as Holiday['type'],
    recurring: false
  })

  useEffect(() => {
    initializeData()
  }, [])

  useEffect(() => {
    filterHolidays()
  }, [holidays, searchTerm, typeFilter, yearFilter])

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
      
      console.log('👤 Found current user for Holidays:', user)
      
      if (user) {
        setCurrentUser(user)
        await loadHolidays(user.institution_id)
      }
    } catch (error) {
      console.error('Error initializing holidays data:', error)
      toast.error('Failed to load holidays data')
    } finally {
      setLoading(false)
    }
  }

  const loadHolidays = async (institutionId: string) => {
    try {
      console.log('Loading holidays for institution:', institutionId)
      
      const response = await fetch(`/api/holidays?institution_id=${institutionId}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch holidays')
      }
      
      console.log('Holidays loaded:', data.data?.length || 0)
      setHolidays(data.data || [])
    } catch (error) {
      console.error('Error loading holidays:', error)
      toast.error('Failed to load holidays')
    }
  }

  const filterHolidays = () => {
    let filtered = holidays

    if (searchTerm) {
      filtered = filtered.filter(holiday =>
        holiday.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (holiday.description && holiday.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(holiday => holiday.type === typeFilter)
    }

    if (yearFilter !== 'all') {
      filtered = filtered.filter(holiday => 
        new Date(holiday.start_date).getFullYear().toString() === yearFilter
      )
    }

    // Sort by start date
    filtered.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())

    setFilteredHolidays(filtered)
  }

  const handleAddHoliday = async () => {
    try {
      if (!formData.name.trim() || !formData.start_date || !formData.end_date) {
        toast.error('Please fill in all required fields')
        return
      }

      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        toast.error('End date must be after start date')
        return
      }

      if (!currentUser?.institution_id) {
        toast.error('Institution ID not found')
        return
      }

      const response = await fetch('/api/holidays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          institution_id: currentUser.institution_id,
          name: formData.name,
          description: formData.description,
          start_date: formData.start_date,
          end_date: formData.end_date,
          type: formData.type,
          recurring: formData.recurring,
          user_id: currentUser.id
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create holiday')
      }
      
      setHolidays([...holidays, data.data])
      setIsAddModalOpen(false)
      resetForm()
      toast.success('Holiday added successfully')
    } catch (error) {
      console.error('Error adding holiday:', error)
      toast.error('Failed to add holiday')
    }
  }

  const handleEditHoliday = async () => {
    try {
      if (!selectedHoliday || !formData.name.trim() || !formData.start_date || !formData.end_date) {
        toast.error('Please fill in all required fields')
        return
      }

      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        toast.error('End date must be after start date')
        return
      }

      const response = await fetch(`/api/holidays/${selectedHoliday.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          start_date: formData.start_date,
          end_date: formData.end_date,
          type: formData.type,
          recurring: formData.recurring
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update holiday')
      }
      
      const updatedHolidays = holidays.map(holiday =>
        holiday.id === selectedHoliday.id ? data.data : holiday
      )

      setHolidays(updatedHolidays)
      setIsEditModalOpen(false)
      setSelectedHoliday(null)
      resetForm()
      toast.success('Holiday updated successfully')
    } catch (error) {
      console.error('Error updating holiday:', error)
      toast.error('Failed to update holiday')
    }
  }

  const handleDeleteHoliday = async (holidayId: string) => {
    try {
      if (confirm('Are you sure you want to delete this holiday?')) {
        const response = await fetch(`/api/holidays/${holidayId}`, {
          method: 'DELETE'
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete holiday')
        }
        
        setHolidays(holidays.filter(holiday => holiday.id !== holidayId))
        toast.success('Holiday deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting holiday:', error)
      toast.error('Failed to delete holiday')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      type: 'public',
      recurring: false
    })
  }

  const openEditModal = (holiday: Holiday) => {
    setSelectedHoliday(holiday)
    setFormData({
      name: holiday.name,
      description: holiday.description || '',
      start_date: holiday.start_date,
      end_date: holiday.end_date,
      type: holiday.type,
      recurring: holiday.recurring
    })
    setIsEditModalOpen(true)
  }

  const getTypeColor = (type: string) => {
    const typeConfig = holidayTypes.find(t => t.value === type)
    switch (typeConfig?.color) {
      case 'blue': return 'bg-blue-100 text-blue-800'
      case 'green': return 'bg-green-100 text-green-800'
      case 'purple': return 'bg-purple-100 text-purple-800'
      case 'orange': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    if (startDate === endDate) {
      return formatDate(startDate)
    }
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const getDaysDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const getUpcomingHolidays = () => {
    const today = new Date()
    return holidays.filter(holiday => new Date(holiday.start_date) >= today)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, 3)
  }

  const getStats = () => {
    const currentYear = new Date().getFullYear()
    const currentYearHolidays = holidays.filter(h => 
      new Date(h.start_date).getFullYear() === currentYear
    )
    
    return {
      total: currentYearHolidays.length,
      upcoming: getUpcomingHolidays().length,
      public: currentYearHolidays.filter(h => h.type === 'public').length,
      school: currentYearHolidays.filter(h => h.type === 'school').length
    }
  }

  const stats = getStats()
  const upcomingHolidays = getUpcomingHolidays()
  const availableYears = [...new Set(holidays.map(h => new Date(h.start_date).getFullYear().toString()))].sort()

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Holiday Calendar</h1>
              <p className="text-gray-600 dark:text-purple-200/90">Manage institutional holidays and important dates</p>
            </div>
            <div className="mt-4 lg:mt-0 flex gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3 py-1 text-sm"
                >
                  <Grid3X3 className="w-4 h-4 mr-1" />
                  List
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="px-3 py-1 text-sm"
                >
                  <CalendarDays className="w-4 h-4 mr-1" />
                  Calendar
                </Button>
              </div>
              
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Holiday
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Holiday</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Holiday Name *</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., New Year's Day"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Brief description of the holiday"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date *</label>
                        <Input
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date *</label>
                        <Input
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Holiday Type</label>
                      <Select value={formData.type} onValueChange={(value: Holiday['type']) => setFormData({...formData, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {holidayTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="recurring"
                        checked={formData.recurring}
                        onChange={(e) => setFormData({...formData, recurring: e.target.checked})}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="recurring" className="text-sm text-gray-700 dark:text-gray-300">
                        Recurring holiday (annual)
                      </label>
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleAddHoliday} className="flex-1">
                        Add Holiday
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

        {/* Statistics & Upcoming */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statistics */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Holidays</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{stats.upcoming}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Flag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{stats.public}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Public</div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <School className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{stats.school}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">School</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Upcoming Holidays */}
          <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Upcoming Holidays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingHolidays.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                    No upcoming holidays
                  </p>
                ) : (
                  upcomingHolidays.map((holiday) => (
                    <div key={holiday.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {holiday.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDateRange(holiday.start_date, holiday.end_date)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search holidays..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <ChevronDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {holidayTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-32">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Holidays Display */}
        <Card className="bg-white border-0 shadow-lg dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Holiday Calendar
              <Badge variant="secondary" className="ml-auto">
                {filteredHolidays.length} holidays
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredHolidays.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No holidays found</p>
                </div>
              ) : viewMode === 'list' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredHolidays.map((holiday) => (
                    <div
                      key={holiday.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          <CalendarDays className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {holiday.name}
                            </div>
                            {holiday.recurring && (
                              <Badge variant="outline" className="text-xs">
                                Recurring
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {formatDateRange(holiday.start_date, holiday.end_date)} • 
                            {getDaysDuration(holiday.start_date, holiday.end_date)} day{getDaysDuration(holiday.start_date, holiday.end_date) !== 1 ? 's' : ''}
                          </div>
                          {holiday.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {holiday.description}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(holiday.type)}>
                          {holidayTypes.find(t => t.value === holiday.type)?.label}
                        </Badge>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditModal(holiday)}
                          className="p-2"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteHoliday(holiday.id)}
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Calendar View */
                <HolidayCalendarView holidays={holidays} onEditHoliday={openEditModal} onDeleteHoliday={handleDeleteHoliday} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Holiday</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Holiday Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., New Year's Day"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of the holiday"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date *</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date *</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Holiday Type</label>
              <Select value={formData.type} onValueChange={(value: Holiday['type']) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {holidayTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-recurring"
                checked={formData.recurring}
                onChange={(e) => setFormData({...formData, recurring: e.target.checked})}
                className="rounded border-gray-300"
              />
              <label htmlFor="edit-recurring" className="text-sm text-gray-700 dark:text-gray-300">
                Recurring holiday (annual)
              </label>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button onClick={handleEditHoliday} className="flex-1">
                Update Holiday
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
