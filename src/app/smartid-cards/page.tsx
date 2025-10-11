'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  AlertCircle, CheckCircle, Clock, CreditCard, Users, Zap, Wifi, WifiOff, Plus, Eye, Settings,
  Search, Filter, MoreHorizontal, Wallet, Activity, UserPlus, IdCard, UserCheck, DollarSign, TrendingUp, Shield,
  Ban, UserX
} from 'lucide-react'

interface SmartIDCard {
  id: string
  card_uid: string
  card_brand: string
  card_technology: 'rfid' | 'nfc'
  card_chip_type: string
  card_number?: string
  card_name?: string
  manufacturer: string
  uid_length: number
  is_active: boolean
  last_detected_at?: string
  detection_count: number
  created_at: string
  card_enrollments?: Array<{
    id: string
    enrollment_status: string
    enrollment_date: string
    users: {
      full_name: string
      employee_id: string
      email: string
    }
  }>
}

interface User {
  id: string
  full_name: string
  employee_id: string
  email: string
  phone: string
  institution_id: string
  status: string
  created_at: string
}

interface CardEnrollment {
  enrollment_id: string
  card_id: string
  card_uid: string
  card_brand: string
  card_technology: string
  card_chip_type: string
  card_number?: string
  user_name: string
  employee_id: string
  email: string
  institution_name: string
  access_level: string
  enrollment_status: string
  enrollment_date: string
  expiry_date?: string
  wallet_number?: string
  wallet_balance?: number
  wallet_status?: string
  last_detected_at?: string
  usage_count: number
}

interface AttendanceRecord {
  id: string
  user_name: string
  employee_id: string
  check_in_time?: string
  check_out_time?: string
  status: string
  card_uid: string
  reader_type: string
  institution_name: string
  verification_method: string
}

