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
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user profile
  const loadProfile = async (user: User) => {
    try {
      console.log('🔍 Loading profile for:', user.email)
      
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()
      
      if (error) {
        if (error.code !== 'PGRST116') { // Not found
          console.error('❌ Profile load error:', error)
          return
        }
        
        // Create basic profile if not found
        console.log('⚠️ No profile found, creating basic profile')
        const basicProfile = {
          id: user.id,
          auth_user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: 'admin' as UserRole,
          primary_role: 'admin',
          smartid_time_role: 'admin',
          institution_id: null,
          employee_id: `TMP${Date.now()}`,
          primary_system: 'time_web',
          ic_number: '0000000000000',
          phone: '0000000000'
        }
        
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert(basicProfile)
          .select()
          .single()
        
        if (createError) {
          console.error('❌ Failed to create profile:', createError)
          return
        }
        
        data = newProfile
      }
      
      if (data) {
        const role = data.smartid_time_role || data.primary_role || 'admin'
        const subscriptionPlan = 'free' // Default to free plan
        
        setProfile({
          id: data.id,
          full_name: data.full_name || user.email?.split('@')[0] || 'User',
          email: data.email || user.email || '',
          role: role as UserRole,
          institution_id: data.institution_id,
          employee_id: data.employee_id || `EMP${Date.now()}`,
          subscription_plan: subscriptionPlan
        })
      }
    } catch (error) {
      console.error('❌ Profile load failed:', error)
      setProfile(null)
    }
  }

  // Handle auth state and session management
  useEffect(() => {
    let mounted = true

    console.log('🔐 Setting up auth state management')
    
    // Initial session check
    const checkSession = async () => {
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        console.log('📍 Session check:', session ? 'active' : 'none')
        
        if (session?.user && mounted) {
          console.log('👤 Initial session user:', session.user.email)
          setUser(session.user)
          // Fetch profile in background to avoid blocking UI
          loadProfile(session.user).catch(err => console.warn('Profile load (initial) error:', err))
        }
      } catch (error) {
        console.error('❌ Session check failed:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('🔄 Auth event:', event, session?.user?.email || 'no user')
        
        // Handle signout
        if (!session) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }
        
        // Handle sign in and token refresh
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session.user)
          // Fire-and-forget profile fetch so UI isn't blocked
          loadProfile(session.user)
            .catch(err => console.warn('Profile load (event) error:', err))
            .finally(() => setLoading(false))
        }
      }
    )
    
    // Run initial check
    checkSession()
    
    // Cleanup
    return () => {
      console.log('🗑 Cleaning up auth subscriptions')
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

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
            auth_user_id: data.user.id,
            email,
            full_name: userData.full_name || '',
            primary_role: userData.role || 'student',
            smartid_time_role: userData.role || 'student',
            institution_id: userData.institution_id,
            employee_id: userData.employee_id || `EMP${Date.now()}`,
            ic_number: '0000000000000', // Required field - should be provided in real implementation
            phone: '0000000000', // Required field - should be provided in real implementation
            primary_system: 'time_web' // Default to TIME system
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
