'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/database'

type UserRole = 'superadmin' | 'admin' | 'hr_manager' | 'teacher' | 'staff' | 'student'

interface UserProfile {
  id: string
  full_name: string
  email: string
  role: UserRole
  institution_id: string | null
  employee_id: string
  avatar_url?: string
  subscription_plan?: 'free' | 'premium'
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<{ error: any }>
  signOut: () => Promise<void>
  hasRole: (roles: UserRole | UserRole[]) => boolean
  hasPremiumAccess: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout
    
    const initAuth = async () => {
      try {
        console.log('🔄 Initializing auth...')
        setLoading(true)
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.log('⏰ Auth initialization timeout')
            setLoading(false)
          }
        }, 10000) // 10 second timeout
        
        // Get session with better error handling
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Session error:', error)
          if (mounted) {
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }
        
        console.log('👤 Session:', session ? 'Found' : 'None')
        
        if (mounted) {
          console.log('👤 Session user:', session?.user?.email)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            console.log('📝 Fetching profile for user:', session.user.id, session.user.email)
            await fetchUserProfile(session.user.id)
          } else {
            console.log('⚠️ No session found')
            setProfile(null)
          }
          
          clearTimeout(timeoutId)
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ Auth init error:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, session ? 'user present' : 'no user')
        if (mounted) {
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchUserProfile(session.user.id)
          } else {
            setProfile(null)
          }
        }
      }
    )

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId)
      
      // First try simple query without joins
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      console.log('📊 User query result:', { userData, userError })

      if (userError && userError.code !== 'PGRST116') {
        console.error('❌ Error fetching user profile:', userError)
        setProfile(null)
        return
      }

      if (userData) {
        console.log('✅ User found:', userData.full_name)
        
        // Get institution data separately if needed
        let subscriptionPlan = 'free'
        if (userData.institution_id) {
          try {
            const { data: instData } = await supabase
              .from('institutions')
              .select('subscription_plan')
              .eq('id', userData.institution_id)
              .single()
            
            subscriptionPlan = instData?.subscription_plan || 'free'
          } catch (instError) {
            console.warn('⚠️ Could not fetch institution data:', instError)
          }
        }
        
        // User profile exists
        setProfile({
          id: userData.id,
          full_name: userData.full_name,
          email: userData.email,
          role: (userData.smartid_hub_role || userData.primary_role) as UserRole,
          institution_id: userData.institution_id,
          employee_id: userData.employee_id,
          avatar_url: userData.avatar_url,
          subscription_plan: subscriptionPlan as 'free' | 'premium'
        })
      } else {
        console.log('⚠️ User profile not found - creating basic profile')
        // Create a basic profile from user auth data
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setProfile({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            role: 'admin' as UserRole,
            institution_id: null,
            employee_id: `TMP${Date.now()}`,
            subscription_plan: 'free'
          })
        } else {
          setProfile(null)
        }
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error)
      setProfile(null)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (!error && data.user) {
      // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            full_name: userData.full_name || '',
            primary_role: userData.role || 'student',
            smartid_hub_role: userData.role || 'student',
            institution_id: userData.institution_id,
            employee_id: userData.employee_id || `EMP${Date.now()}`
          })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        return { error: profileError }
      }
    }

    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!profile) return false
    const allowedRoles = Array.isArray(roles) ? roles : [roles]
    return allowedRoles.includes(profile.role)
  }

  const hasPremiumAccess = (): boolean => {
    return profile?.subscription_plan === 'premium'
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    hasPremiumAccess
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
