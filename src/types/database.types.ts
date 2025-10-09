export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      institutions: {
        Row: {
          id: string
          name: string
          type: 'school' | 'university' | 'corporate' | 'government'
          registration_number: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string
          postal_code: string | null
          phone: string | null
          email: string | null
          contact_person: string | null
          status: 'active' | 'inactive' | 'suspended'
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'school' | 'university' | 'corporate' | 'government'
          registration_number?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          contact_person?: string | null
          status?: 'active' | 'inactive' | 'suspended'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'school' | 'university' | 'corporate' | 'government'
          registration_number?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          contact_person?: string | null
          status?: 'active' | 'inactive' | 'suspended'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          auth_user_id: string | null
          full_name: string
          ic_number: string | null
          email: string | null
          phone: string | null
          username: string | null
          institution_id: string | null
          employee_id: string | null
          admin_role: boolean
          status: 'active' | 'inactive' | 'suspended'
          primary_role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          full_name: string
          ic_number?: string | null
          email?: string | null
          phone?: string | null
          username?: string | null
          institution_id?: string | null
          employee_id?: string | null
          admin_role?: boolean
          status?: 'active' | 'inactive' | 'suspended'
          primary_role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          full_name?: string
          ic_number?: string | null
          email?: string | null
          phone?: string | null
          username?: string | null
          institution_id?: string | null
          employee_id?: string | null
          admin_role?: boolean
          status?: 'active' | 'inactive' | 'suspended'
          primary_role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
  time: {
    Tables: {
      work_groups: {
        Row: {
          id: string
          institution_id: string
          name: string
          description: string | null
          working_days: number[]
          default_start_time: string
          default_end_time: string
          minimum_working_hours: number
          late_threshold_minutes: number
          early_leave_threshold_minutes: number
          break_duration_minutes: number
          break_start_time: string | null
          break_end_time: string | null
          overtime_start_minutes: number
          overtime_minimum_minutes: number
          overtime_maximum_hours: number
          flexi_time_enabled: boolean
          flexi_time_start_range: string | null
          flexi_time_end_range: string | null
          settings: Json
          is_default: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          institution_id: string
          name: string
          description?: string | null
          working_days?: number[]
          default_start_time?: string
          default_end_time?: string
          minimum_working_hours?: number
          late_threshold_minutes?: number
          early_leave_threshold_minutes?: number
          break_duration_minutes?: number
          break_start_time?: string | null
          break_end_time?: string | null
          overtime_start_minutes?: number
          overtime_minimum_minutes?: number
          overtime_maximum_hours?: number
          flexi_time_enabled?: boolean
          flexi_time_start_range?: string | null
          flexi_time_end_range?: string | null
          settings?: Json
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          institution_id?: string
          name?: string
          description?: string | null
          working_days?: number[]
          default_start_time?: string
          default_end_time?: string
          minimum_working_hours?: number
          late_threshold_minutes?: number
          early_leave_threshold_minutes?: number
          break_duration_minutes?: number
          break_start_time?: string | null
          break_end_time?: string | null
          overtime_start_minutes?: number
          overtime_minimum_minutes?: number
          overtime_maximum_hours?: number
          flexi_time_enabled?: boolean
          flexi_time_start_range?: string | null
          flexi_time_end_range?: string | null
          settings?: Json
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      attendance_records: {
        Row: {
          id: string
          user_id: string
          schedule_id: string
          record_type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end'
          record_time: string
          location_id: string | null
          status: 'pending' | 'approved' | 'rejected'
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string
        }
        Insert: {
          id?: string
          user_id: string
          schedule_id: string
          record_type: 'clock_in' | 'clock_out' | 'break_start' | 'break_end'
          record_time?: string
          location_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          user_id?: string
          schedule_id?: string
          record_type?: 'clock_in' | 'clock_out' | 'break_start' | 'break_end'
          record_time?: string
          location_id?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string
        }
      }
    }
  }
  leave: {
    Tables: {
      leave_types: {
        Row: {
          id: string
          institution_id: string
          name: string
          code: string
          description: string | null
          color: string | null
          icon_url: string | null
          has_annual_quota: boolean
          default_quota_days: number
          allow_carry_forward: boolean
          max_carry_forward_days: number | null
          carry_forward_expiry_months: number
          quota_reset_month: number
          requires_approval: boolean
          requires_medical_certificate: boolean
          requires_documents: boolean
          allowed_document_types: string[] | null
          min_advance_notice_days: number
          max_consecutive_days: number | null
          min_days_between_applications: number
          is_paid: boolean
          allow_half_day: boolean
          allow_hourly: boolean
          min_hours: number | null
          affects_attendance: boolean
          counts_as_present: boolean
          excludes_holidays: boolean
          excludes_weekends: boolean
          is_system_default: boolean
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          institution_id: string
          name: string
          code: string
          description?: string | null
          color?: string | null
          icon_url?: string | null
          has_annual_quota?: boolean
          default_quota_days?: number
          allow_carry_forward?: boolean
          max_carry_forward_days?: number | null
          carry_forward_expiry_months?: number
          quota_reset_month?: number
          requires_approval?: boolean
          requires_medical_certificate?: boolean
          requires_documents?: boolean
          allowed_document_types?: string[] | null
          min_advance_notice_days?: number
          max_consecutive_days?: number | null
          min_days_between_applications?: number
          is_paid?: boolean
          allow_half_day?: boolean
          allow_hourly?: boolean
          min_hours?: number | null
          affects_attendance?: boolean
          counts_as_present?: boolean
          excludes_holidays?: boolean
          excludes_weekends?: boolean
          is_system_default?: boolean
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          institution_id?: string
          name?: string
          code?: string
          description?: string | null
          color?: string | null
          icon_url?: string | null
          has_annual_quota?: boolean
          default_quota_days?: number
          allow_carry_forward?: boolean
          max_carry_forward_days?: number | null
          carry_forward_expiry_months?: number
          quota_reset_month?: number
          requires_approval?: boolean
          requires_medical_certificate?: boolean
          requires_documents?: boolean
          allowed_document_types?: string[] | null
          min_advance_notice_days?: number
          max_consecutive_days?: number | null
          min_days_between_applications?: number
          is_paid?: boolean
          allow_half_day?: boolean
          allow_hourly?: boolean
          min_hours?: number | null
          affects_attendance?: boolean
          counts_as_present?: boolean
          excludes_holidays?: boolean
          excludes_weekends?: boolean
          is_system_default?: boolean
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}