export default function SmartIDCardsPage() {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [cards, setCards] = useState<SmartIDCard[]>([])
  const [enrollments, setEnrollments] = useState<CardEnrollment[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [issueCardUid, setIssueCardUid] = useState('')
  const [selectedUserForCard, setSelectedUserForCard] = useState<User | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'detected' | 'not_detected' | 'error'>('idle')
  const [deviceStatus, setDeviceStatus] = useState<{
    connected: boolean
    status: string
    message: string
    checking: boolean
  }>({ connected: false, status: 'unknown', message: 'Checking device...', checking: true })
  const [verifyCardUid, setVerifyCardUid] = useState('')
  const [cardVerification, setCardVerification] = useState<{
    card_uid?: string
    user_id?: string
    user_name?: string
    employee_id?: string
    email?: string
    phone?: string
    job_title?: string
    department?: string
    status?: string
    card_number?: string
    enrollment_date?: string
    access_level?: string
    is_issued?: boolean
  } | null>(null)
  const [lastScanResult, setLastScanResult] = useState<{
    card_uid: string
    card_type?: string
    card_chip_type?: string
    uid_length?: number
    manufacturer?: string
  } | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)

  // Form states (removed unused register card states)

  // cardEnrollment state removed - enrollment handled directly in issueCardToUser

  useEffect(() => {
    loadUsers()
    loadSmartCards()
    checkDeviceStatus()
  }, [])

  const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }


  const loadUsers = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Get current user to determine institution_id
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        console.log('No authenticated user found')
        return
      }
      
      // Get user profile data
      const { data: currentUser } = await supabase
        .from('users')
        .select('*')
        .or(`auth_user_id.eq.${authUser.id},id.eq.${authUser.id}`)
        .single()
      
      if (currentUser?.institution_id) {
        // Load all users from the same institution
        const { data: institutionUsers, error } = await supabase
          .from('users')
          .select('id, full_name, employee_id, email, phone, institution_id, status, created_at')
          .eq('institution_id', currentUser.institution_id)
          .eq('status', 'active')
          .order('full_name')
        
        if (error) {
          console.error('Error loading users:', error)
          showMessage('Failed to load users', 'error')
        } else {
          console.log('✅ Setting users:', institutionUsers?.length || 0)
          setUsers(institutionUsers || [])
        }
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      showMessage('Failed to load users', 'error')
    }
  }

  const loadSmartCards = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Get current user to determine institution_id
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        console.log('No authenticated user found')
        return
      }
      
      // Get user profile data
      const { data: currentUser } = await supabase
        .from('users')
        .select('*')
        .or(`auth_user_id.eq.${authUser.id},id.eq.${authUser.id}`)
        .single()
      
      if (currentUser?.institution_id) {
          // Load enrollments and their related data separately to avoid relationship conflicts
          const { data: enrollmentData, error: enrollmentError } = await supabase
            .from('card_enrollments')
            .select(`
              id,
              card_id,
              user_id,
              enrollment_status,
              enrollment_date,
              access_level,
              usage_count,
              last_used_at
            `)
            .eq('institution_id', currentUser.institution_id)
            .in('enrollment_status', ['active', 'blocked', 'pending'])
            .order('enrollment_date', { ascending: false })
          
          if (enrollmentError) {
            console.error('Error loading enrollments:', enrollmentError)
            showMessage('Failed to load card enrollments', 'error')
          } else if (enrollmentData && enrollmentData.length > 0) {
            console.log('Card enrollments loaded:', enrollmentData.length)
            
            // Get card IDs and user IDs to fetch related data
            const cardIds = enrollmentData.map(e => e.card_id)
            const userIds = enrollmentData.map(e => e.user_id)
            
            // Fetch card data
            const { data: cardData } = await supabase
              .from('smartid_cards')
              .select('id, card_uid, card_brand, card_technology, card_chip_type, card_number, card_name, manufacturer')
              .in('id', cardIds)
            
            // Fetch user data 
            const { data: userData } = await supabase
              .from('users')
              .select('id, full_name, employee_id, email')
              .in('id', userIds)
            
            // Create lookup maps
            const cardMap = new Map(cardData?.map(card => [card.id, card]) || [])
            const userMap = new Map(userData?.map(user => [user.id, user]) || [])
            
            // Transform the enrollment data
            const transformedEnrollments = enrollmentData.map((enrollment: any) => {
              const card = cardMap.get(enrollment.card_id)
              const user = userMap.get(enrollment.user_id)
              
              return {
                enrollment_id: enrollment.id,
                card_id: enrollment.card_id,
                card_uid: card?.card_uid || 'N/A',
                card_brand: card?.card_brand || 'SmartID Card',
                card_technology: card?.card_technology || 'nfc',
                card_chip_type: card?.card_chip_type || 'unknown',
                card_number: card?.card_number || 'N/A',
                user_name: user?.full_name || 'Unknown User',
                employee_id: user?.employee_id || 'N/A',
                email: user?.email || 'N/A',
                institution_name: 'SMK Bukit Jelutong',
                access_level: enrollment.access_level || 'standard',
                enrollment_status: enrollment.enrollment_status || 'unknown',
                enrollment_date: enrollment.enrollment_date,
                wallet_balance: 0, // Will be loaded from wallet data if available
                wallet_status: 'active',
                last_detected_at: enrollment.last_used_at,
                usage_count: enrollment.usage_count || 0
              }
            })
            
            setEnrollments(transformedEnrollments)
          } else {
            console.log('No active card enrollments found')
            setEnrollments([])
          }
      }
    } catch (error) {
      console.error('Failed to load smart cards:', error)
      showMessage('Failed to load smart cards', 'error')
    }
  }

  const checkDeviceStatus = async () => {
    setDeviceStatus(prev => ({ ...prev, checking: true }))
    
    try {
      const response = await fetch('/api/rfid/status')
      const data = await response.json()
      
      setDeviceStatus({
        connected: data.connected,
        status: data.status,
        message: data.message,
        checking: false
      })
    } catch (error) {
      console.error('Failed to check device status:', error)
      setDeviceStatus({
        connected: false,
        status: 'error',
        message: 'Failed to check device status',
        checking: false
      })
    }
  }

  const scanCard = async (targetField: 'issue' | 'verify') => {
    setIsScanning(true)
    setScanStatus('scanning')
    
    try {
      showMessage('Place your card on the SmartID Card Reader...', 'info')
      
      // Call the card scanner API to get card UID
      const response = await fetch('/api/rfid/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timeout: 10000, // 10 second timeout
          reader_type: 'SmartID-Card-Reader' // SmartID Card Reader Device
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan card')
      }
      
      if (data.card_uid) {
        setScanStatus('detected')
        
        // Store scan result for later use
        setLastScanResult({
          card_uid: data.card_uid,
          card_type: data.card_type,
          card_chip_type: data.card_chip_type,
          uid_length: data.technical_data?.uid_length,
          manufacturer: data.manufacturer
        })
        
        // For verify, fetch the card number to display
        if (targetField === 'verify') {
          // Fetch card number from database
          const { createClient } = await import('@/lib/supabase/client')
          const supabase = createClient()
          const { data: cardData } = await supabase
            .from('smartid_cards')
            .select('card_number')
            .eq('card_uid', data.card_uid)
            .single()
          
          const displayValue = cardData?.card_number || data.card_uid
          setVerifyCardUid(displayValue)
          
          // Auto-verify the card after scanning
          setTimeout(() => verifyCard(displayValue), 1000)
        } else if (targetField === 'issue') {
          setIssueCardUid(data.card_uid)
        }
        
        showMessage(`✅ Card detected successfully! UID: ${data.card_uid} (${data.card_chip_type || 'unknown chip'})`, 'success')
        
        // Keep detected status for 2 seconds
        setTimeout(() => setScanStatus('idle'), 2000)
      } else {
        setScanStatus('not_detected')
        showMessage('❌ No card detected. Please place card on reader and try again.', 'error')
        
        // Reset to idle after 2 seconds
        setTimeout(() => setScanStatus('idle'), 2000)
      }
    } catch (error) {
      setScanStatus('error')
      console.error('Card scanning failed:', error)
      showMessage(`❌ Scanning failed: ${error}`, 'error')
      
      // Reset to idle after 3 seconds
      setTimeout(() => setScanStatus('idle'), 3000)
    } finally {
      setIsScanning(false)
    }
  }

  // registerCard function removed - cards are now only created when issued to users

  const simulateCardDetection = async (cardUid: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/smartid-cards/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'simulate_detection',
          card_uid: cardUid
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        showMessage(`Card detection simulated: ${data.action} for ${data.user.user_name}`, 'success')
        loadSmartCards() // Refresh cards data
      } else {
        showMessage(`Simulation failed: ${data.message}`, 'error')
      }
    } catch (error) {
      console.error('Simulation failed:', error)
      showMessage('Simulation failed: ' + error, 'error')
    } finally {
      setLoading(false)
    }
  }

  const blockCard = async (cardUid: string, shouldBlock: boolean) => {
    if (!confirm(`Are you sure you want to ${shouldBlock ? 'block' : 'unblock'} this card?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/smartid-cards/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'block_card',
          card_uid: cardUid,
          block: shouldBlock
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        showMessage(data.message, 'success')
        loadSmartCards() // Refresh cards data
      } else {
        showMessage(`Failed to ${shouldBlock ? 'block' : 'unblock'} card: ${data.error}`, 'error')
      }
    } catch (error) {
      console.error('Block/unblock card failed:', error)
      showMessage(`Failed to ${shouldBlock ? 'block' : 'unblock'} card: ` + error, 'error')
    } finally {
      setLoading(false)
    }
  }

  const unissueCard = async (cardUid: string) => {
    if (!confirm('Are you sure you want to unissue this card? The card will be removed from the user and can be reissued to someone else.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/smartid-cards/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'unissue_card',
          card_uid: cardUid
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        showMessage(data.message, 'success')
        loadSmartCards() // Refresh cards data
      } else {
        showMessage(`Failed to unissue card: ${data.error}`, 'error')
      }
    } catch (error) {
      console.error('Unissue card failed:', error)
      showMessage('Failed to unissue card: ' + error, 'error')
    } finally {
      setLoading(false)
    }
  }

  const repairCardEnrollment = async (cardId: string, cardUid: string) => {
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Get current user to determine institution_id
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const { data: currentUser } = await supabase
        .from('users')
        .select('institution_id')
        .or(`auth_user_id.eq.${authUser.id},id.eq.${authUser.id}`)
        .single()
      
      if (!currentUser?.institution_id) {
        console.error('Cannot repair: No institution_id found')
        return false
      }
      
      console.log('🔧 Attempting to repair card enrollment for card_id:', cardId)
      
      // Get the full card details to find intended user
      const { data: fullCardData } = await supabase
        .from('smartid_cards')
        .select('*')
        .eq('id', cardId)
        .single()
      
      console.log('📊 Full card data:', fullCardData)
      
      if (fullCardData?.card_name) {
        // Try to extract user name from card_name (e.g., "Card for John Doe")
        const nameMatch = fullCardData.card_name.match(/Card for (.+)/)
        if (nameMatch) {
          const userName = nameMatch[1]
          console.log('👤 Looking for user:', userName)
          
          // Find user by name
          const { data: userData } = await supabase
            .from('users')
            .select('id, full_name, employee_id')
            .ilike('full_name', `%${userName}%`)
            .eq('institution_id', currentUser.institution_id)
            .limit(5)
          
          console.log('🔍 Found matching users:', userData)
          
          if (userData && userData.length === 1) {
            // Exact match found, create enrollment
            const targetUser = userData[0]
            console.log('✅ Creating enrollment for user:', targetUser.full_name)
            
            const { data: newEnrollment, error: enrollError } = await supabase
              .from('card_enrollments')
              .insert({
                card_id: cardId,
                user_id: targetUser.id,
                institution_id: currentUser.institution_id,
                enrollment_status: 'active',
                enrolled_by: authUser.id,
                access_level: 'standard',
                enrollment_reason: 'Auto-repair: Missing enrollment created',
                enrollment_date: new Date().toISOString()
              })
              .select()
              .single()
            
            if (enrollError) {
              console.error('🚀 Repair failed:', enrollError)
              return false
            } else {
              console.log('✨ Repair successful! Enrollment created:', newEnrollment)
              showMessage(`✅ Card repaired! Now issued to ${targetUser.full_name}`, 'success')
              return true
            }
          } else if (userData && userData.length > 1) {
            console.log('⚠️ Multiple users found. Manual selection needed.')
            showMessage(`Multiple users match "${userName}". Please re-issue card manually.`, 'error')
            return false
          } else {
            console.log('🙅 No user found matching:', userName)
            showMessage(`No user found matching "${userName}". Card may need to be re-issued.`, 'error')
            return false
          }
        }
      }
      
      console.log('🚨 Card needs manual enrollment repair!')
      console.log('Card ID:', cardId)
      console.log('Card UID:', cardUid)
      console.log('Institution ID:', currentUser.institution_id)
      showMessage('Card found but not issued to any user. It may need to be re-issued.', 'info')
      
      return false
      
    } catch (error) {
      console.error('Repair failed:', error)
      return false
    }
  }

  const verifyCard = async (cardIdentifier?: string) => {
    const identifierToVerify = cardIdentifier || verifyCardUid
    if (!identifierToVerify) {
      showMessage('Please enter a card number or scan a card', 'error')
      return
    }

    setLoading(true)
    setCardVerification(null)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Check if input is a card number (SID-YYYY-XXXXX) or UID
      const isCardNumber = identifierToVerify.startsWith('SID-')
      
      console.log('🔍 Verifying card:', identifierToVerify, '(Type:', isCardNumber ? 'Card Number' : 'UID', ')')
      
      // Query by card_number or card_uid depending on input format
      const { data: allCards, error: cardError } = await supabase
        .from('smartid_cards')
        .select('id, card_uid, card_number, card_brand, is_active, created_at')
        .or(isCardNumber ? `card_number.eq.${identifierToVerify}` : `card_uid.eq.${identifierToVerify}`)
        .order('created_at', { ascending: true }) // Oldest first
      
      console.log('📊 All cards with this UID:', allCards)
      console.log('📊 Card query error:', cardError)
      
      if (cardError || !allCards || allCards.length === 0) {
        setCardVerification({
          card_uid: identifierToVerify,
          is_issued: false,
          status: 'Unknown Card'
        })
        showMessage('Card not found in system', 'error')
        return
      }
      
      // Get the actual UID from the first card found (needed for API call)
      const cardUid = allCards[0].card_uid
      
      // If multiple cards exist, warn about duplicates
      if (allCards.length > 1) {
        console.log(`⚠️ Multiple cards found:`, allCards.map(c => c.card_number || c.id))
      }
      
      // Skip client-side enrollment checks (RLS blocks them)
      // Use service role API directly to find which card has enrollments
      console.log('🔑 Using service role API to check enrollments (bypassing RLS)...')
      
      // Use API to check with service role (bypasses RLS)
      // The API requires the UID format
      const serviceResponse = await fetch('/api/debug/card-enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          card_uid: cardUid
        })
      })
      
      const serviceData = await serviceResponse.json()
      console.log('🔑 Service role query result:', serviceData)
      console.log('📈 All cards found:', serviceData.debug_info?.all_cards)
      console.log('📈 Enrollments found:', serviceData.enrollment_count)
      
      // Check if service role found enrollments
      if (serviceData.success && serviceData.enrollment_count > 0) {
        console.log('✅ Service role found enrollments!')
        const enrollment = serviceData.enrollments[0]
        const cardNumber = serviceData.card_data?.card_number || uidToVerify
        
        console.log('📊 Enrollment data:', enrollment)
        
        // Check if user data is included (from relation query)
        let userData = enrollment.users
        
        // If no user data from relation, fetch it separately
        if (!userData && enrollment.user_id) {
          console.log('🔍 User data not in enrollment, fetching separately...')
          const { data: userDataFetch } = await supabase
            .from('users')
            .select('id, full_name, employee_id, email, phone, job_title, department, ic_number')
            .eq('id', enrollment.user_id)
            .single()
          
          if (userDataFetch) {
            console.log('✅ Fetched user data:', userDataFetch)
            console.log('🆔 IC Number from fetch:', userDataFetch.ic_number)
            userData = userDataFetch
          } else {
            console.log('⚠️ Could not fetch user data')
          }
        }
        
        console.log('📊 Final userData:', userData)
        console.log('🆔 IC Number to be saved:', userData?.ic_number)
        
        // Use service role data
        const isCurrentlyIssued = ['active', 'blocked', 'pending'].includes(enrollment.enrollment_status)
        
        setCardVerification({
          card_uid: cardUid,
          card_number: cardNumber,
          user_id: userData?.id || enrollment.user_id,
          user_name: userData?.full_name || 'Unknown User',
          employee_id: userData?.employee_id || 'N/A',
          ic_number: userData?.ic_number,
          email: userData?.email,
          phone: userData?.phone,
          job_title: userData?.job_title,
          department: userData?.department,
          status: enrollment.enrollment_status,
          enrollment_date: enrollment.enrollment_date,
          access_level: enrollment.access_level,
          is_issued: isCurrentlyIssued
        })
        
        if (isCurrentlyIssued) {
          showMessage(`✅ Card verified: Issued to ${userData?.full_name || 'Unknown User'} (${enrollment.enrollment_status})`, 'success')
        } else {
          showMessage(`Card was previously issued to ${userData?.full_name || 'Unknown User'} but is now ${enrollment.enrollment_status}`, 'info')
        }
      } else if (serviceData.success && serviceData.enrollment_count === 0) {
        // Card exists but has NO enrollments
        console.log('❗ Card exists but has NO enrollments')
        const cardNumber = serviceData.card_data?.card_number || identifierToVerify
        
        setCardVerification({
          card_uid: cardUid,
          card_number: cardNumber,
          is_issued: false,
          status: 'Card Available'
        })
        
        showMessage('Card found but not issued to any user', 'info')
      } else {
        // API call failed
        console.error('❌ Service role API failed:', serviceData)
        setCardVerification({
          card_uid: cardUid,
          is_issued: false,
          status: 'Verification Failed'
        })
        showMessage('Card verification failed. Please try again.', 'error')
      }
    } catch (error) {
      console.error('Card verification failed:', error)
      showMessage('Card verification failed: ' + error, 'error')
    } finally {
      setLoading(false)
    }
  }

  const getTechnologyIcon = (technology: string) => {
    return technology === 'rfid' ? <Zap className="h-4 w-4" /> : <Wifi className="h-4 w-4" />
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleTimeString()
  }


  // Calculate stats
  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const activeCards = enrollments.filter(e => e.enrollment_status === 'active').length
  const pendingCards = enrollments.filter(e => e.enrollment_status === 'pending').length
  const blockedCards = enrollments.filter(e => e.enrollment_status === 'blocked').length
  const totalUsers = users.length
  const totalBalance = enrollments.reduce((sum, card) => sum + (card.wallet_balance || 0), 0)
  const totalTransactions = enrollments.reduce((sum, card) => sum + card.usage_count, 0)
  const totalCards = cards.length // Total cards in system
  const cardsIssued = enrollments.filter(e => ['active', 'blocked', 'pending'].includes(e.enrollment_status)).length
  const availableStock = totalCards - cardsIssued

  const issueCardToUser = async () => {
    if (!issueCardUid || !selectedUserForCard) {
      showMessage('Please enter a card UID', 'error')
      return
    }
    
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      
      // Get current user to determine institution_id
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        showMessage('Authentication required', 'error')
        return
      }
      
      // Get user profile data to get institution_id
      const { data: currentUser } = await supabase
        .from('users')
        .select('institution_id')
        .or(`auth_user_id.eq.${authUser.id},id.eq.${authUser.id}`)
        .single()
      
      if (!currentUser?.institution_id) {
        showMessage('Institution information not found. Please contact support.', 'error')
        return
      }
      
      // Generate card number from card UID: SID-{UID}
      const cardNumber = `SID-${issueCardUid}`
      
      // Use detected card info from scan result if available
      const detectedCardType = lastScanResult?.card_type || 'nfc'
      const detectedChipType = lastScanResult?.card_chip_type || 'unknown'
      const detectedUidLength = lastScanResult?.uid_length || issueCardUid.length / 2
      const detectedManufacturer = lastScanResult?.manufacturer || 'Unknown'
      
      // Check if card already exists
      const { data: existingCard } = await supabase
        .from('smartid_cards')
        .select('*')
        .eq('card_uid', issueCardUid)
        .single()
      
      let cardData = existingCard
      
      if (!existingCard) {
        // Insert NEW card into smartid_cards table
        console.log('🆕 Creating new card record for UID:', issueCardUid)
        const { data: newCard, error: insertError } = await supabase
          .from('smartid_cards')
          .insert({
            card_uid: issueCardUid,
            card_brand: 'SmartID Card',
            card_technology: detectedCardType,
            card_chip_type: detectedChipType,
            card_number: cardNumber,
            card_name: `Card for ${selectedUserForCard.full_name}`,
            manufacturer: detectedManufacturer,
            uid_length: detectedUidLength,
            is_active: true,
            institution_id: currentUser.institution_id
          })
          .select()
          .single()
        
        if (insertError) {
          console.error('Card creation failed:', insertError)
          showMessage(`Card creation failed: ${insertError.message}`, 'error')
          return
        }
        cardData = newCard
      } else {
        // Card already exists, use it
        console.log('✅ Using existing card record:', existingCard.id)
        // Update card_number if it's in old format
        if (!existingCard.card_number || !existingCard.card_number.includes(issueCardUid)) {
          console.log('🔄 Updating card_number to new format')
          const { data: updated } = await supabase
            .from('smartid_cards')
            .update({ card_number: cardNumber })
            .eq('id', existingCard.id)
            .select()
            .single()
          cardData = updated || existingCard
        }
      }
      
      const newCardData = cardData
      const error = null
      
      if (error) {
        console.error('Card issuance failed:', error)
        showMessage(`Card issuance failed: ${error.message}`, 'error')
      } else if (newCardData) {
        // Now create an enrollment record to link the card to the user
        const { error: enrollmentError } = await supabase
          .from('card_enrollments')
          .insert({
            card_id: newCardData.id,
            user_id: selectedUserForCard.id,
            institution_id: currentUser.institution_id, // Required field
            enrollment_status: 'active',
            enrolled_by: authUser.id,
            access_level: 'standard',
            enrollment_reason: `Card ${cardNumber} issued to ${selectedUserForCard.full_name}`
          })
        
        if (enrollmentError) {
          console.warn('Card created but enrollment failed:', enrollmentError)
          showMessage(`Card created but enrollment failed: ${enrollmentError.message}. Please manually enroll the card.`, 'error')
        } else {
          showMessage(`✅ Card ${cardNumber} (UID: ${issueCardUid}) issued successfully to ${selectedUserForCard.full_name}!`, 'success')
        }
        
        setIssueCardUid('')
        setSelectedUserForCard(null)
        setLastScanResult(null)
        loadSmartCards()
      }
    } catch (error) {
      console.error('Card issuance failed:', error)
      showMessage('Card issuance failed: ' + error, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Gradient Header */}
        <div className="rounded-2xl p-8 border-0 shadow-lg header-card">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">smartID Card Management</h1>
              <p className="text-gray-600 dark:text-purple-200/90">SMK Bukit Jelutong • Monitor card issuance, eWallet balances, and transaction activities</p>
            </div>
            <div className="flex gap-6 mt-4 lg:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeCards}</div>
                <div className="text-sm text-gray-500 dark:text-purple-200/70">Active Cards</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">RM {totalBalance.toFixed(2)}</div>
                <div className="text-sm text-gray-500 dark:text-purple-200/70">Total Balance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 flex items-center gap-2 ${
            messageType === 'error' ? 'bg-red-50 border-red-500 text-red-800' : 
            messageType === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 
            'bg-blue-50 border-blue-500 text-blue-800'
          }`}>
            <AlertCircle className="h-4 w-4" />
            <span>{message}</span>
          </div>
        )}


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-gray-800 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Total Users</p>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100">Active Cards</p>
                  <p className="text-2xl font-bold">{activeCards}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-100">Pending</p>
                  <p className="text-2xl font-bold">{pendingCards}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-100">Blocked</p>
                  <p className="text-2xl font-bold">{blockedCards}</p>
                </div>
                <Shield className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">Total Balance</p>
                  <p className="text-2xl font-bold">RM {totalBalance.toFixed(2)}</p>
                </div>
                <Wallet className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-100">Access Events</p>
                  <p className="text-2xl font-bold">{totalTransactions}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Cards</p>
                  <p className="text-2xl font-bold">{totalCards}</p>
                </div>
                <IdCard className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cards Issued</p>
                  <p className="text-2xl font-bold text-blue-600">{cardsIssued}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Available Stock</p>
                  <p className="text-2xl font-bold text-green-600">{availableStock}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - SmartID NFC Card Records */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>SmartID Card Records</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {/* Cards are now only enrolled when issued to users */}
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, ID, or Card ID"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Card Records Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">User</th>
                        <th className="text-left py-2">Card ID</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Balance</th>
                        <th className="text-left py-2">Access Events</th>
                        <th className="text-left py-2">Last Used</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.length > 0 ? (
                        enrollments.map((enrollment) => (
                          <tr key={enrollment.enrollment_id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="font-medium flex items-center gap-1">
                                    {enrollment.user_name}
                                    <button 
                                      onClick={() => {
                                        const user = users.find(u => u.employee_id === enrollment.employee_id)
                                        if (user) {
                                          setSelectedUser(user)
                                          setShowUserDialog(true)
                                        }
                                      }}
                                      className="hover:scale-110 transition-transform cursor-pointer"
                                      title="View full profile"
                                    >
                                      <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                    </button>
                                  </div>
                                  <div className="text-gray-500 text-xs">{enrollment.employee_id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                {enrollment.card_technology === 'rfid' ? (
                                  <Zap className="h-4 w-4 text-purple-500" />
                                ) : (
                                  <Wifi className="h-4 w-4 text-blue-500" />
                                )}
                                <span className="font-mono text-xs">{enrollment.card_number || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <Badge variant="outline" className={`${
                                enrollment.enrollment_status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                                enrollment.enrollment_status === 'blocked' ? 'bg-red-50 text-red-700 border-red-200' :
                                enrollment.enrollment_status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-gray-50 text-gray-700 border-gray-200'
                              }`}>
                                {enrollment.enrollment_status === 'active' ? 'Active' :
                                 enrollment.enrollment_status === 'blocked' ? 'Blocked' :
                                 enrollment.enrollment_status === 'pending' ? 'Pending' :
                                 enrollment.enrollment_status ? enrollment.enrollment_status.charAt(0).toUpperCase() + enrollment.enrollment_status.slice(1) : 'Unknown'}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <span className="font-semibold text-blue-600">
                                RM {(enrollment.wallet_balance || 0).toFixed(2)}
                              </span>
                            </td>
                            <td className="py-3">{enrollment.usage_count}</td>
                            <td className="py-3">
                              <span className="text-gray-500 text-xs">
                                {enrollment.enrollment_date ? 
                                  new Date(enrollment.enrollment_date).toLocaleDateString() : '-'
                                }
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => simulateCardDetection(enrollment.card_uid)}
                                  disabled={loading}
                                  title="Test Card Detection"
                                >
                                  <Activity className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => blockCard(enrollment.card_uid, enrollment.enrollment_status === 'active')}
                                  disabled={loading}
                                  className={`${
                                    enrollment.enrollment_status === 'blocked' ? 'bg-green-50 hover:bg-green-100 text-green-700' : 'bg-red-50 hover:bg-red-100 text-red-700'
                                  }`}
                                  title={enrollment.enrollment_status === 'blocked' ? 'Unblock Card' : 'Block Card'}
                                >
                                  <Ban className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => unissueCard(enrollment.card_uid)}
                                  disabled={loading}
                                  className="bg-orange-50 hover:bg-orange-100 text-orange-700"
                                  title="Unissue Card"
                                >
                                  <UserX className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-500">
No cards issued yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Recent Activity & Issue Cards */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  ⚡ Recent Activity
                </CardTitle>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enrollments.slice(0, 5).map((enrollment) => (
                    <div key={enrollment.enrollment_id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-slate-700">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{enrollment.user_name}</div>
                        <div className="text-xs text-gray-500">Card issued</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(enrollment.enrollment_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  
                  {enrollments.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No recent activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Issue Card to Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Issue Card to Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search Users */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Users List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredUsers.map((user) => {
                      const hasCard = enrollments.some(e => e.employee_id === user.employee_id)
                      
                      return (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{user.full_name}</div>
                            <div className="text-xs text-gray-500">{user.employee_id}</div>
                          </div>
                          <div>
                            {hasCard ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Card Active
                              </Badge>
                            ) : (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={() => setSelectedUserForCard(user)}
                                  >
                                    Issue Card
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Issue Card to {user.full_name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                                      <div className="text-sm text-gray-900 dark:text-slate-100">
                                        <p><strong>Name:</strong> {user.full_name}</p>
                                        <p><strong>Employee ID:</strong> {user.employee_id}</p>
                                        <p><strong>Email:</strong> {user.email}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor="issue_card_uid">Card UID *</Label>
                                      <div className="flex gap-2">
                                        <Input
                                          id="issue_card_uid"
                                          placeholder="Scan a card to populate UID automatically"
                                          value={issueCardUid}
                                          required
                                          readOnly
                                          className="flex-1 bg-gray-50 dark:bg-gray-800 cursor-not-allowed font-mono"
                                        />
                                        <Button 
                                          type="button"
                                          variant={scanStatus === 'detected' ? 'default' : scanStatus === 'error' || scanStatus === 'not_detected' ? 'destructive' : 'outline'}
                                          onClick={() => scanCard('issue')}
                                          disabled={isScanning || loading || !deviceStatus.connected}
                                          className={`px-3 transition-all duration-300 ${
                                            scanStatus === 'scanning' ? 'animate-pulse bg-blue-500/20 border-blue-400' :
                                            scanStatus === 'detected' ? 'bg-green-500 hover:bg-green-600 text-white border-green-500' :
                                            scanStatus === 'not_detected' ? 'bg-red-500/20 border-red-400 text-red-700' :
                                            scanStatus === 'error' ? 'bg-red-500/20 border-red-400 text-red-700' :
                                            'hover:bg-gray-50'
                                          }`}
                                        >
                                          {scanStatus === 'scanning' ? (
                                            <div className="flex items-center gap-1">
                                              <div className="relative">
                                                <div className="w-3 h-3 border-2 border-blue-300 rounded-full animate-spin border-t-blue-600" />
                                                <div className="absolute inset-0 w-3 h-3 border border-blue-200 rounded-full animate-ping" />
                                              </div>
                                              <span className="text-xs font-medium">Scanning...</span>
                                            </div>
                                          ) : scanStatus === 'detected' ? (
                                            <div className="flex items-center gap-1">
                                              <CheckCircle className="w-3 h-3 animate-bounce" />
                                              <span className="text-xs font-medium">Detected!</span>
                                            </div>
                                          ) : scanStatus === 'not_detected' ? (
                                            <div className="flex items-center gap-1">
                                              <AlertCircle className="w-3 h-3" />
                                              <span className="text-xs font-medium">No Card</span>
                                            </div>
                                          ) : scanStatus === 'error' ? (
                                            <div className="flex items-center gap-1">
                                              <AlertCircle className="w-3 h-3" />
                                              <span className="text-xs font-medium">Error</span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center gap-1">
                                              <Zap className="w-3 h-3" />
                                              <span className="text-xs font-medium">Scan</span>
                                            </div>
                                          )}
                                        </Button>
                                      </div>
                                      <div className="mt-2">
                                        {/* Device Status Indicator */}
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium mb-2 ${
                                          deviceStatus.checking ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
                                          deviceStatus.connected ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' :
                                          'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                                        }`}>
                                          {deviceStatus.checking ? (
                                            <>
                                              <div className="w-3 h-3 border border-gray-400 rounded-full animate-spin border-t-transparent" />
                                              <span>Checking device...</span>
                                            </>
                                          ) : deviceStatus.connected ? (
                                            <>
                                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                              <span>SmartID Card Reader Device Connected</span>
                                            </>
                                          ) : (
                                            <>
                                              <div className="w-2 h-2 bg-red-500 rounded-full" />
                                              <span>Device Disconnected</span>
                                              <button
                                                onClick={checkDeviceStatus}
                                                className="ml-1 underline hover:no-underline"
                                                disabled={deviceStatus.checking}
                                              >
                                                Retry
                                              </button>
                                            </>
                                          )}
                                        </div>
                                        
                                        <p className="text-xs text-gray-500">
                                          Place card on SmartID Card Reader and click Scan to read UID
                                        </p>
                                        
                                        {/* Visual Status Indicator */}
                                        {scanStatus !== 'idle' && (
                                          <div className={`mt-2 p-2 rounded-lg border transition-all duration-300 ${
                                            scanStatus === 'scanning' ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800' :
                                            scanStatus === 'detected' ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' :
                                            scanStatus === 'not_detected' ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800' :
                                            scanStatus === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800' :
                                            ''
                                          }`}>
                                            <div className="flex items-center gap-2">
                                              {scanStatus === 'scanning' && (
                                                <>
                                                  <div className="relative">
                                                    <div className="w-4 h-4 border-2 border-blue-300 rounded-full animate-spin border-t-blue-600" />
                                                    <div className="absolute inset-0 w-4 h-4 border border-blue-200 rounded-full animate-ping" />
                                                  </div>
                                                  <div>
                                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Scanning for card...</p>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400">Please place your card on the RFID reader</p>
                                                  </div>
                                                </>
                                              )}
                                              {scanStatus === 'detected' && (
                                                <>
                                                  <CheckCircle className="w-4 h-4 text-green-600 animate-bounce" />
                                                  <div>
                                                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Card detected successfully!</p>
                                                    <p className="text-xs text-green-600 dark:text-green-400">UID has been captured</p>
                                                  </div>
                                                </>
                                              )}
                                              {scanStatus === 'not_detected' && (
                                                <>
                                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                                  <div>
                                                    <p className="text-sm font-medium text-red-700 dark:text-red-300">No card detected</p>
                                                    <p className="text-xs text-red-600 dark:text-red-400">Make sure the card is placed correctly on the reader</p>
                                                  </div>
                                                </>
                                              )}
                                              {scanStatus === 'error' && (
                                                <>
                                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                                  <div>
                                                    <p className="text-sm font-medium text-red-700 dark:text-red-300">Scanning error</p>
                                                    <p className="text-xs text-red-600 dark:text-red-400">Please check reader connection and try again</p>
                                                  </div>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-end gap-2">
                                      <Button type="button" variant="outline" onClick={() => {
                                        setIssueCardUid('')
                                        setSelectedUserForCard(null)
                                        setLastScanResult(null)
                                      }}>
                                        Cancel
                                      </Button>
                                      <Button disabled={loading} onClick={issueCardToUser}>
                                        {loading ? 'Issuing...' : 'Issue Card'}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No users found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Verify Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="verify_card_uid">Card Number / Scan Card *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="verify_card_uid"
                        placeholder="Enter card number or scan card →"
                        value={verifyCardUid}
                        onChange={(e) => setVerifyCardUid(e.target.value.toUpperCase())}
                        className="flex-1 font-mono"
                      />
                      <Button 
                        type="button"
                        variant={scanStatus === 'detected' ? 'default' : scanStatus === 'error' || scanStatus === 'not_detected' ? 'destructive' : 'outline'}
                        onClick={() => scanCard('verify')}
                        disabled={isScanning || loading || !deviceStatus.connected}
                        className={`px-3 transition-all duration-300 ${
                          scanStatus === 'scanning' ? 'animate-pulse bg-blue-500/20 border-blue-400' :
                          scanStatus === 'detected' ? 'bg-green-500 hover:bg-green-600 text-white border-green-500' :
                          scanStatus === 'not_detected' ? 'bg-red-500/20 border-red-400 text-red-700' :
                          scanStatus === 'error' ? 'bg-red-500/20 border-red-400 text-red-700' :
                          'hover:bg-gray-50'
                        }`}
                      >
                        {scanStatus === 'scanning' ? (
                          <div className="flex items-center gap-1">
                            <div className="relative">
                              <div className="w-3 h-3 border-2 border-blue-300 rounded-full animate-spin border-t-blue-600" />
                            </div>
                            <span className="text-xs font-medium">Scan</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            <span className="text-xs font-medium">Scan</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={() => verifyCard()}
                    disabled={loading || !verifyCardUid}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white dark:from-green-600 dark:to-emerald-700 dark:hover:from-green-700 dark:hover:to-emerald-800"
                  >
                    {loading ? 'Verifying...' : 'Verify Card'}
                  </Button>

                  {/* Verification Result */}
                  {cardVerification && (
                    <div className={`p-4 rounded-lg border ${
                      cardVerification.is_issued 
                        ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' 
                        : 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className={`h-4 w-4 ${
                          cardVerification.is_issued ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
                        }`} />
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {cardVerification.is_issued ? 'Card Issued' : 'Card Available'}
                        </span>
                      </div>
                      <div className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                        <div><strong>Card Number:</strong> {cardVerification.card_number || 'N/A'}</div>
                        <div><strong>Status:</strong> {cardVerification.status}</div>
                        {cardVerification.is_issued && (
                          <>
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                              <div className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">User Details:</div>
                              <div className="flex items-center gap-1">
                                <strong>Name:</strong> 
                                <span className="ml-1">{cardVerification.user_name}</span>
                                <button 
                                  onClick={() => {
                                    if (cardVerification.user_id) {
                                      const user = users.find(u => u.id === cardVerification.user_id)
                                      if (user) {
                                        setSelectedUser(user)
                                        setShowUserDialog(true)
                                      }
                                    }
                                  }}
                                  className="hover:scale-110 transition-transform cursor-pointer"
                                  title="View full profile"
                                >
                                  <Eye className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                </button>
                              </div>
                              <div><strong>Employee ID:</strong> {cardVerification.employee_id}</div>
                              {cardVerification.ic_number && (
                                <div><strong>IC Number:</strong> {cardVerification.ic_number}</div>
                              )}
                              {cardVerification.email && (
                                <div><strong>Email:</strong> {cardVerification.email}</div>
                              )}
                              {cardVerification.phone && (
                                <div><strong>Phone:</strong> {cardVerification.phone}</div>
                              )}
                              {cardVerification.job_title && (
                                <div><strong>Job Title:</strong> {cardVerification.job_title}</div>
                              )}
                              {cardVerification.department && (
                                <div><strong>Department:</strong> {cardVerification.department}</div>
                              )}
                              {cardVerification.access_level && (
                                <div><strong>Access Level:</strong> {cardVerification.access_level}</div>
                              )}
                              {cardVerification.enrollment_date && (
                                <div><strong>Issued on:</strong> {new Date(cardVerification.enrollment_date).toLocaleDateString()}</div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* User Profile Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Profile
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</span>
                    <div className="text-sm text-gray-900 dark:text-gray-100">{selectedUser.full_name}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Employee ID</span>
                    <div className="text-sm font-mono text-gray-900 dark:text-gray-100">{selectedUser.employee_id}</div>
                  </div>
                  {selectedUser.ic_number && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">IC Number</span>
                      <div className="text-sm font-mono text-gray-900 dark:text-gray-100">{selectedUser.ic_number}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</span>
                    <div className="text-sm text-gray-900 dark:text-gray-100">{selectedUser.email}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</span>
                    <div className="text-sm text-gray-900 dark:text-gray-100">{selectedUser.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</span>
                    <div className="text-sm">
                      <Badge variant={selectedUser.status === 'active' ? 'default' : 'secondary'}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Created</span>
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Information */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Card Information</h3>
                {(() => {
                  const userCard = enrollments.find(e => e.employee_id === selectedUser.employee_id)
                  if (userCard) {
                    return (
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><strong>Card Number:</strong> {userCard.card_number}</div>
                          <div><strong>Status:</strong> 
                            <Badge variant="outline" className={`ml-1 ${
                              userCard.enrollment_status === 'active' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400' :
                              userCard.enrollment_status === 'blocked' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400' :
                              'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400'
                            }`}>
                              {userCard.enrollment_status}
                            </Badge>
                          </div>
                          <div><strong>Technology:</strong> {userCard.card_technology?.toUpperCase()}</div>
                          <div><strong>Balance:</strong> RM {(userCard.wallet_balance || 0).toFixed(2)}</div>
                          <div><strong>Access Events:</strong> {userCard.usage_count}</div>
                        </div>
                      </div>
                    )
                  } else {
                    return (
                      <div className="text-sm text-gray-500 italic">No card issued to this user</div>
                    )
                  }
                })()}
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowUserDialog(false)}>
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

