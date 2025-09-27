import { Database } from './database'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific types
export type Institution = Tables<'institutions'>
export type SchoolUser = Tables<'school_users'>

export type UserType = 'student' | 'teacher' | 'staff'

export interface DashboardStats {
  totalUsers: number
  studentsCount: number
  teachersCount: number
  staffCount: number
  biometricEnrolled: number
  smartCardsIssued: number
  enrollmentRate: number
}

export interface SchoolRegistrationData {
  name: string
  address: string
  phone: string
  email: string
  registrationNumber: string
  adminName: string
  adminEmail: string
  adminPhone: string
}

export interface UserRegistrationData {
  name: string
  icNumber: string
  email?: string
  phone?: string
  userType: UserType
}
