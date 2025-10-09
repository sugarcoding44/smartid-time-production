export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attendance_records: {
        Row: {
          actual_working_hours: number | null
          attendance_type: string | null
          auto_calculated: boolean | null
          break_duration_minutes: number | null
          break_end_time: string | null
          break_start_time: string | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string | null
          date: string | null
          device_id: string | null
          holiday_id: string | null
          id: string
          institution_id: string | null
          is_holiday: boolean | null
          location: string | null
          manager_override: boolean | null
          notes: string | null
          override_by: string | null
          override_reason: string | null
          overtime_hours: number | null
          scheduled_end_time: string | null
          scheduled_start_time: string | null
          status: string | null
          sync_to_hq_status: string | null
          synced_to_hq_at: string | null
          updated_at: string | null
          user_id: string | null
          verification_method: string | null
          work_group_id: string | null
        }
        Insert: {
          actual_working_hours?: number | null
          attendance_type?: string | null
          auto_calculated?: boolean | null
          break_duration_minutes?: number | null
          break_end_time?: string | null
          break_start_time?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          date?: string | null
          device_id?: string | null
          holiday_id?: string | null
          id?: string
          institution_id?: string | null
          is_holiday?: boolean | null
          location?: string | null
          manager_override?: boolean | null
          notes?: string | null
          override_by?: string | null
          override_reason?: string | null
          overtime_hours?: number | null
          scheduled_end_time?: string | null
          scheduled_start_time?: string | null
          status?: string | null
          sync_to_hq_status?: string | null
          synced_to_hq_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_method?: string | null
          work_group_id?: string | null
        }
        Update: {
          actual_working_hours?: number | null
          attendance_type?: string | null
          auto_calculated?: boolean | null
          break_duration_minutes?: number | null
          break_end_time?: string | null
          break_start_time?: string | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          date?: string | null
          device_id?: string | null
          holiday_id?: string | null
          id?: string
          institution_id?: string | null
          is_holiday?: boolean | null
          location?: string | null
          manager_override?: boolean | null
          notes?: string | null
          override_by?: string | null
          override_reason?: string | null
          overtime_hours?: number | null
          scheduled_end_time?: string | null
          scheduled_start_time?: string | null
          status?: string | null
          sync_to_hq_status?: string | null
          synced_to_hq_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_method?: string | null
          work_group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_holiday_id_fkey"
            columns: ["holiday_id"]
            isOneToOne: false
            referencedRelation: "institution_holidays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_override_by_fkey"
            columns: ["override_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_work_group_id_fkey"
            columns: ["work_group_id"]
            isOneToOne: false
            referencedRelation: "work_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      biometric_enrollments: {
        Row: {
          biometric_type: string
          created_at: string | null
          device_id: string | null
          enrolled_by: string | null
          enrollment_date: string | null
          id: string
          last_verified: string | null
          quality_score: number | null
          smartid_hq_biometric_id: string | null
          status: string | null
          sync_status: string | null
          synced_to_hq_at: string | null
          template_hash: string
          updated_at: string | null
          user_id: string | null
          verification_count: number | null
        }
        Insert: {
          biometric_type: string
          created_at?: string | null
          device_id?: string | null
          enrolled_by?: string | null
          enrollment_date?: string | null
          id?: string
          last_verified?: string | null
          quality_score?: number | null
          smartid_hq_biometric_id?: string | null
          status?: string | null
          sync_status?: string | null
          synced_to_hq_at?: string | null
          template_hash: string
          updated_at?: string | null
          user_id?: string | null
          verification_count?: number | null
        }
        Update: {
          biometric_type?: string
          created_at?: string | null
          device_id?: string | null
          enrolled_by?: string | null
          enrollment_date?: string | null
          id?: string
          last_verified?: string | null
          quality_score?: number | null
          smartid_hq_biometric_id?: string | null
          status?: string | null
          sync_status?: string | null
          synced_to_hq_at?: string | null
          template_hash?: string
          updated_at?: string | null
          user_id?: string | null
          verification_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "biometric_enrollments_enrolled_by_fkey"
            columns: ["enrolled_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biometric_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cafeterias: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          id: string
          institution_id: string | null
          location: string
          name: string
          operating_hours: Json | null
          service_tax_applicable: boolean | null
          settings: Json | null
          sst_rate: number | null
          sst_registration_number: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id?: string | null
          location: string
          name: string
          operating_hours?: Json | null
          service_tax_applicable?: boolean | null
          settings?: Json | null
          sst_rate?: number | null
          sst_registration_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          institution_id?: string | null
          location?: string
          name?: string
          operating_hours?: Json | null
          service_tax_applicable?: boolean | null
          settings?: Json | null
          sst_rate?: number | null
          sst_registration_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cafeterias_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_drawer_sessions: {
        Row: {
          cafeteria_id: string | null
          card_sales: number | null
          cash_difference: number | null
          cash_sales: number | null
          closed_by: string | null
          closing_cash: number | null
          closing_time: string | null
          created_at: string | null
          expected_cash: number | null
          id: string
          notes: string | null
          opening_cash: number
          opening_time: string | null
          session_number: string
          staff_id: string | null
          status: string | null
          total_refunds: number | null
          total_sales: number | null
          total_voids: number | null
          updated_at: string | null
        }
        Insert: {
          cafeteria_id?: string | null
          card_sales?: number | null
          cash_difference?: number | null
          cash_sales?: number | null
          closed_by?: string | null
          closing_cash?: number | null
          closing_time?: string | null
          created_at?: string | null
          expected_cash?: number | null
          id?: string
          notes?: string | null
          opening_cash?: number
          opening_time?: string | null
          session_number: string
          staff_id?: string | null
          status?: string | null
          total_refunds?: number | null
          total_sales?: number | null
          total_voids?: number | null
          updated_at?: string | null
        }
        Update: {
          cafeteria_id?: string | null
          card_sales?: number | null
          cash_difference?: number | null
          cash_sales?: number | null
          closed_by?: string | null
          closing_cash?: number | null
          closing_time?: string | null
          created_at?: string | null
          expected_cash?: number | null
          id?: string
          notes?: string | null
          opening_cash?: number
          opening_time?: string | null
          session_number?: string
          staff_id?: string | null
          status?: string | null
          total_refunds?: number | null
          total_sales?: number | null
          total_voids?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_drawer_sessions_cafeteria_id_fkey"
            columns: ["cafeteria_id"]
            isOneToOne: false
            referencedRelation: "cafeterias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_drawer_sessions_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_drawer_sessions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_movements: {
        Row: {
          amount: number
          authorized_by: string | null
          created_at: string | null
          id: string
          movement_type: string
          notes: string | null
          reason: string
          session_id: string | null
          staff_id: string | null
        }
        Insert: {
          amount: number
          authorized_by?: string | null
          created_at?: string | null
          id?: string
          movement_type: string
          notes?: string | null
          reason: string
          session_id?: string | null
          staff_id?: string | null
        }
        Update: {
          amount?: number
          authorized_by?: string | null
          created_at?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          reason?: string
          session_id?: string | null
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_movements_authorized_by_fkey"
            columns: ["authorized_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cash_drawer_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_sales_summary: {
        Row: {
          average_transaction: number | null
          business_date: string
          cafeteria_id: string | null
          card_sales: number | null
          cash_sales: number | null
          created_at: string | null
          digital_wallet_sales: number | null
          finalized_at: string | null
          finalized_by: string | null
          gross_sales: number | null
          id: string
          is_finalized: boolean | null
          net_sales: number | null
          top_items: Json | null
          total_discounts: number | null
          total_refunds: number | null
          total_tax: number | null
          total_transactions: number | null
          total_voids: number | null
          updated_at: string | null
        }
        Insert: {
          average_transaction?: number | null
          business_date: string
          cafeteria_id?: string | null
          card_sales?: number | null
          cash_sales?: number | null
          created_at?: string | null
          digital_wallet_sales?: number | null
          finalized_at?: string | null
          finalized_by?: string | null
          gross_sales?: number | null
          id?: string
          is_finalized?: boolean | null
          net_sales?: number | null
          top_items?: Json | null
          total_discounts?: number | null
          total_refunds?: number | null
          total_tax?: number | null
          total_transactions?: number | null
          total_voids?: number | null
          updated_at?: string | null
        }
        Update: {
          average_transaction?: number | null
          business_date?: string
          cafeteria_id?: string | null
          card_sales?: number | null
          cash_sales?: number | null
          created_at?: string | null
          digital_wallet_sales?: number | null
          finalized_at?: string | null
          finalized_by?: string | null
          gross_sales?: number | null
          id?: string
          is_finalized?: boolean | null
          net_sales?: number | null
          top_items?: Json | null
          total_discounts?: number | null
          total_refunds?: number | null
          total_tax?: number | null
          total_transactions?: number | null
          total_voids?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_sales_summary_cafeteria_id_fkey"
            columns: ["cafeteria_id"]
            isOneToOne: false
            referencedRelation: "cafeterias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_sales_summary_finalized_by_fkey"
            columns: ["finalized_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          created_at: string | null
          device_id: string
          device_name: string
          device_type: string
          firmware_version: string | null
          id: string
          installed_date: string | null
          institution_id: string | null
          ip_address: unknown | null
          last_heartbeat: string | null
          last_sync_with_hq: string | null
          location: string
          mac_address: string | null
          settings: Json | null
          status: string | null
          sync_with_hq: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_id: string
          device_name: string
          device_type: string
          firmware_version?: string | null
          id?: string
          installed_date?: string | null
          institution_id?: string | null
          ip_address?: unknown | null
          last_heartbeat?: string | null
          last_sync_with_hq?: string | null
          location: string
          mac_address?: string | null
          settings?: Json | null
          status?: string | null
          sync_with_hq?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string
          device_name?: string
          device_type?: string
          firmware_version?: string | null
          id?: string
          installed_date?: string | null
          institution_id?: string | null
          ip_address?: unknown | null
          last_heartbeat?: string | null
          last_sync_with_hq?: string | null
          location?: string
          mac_address?: string | null
          settings?: Json | null
          status?: string | null
          sync_with_hq?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_holidays: {
        Row: {
          affected_work_groups: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          holiday_date: string
          holiday_type: string | null
          id: string
          institution_id: string | null
          is_paid: boolean | null
          is_recurring: boolean | null
          is_working_day: boolean | null
          name: string
          recurrence_pattern: string | null
          updated_at: string | null
        }
        Insert: {
          affected_work_groups?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          holiday_date: string
          holiday_type?: string | null
          id?: string
          institution_id?: string | null
          is_paid?: boolean | null
          is_recurring?: boolean | null
          is_working_day?: boolean | null
          name: string
          recurrence_pattern?: string | null
          updated_at?: string | null
        }
        Update: {
          affected_work_groups?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          holiday_date?: string
          holiday_type?: string | null
          id?: string
          institution_id?: string | null
          is_paid?: boolean | null
          is_recurring?: boolean | null
          is_working_day?: boolean | null
          name?: string
          recurrence_pattern?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "institution_holidays_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institution_holidays_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          registration_number: string | null
          settings: Json | null
          smartid_hq_institution_id: string | null
          status: string | null
          subscription_plan: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          registration_number?: string | null
          settings?: Json | null
          smartid_hq_institution_id?: string | null
          status?: string | null
          subscription_plan?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          registration_number?: string | null
          settings?: Json | null
          smartid_hq_institution_id?: string | null
          status?: string | null
          subscription_plan?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      leave_applications: {
        Row: {
          application_number: string
          applied_date: string | null
          approval_comments: string | null
          approval_level: number | null
          approved_date: string | null
          created_at: string | null
          current_approver_id: string | null
          emergency_contact: Json | null
          end_date: string
          half_day_end: boolean | null
          half_day_start: boolean | null
          handover_notes: string | null
          hr_notes: string | null
          id: string
          leave_type_id: string | null
          medical_certificate_url: string | null
          reason: string
          rejected_date: string | null
          rejection_reason: string | null
          start_date: string
          status: string | null
          supporting_documents_urls: string[] | null
          total_days: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          application_number: string
          applied_date?: string | null
          approval_comments?: string | null
          approval_level?: number | null
          approved_date?: string | null
          created_at?: string | null
          current_approver_id?: string | null
          emergency_contact?: Json | null
          end_date: string
          half_day_end?: boolean | null
          half_day_start?: boolean | null
          handover_notes?: string | null
          hr_notes?: string | null
          id?: string
          leave_type_id?: string | null
          medical_certificate_url?: string | null
          reason: string
          rejected_date?: string | null
          rejection_reason?: string | null
          start_date: string
          status?: string | null
          supporting_documents_urls?: string[] | null
          total_days: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          application_number?: string
          applied_date?: string | null
          approval_comments?: string | null
          approval_level?: number | null
          approved_date?: string | null
          created_at?: string | null
          current_approver_id?: string | null
          emergency_contact?: Json | null
          end_date?: string
          half_day_end?: boolean | null
          half_day_start?: boolean | null
          handover_notes?: string | null
          hr_notes?: string | null
          id?: string
          leave_type_id?: string | null
          medical_certificate_url?: string | null
          reason?: string
          rejected_date?: string | null
          rejection_reason?: string | null
          start_date?: string
          status?: string | null
          supporting_documents_urls?: string[] | null
          total_days?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_applications_current_approver_id_fkey"
            columns: ["current_approver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_applications_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_approval_workflow: {
        Row: {
          approval_level: number
          approver_id: string | null
          approver_role: string | null
          comments: string | null
          created_at: string | null
          decision_date: string | null
          delegated_to_id: string | null
          delegation_reason: string | null
          id: string
          leave_application_id: string | null
          status: string
        }
        Insert: {
          approval_level: number
          approver_id?: string | null
          approver_role?: string | null
          comments?: string | null
          created_at?: string | null
          decision_date?: string | null
          delegated_to_id?: string | null
          delegation_reason?: string | null
          id?: string
          leave_application_id?: string | null
          status: string
        }
        Update: {
          approval_level?: number
          approver_id?: string | null
          approver_role?: string | null
          comments?: string | null
          created_at?: string | null
          decision_date?: string | null
          delegated_to_id?: string | null
          delegation_reason?: string | null
          id?: string
          leave_application_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_approval_workflow_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_approval_workflow_delegated_to_id_fkey"
            columns: ["delegated_to_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_approval_workflow_leave_application_id_fkey"
            columns: ["leave_application_id"]
            isOneToOne: false
            referencedRelation: "leave_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balance_history: {
        Row: {
          balance_after: number
          balance_before: number
          days_change: number
          description: string | null
          id: string
          leave_type_id: string | null
          processed_at: string | null
          processed_by: string | null
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          balance_after: number
          balance_before: number
          days_change: number
          description?: string | null
          id?: string
          leave_type_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          balance_after?: number
          balance_before?: number
          days_change?: number
          description?: string | null
          id?: string
          leave_type_id?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_balance_history_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balance_history_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balance_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          allow_carry_forward: boolean | null
          carry_forward_expiry_months: number | null
          code: string
          color: string | null
          created_at: string | null
          created_by: string | null
          default_quota_days: number | null
          description: string | null
          display_order: number | null
          has_annual_quota: boolean | null
          id: string
          institution_id: string | null
          is_active: boolean | null
          is_paid: boolean | null
          is_prorated: boolean | null
          is_system_default: boolean | null
          max_carry_forward_days: number | null
          max_consecutive_days: number | null
          min_advance_notice_days: number | null
          name: string
          quota_calculation_method: string | null
          requires_approval: boolean | null
          requires_medical_certificate: boolean | null
          updated_at: string | null
        }
        Insert: {
          allow_carry_forward?: boolean | null
          carry_forward_expiry_months?: number | null
          code: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          default_quota_days?: number | null
          description?: string | null
          display_order?: number | null
          has_annual_quota?: boolean | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          is_paid?: boolean | null
          is_prorated?: boolean | null
          is_system_default?: boolean | null
          max_carry_forward_days?: number | null
          max_consecutive_days?: number | null
          min_advance_notice_days?: number | null
          name: string
          quota_calculation_method?: string | null
          requires_approval?: boolean | null
          requires_medical_certificate?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allow_carry_forward?: boolean | null
          carry_forward_expiry_months?: number | null
          code?: string
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          default_quota_days?: number | null
          description?: string | null
          display_order?: number | null
          has_annual_quota?: boolean | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          is_paid?: boolean | null
          is_prorated?: boolean | null
          is_system_default?: boolean | null
          max_carry_forward_days?: number | null
          max_consecutive_days?: number | null
          min_advance_notice_days?: number | null
          name?: string
          quota_calculation_method?: string | null
          requires_approval?: boolean | null
          requires_medical_certificate?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_types_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          available_days: number[] | null
          available_from: string | null
          available_to: string | null
          cafeteria_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          available_days?: number[] | null
          available_from?: string | null
          available_to?: string | null
          cafeteria_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          available_days?: number[] | null
          available_from?: string | null
          available_to?: string | null
          cafeteria_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_cafeteria_id_fkey"
            columns: ["cafeteria_id"]
            isOneToOne: false
            referencedRelation: "cafeterias"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_variants: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          menu_item_id: string | null
          name: string
          price_adjustment: number | null
          variant_type: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          menu_item_id?: string | null
          name: string
          price_adjustment?: number | null
          variant_type: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          menu_item_id?: string | null
          name?: string
          price_adjustment?: number | null
          variant_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_variants_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: string[] | null
          available_days: number[] | null
          available_from: string | null
          available_to: string | null
          barcode: string | null
          cafeteria_id: string | null
          calories: number | null
          category_id: string | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          is_active: boolean | null
          is_available: boolean | null
          is_taxable: boolean | null
          low_stock_alert: number | null
          name: string
          nutritional_info: Json | null
          preparation_time: number | null
          price: number
          sku: string | null
          stock_quantity: number | null
          tax_rate: number | null
          track_stock: boolean | null
          updated_at: string | null
        }
        Insert: {
          allergens?: string[] | null
          available_days?: number[] | null
          available_from?: string | null
          available_to?: string | null
          barcode?: string | null
          cafeteria_id?: string | null
          calories?: number | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_active?: boolean | null
          is_available?: boolean | null
          is_taxable?: boolean | null
          low_stock_alert?: number | null
          name: string
          nutritional_info?: Json | null
          preparation_time?: number | null
          price: number
          sku?: string | null
          stock_quantity?: number | null
          tax_rate?: number | null
          track_stock?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allergens?: string[] | null
          available_days?: number[] | null
          available_from?: string | null
          available_to?: string | null
          barcode?: string | null
          cafeteria_id?: string | null
          calories?: number | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_active?: boolean | null
          is_available?: boolean | null
          is_taxable?: boolean | null
          low_stock_alert?: number | null
          name?: string
          nutritional_info?: Json | null
          preparation_time?: number | null
          price?: number
          sku?: string | null
          stock_quantity?: number | null
          tax_rate?: number | null
          track_stock?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_cafeteria_id_fkey"
            columns: ["cafeteria_id"]
            isOneToOne: false
            referencedRelation: "cafeterias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_child_relationships: {
        Row: {
          can_set_limits: boolean | null
          can_topup: boolean | null
          can_view_transactions: boolean | null
          child_id: string | null
          created_at: string | null
          id: string
          parent_id: string | null
          relationship_type: string
          spending_limit: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          can_set_limits?: boolean | null
          can_topup?: boolean | null
          can_view_transactions?: boolean | null
          child_id?: string | null
          created_at?: string | null
          id?: string
          parent_id?: string | null
          relationship_type: string
          spending_limit?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          can_set_limits?: boolean | null
          can_topup?: boolean | null
          can_view_transactions?: boolean | null
          child_id?: string | null
          created_at?: string | null
          id?: string
          parent_id?: string | null
          relationship_type?: string
          spending_limit?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_child_relationships_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_child_relationships_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_transaction_items: {
        Row: {
          created_at: string | null
          id: string
          item_name: string
          item_price: number
          menu_item_id: string | null
          quantity: number
          special_instructions: string | null
          status: string | null
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          total_amount: number
          transaction_id: string | null
          variants: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_name: string
          item_price: number
          menu_item_id?: string | null
          quantity: number
          special_instructions?: string | null
          status?: string | null
          subtotal: number
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount: number
          transaction_id?: string | null
          variants?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_name?: string
          item_price?: number
          menu_item_id?: string | null
          quantity?: number
          special_instructions?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number
          transaction_id?: string | null
          variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_transaction_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "pos_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_transactions: {
        Row: {
          cafeteria_id: string | null
          card_id: string | null
          completed_at: string | null
          created_at: string | null
          customer_id: string | null
          discount_amount: number | null
          id: string
          notes: string | null
          original_transaction_id: string | null
          payment_method: string | null
          payment_status: string | null
          pos_device_id: string | null
          service_charge: number | null
          staff_id: string | null
          subtotal: number
          sync_errors: string | null
          synced_to_hq: boolean | null
          synced_to_registry: boolean | null
          table_number: string | null
          tax_amount: number | null
          total_amount: number
          transaction_date: string | null
          transaction_number: string
          transaction_type: string | null
          updated_at: string | null
        }
        Insert: {
          cafeteria_id?: string | null
          card_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          original_transaction_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pos_device_id?: string | null
          service_charge?: number | null
          staff_id?: string | null
          subtotal: number
          sync_errors?: string | null
          synced_to_hq?: boolean | null
          synced_to_registry?: boolean | null
          table_number?: string | null
          tax_amount?: number | null
          total_amount: number
          transaction_date?: string | null
          transaction_number: string
          transaction_type?: string | null
          updated_at?: string | null
        }
        Update: {
          cafeteria_id?: string | null
          card_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          original_transaction_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          pos_device_id?: string | null
          service_charge?: number | null
          staff_id?: string | null
          subtotal?: number
          sync_errors?: string | null
          synced_to_hq?: boolean | null
          synced_to_registry?: boolean | null
          table_number?: string | null
          tax_amount?: number | null
          total_amount?: number
          transaction_date?: string | null
          transaction_number?: string
          transaction_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pos_transactions_cafeteria_id_fkey"
            columns: ["cafeteria_id"]
            isOneToOne: false
            referencedRelation: "cafeterias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "smart_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_original_transaction_id_fkey"
            columns: ["original_transaction_id"]
            isOneToOne: false
            referencedRelation: "pos_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_transactions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_cards: {
        Row: {
          balance: number | null
          card_data: Json | null
          card_number: string
          card_type: string | null
          created_at: string | null
          daily_limit: number | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issued_by: string | null
          last_balance_sync: string | null
          last_used: string | null
          monthly_limit: number | null
          nfc_id: string
          smartid_hq_card_id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          card_data?: Json | null
          card_number: string
          card_type?: string | null
          created_at?: string | null
          daily_limit?: number | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issued_by?: string | null
          last_balance_sync?: string | null
          last_used?: string | null
          monthly_limit?: number | null
          nfc_id: string
          smartid_hq_card_id: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          card_data?: Json | null
          card_number?: string
          card_type?: string | null
          created_at?: string | null
          daily_limit?: number | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issued_by?: string | null
          last_balance_sync?: string | null
          last_used?: string | null
          monthly_limit?: number | null
          nfc_id?: string
          smartid_hq_card_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          next_retry_at: string | null
          operation: string | null
          request_data: Json | null
          response_data: Json | null
          retry_count: number | null
          status: string | null
          sync_type: string
          system: string
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          next_retry_at?: string | null
          operation?: string | null
          request_data?: Json | null
          response_data?: Json | null
          retry_count?: number | null
          status?: string | null
          sync_type: string
          system: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          next_retry_at?: string | null
          operation?: string | null
          request_data?: Json | null
          response_data?: Json | null
          retry_count?: number | null
          status?: string | null
          sync_type?: string
          system?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          device_id: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          institution_id: string | null
          ip_address: unknown | null
          status: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          device_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          institution_id?: string | null
          ip_address?: unknown | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          device_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          institution_id?: string | null
          ip_address?: unknown | null
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_logs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_leave_quotas: {
        Row: {
          allocated_days: number
          available_days: number | null
          carried_forward_days: number | null
          carry_forward_expiry_date: string | null
          created_at: string | null
          custom_advance_notice_days: number | null
          custom_max_consecutive_days: number | null
          id: string
          last_updated_by: string | null
          leave_type_id: string | null
          pending_days: number | null
          quota_year: number
          updated_at: string | null
          used_days: number | null
          user_id: string | null
        }
        Insert: {
          allocated_days: number
          available_days?: number | null
          carried_forward_days?: number | null
          carry_forward_expiry_date?: string | null
          created_at?: string | null
          custom_advance_notice_days?: number | null
          custom_max_consecutive_days?: number | null
          id?: string
          last_updated_by?: string | null
          leave_type_id?: string | null
          pending_days?: number | null
          quota_year: number
          updated_at?: string | null
          used_days?: number | null
          user_id?: string | null
        }
        Update: {
          allocated_days?: number
          available_days?: number | null
          carried_forward_days?: number | null
          carry_forward_expiry_date?: string | null
          created_at?: string | null
          custom_advance_notice_days?: number | null
          custom_max_consecutive_days?: number | null
          id?: string
          last_updated_by?: string | null
          leave_type_id?: string | null
          pending_days?: number | null
          quota_year?: number
          updated_at?: string | null
          used_days?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_leave_quotas_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_leave_quotas_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_leave_quotas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          system: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          system: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          system?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_work_group_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          custom_end_time: string | null
          custom_minimum_hours: number | null
          custom_start_time: string | null
          custom_working_days: number[] | null
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string | null
          work_group_id: string | null
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          custom_end_time?: string | null
          custom_minimum_hours?: number | null
          custom_start_time?: string | null
          custom_working_days?: number[] | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          work_group_id?: string | null
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          custom_end_time?: string | null
          custom_minimum_hours?: number | null
          custom_start_time?: string | null
          custom_working_days?: number[] | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string | null
          work_group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_work_group_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_work_group_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_work_group_assignments_work_group_id_fkey"
            columns: ["work_group_id"]
            isOneToOne: false
            referencedRelation: "work_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          department: string | null
          email: string
          email_verified: boolean | null
          emergency_contact: Json | null
          employee_id: string | null
          full_name: string
          gender: string | null
          grade_class: string | null
          ic_number: string
          id: string
          institution_id: string | null
          last_login: string | null
          parent_contact: Json | null
          phone: string
          phone_verified: boolean | null
          pos_employee_code: string | null
          pos_pin_code: string | null
          primary_role: string
          primary_system: string
          smartid_hq_role: string | null
          smartid_hq_user_id: string | null
          smartid_hub_role: string | null
          smartid_pay_role: string | null
          smartid_pos_role: string | null
          smartid_time_role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: string | null
          email: string
          email_verified?: boolean | null
          emergency_contact?: Json | null
          employee_id?: string | null
          full_name: string
          gender?: string | null
          grade_class?: string | null
          ic_number: string
          id?: string
          institution_id?: string | null
          last_login?: string | null
          parent_contact?: Json | null
          phone: string
          phone_verified?: boolean | null
          pos_employee_code?: string | null
          pos_pin_code?: string | null
          primary_role: string
          primary_system: string
          smartid_hq_role?: string | null
          smartid_hq_user_id?: string | null
          smartid_hub_role?: string | null
          smartid_pay_role?: string | null
          smartid_pos_role?: string | null
          smartid_time_role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          department?: string | null
          email?: string
          email_verified?: boolean | null
          emergency_contact?: Json | null
          employee_id?: string | null
          full_name?: string
          gender?: string | null
          grade_class?: string | null
          ic_number?: string
          id?: string
          institution_id?: string | null
          last_login?: string | null
          parent_contact?: Json | null
          phone?: string
          phone_verified?: boolean | null
          pos_employee_code?: string | null
          pos_pin_code?: string | null
          primary_role?: string
          primary_system?: string
          smartid_hq_role?: string | null
          smartid_hq_user_id?: string | null
          smartid_hub_role?: string | null
          smartid_pay_role?: string | null
          smartid_pos_role?: string | null
          smartid_time_role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          billplz_transaction_id: string | null
          card_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          merchant_location: string | null
          parent_user_id: string | null
          payment_method: string | null
          smartid_pay_transaction_id: string
          status: string | null
          synced_from_pay_at: string | null
          transaction_date: string
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          billplz_transaction_id?: string | null
          card_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          merchant_location?: string | null
          parent_user_id?: string | null
          payment_method?: string | null
          smartid_pay_transaction_id: string
          status?: string | null
          synced_from_pay_at?: string | null
          transaction_date: string
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          billplz_transaction_id?: string | null
          card_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          merchant_location?: string | null
          parent_user_id?: string | null
          payment_method?: string | null
          smartid_pay_transaction_id?: string
          status?: string | null
          synced_from_pay_at?: string | null
          transaction_date?: string
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "smart_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_parent_user_id_fkey"
            columns: ["parent_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      work_groups: {
        Row: {
          break_duration_minutes: number | null
          break_end_time: string | null
          break_start_time: string | null
          created_at: string | null
          created_by: string | null
          default_end_time: string
          default_start_time: string
          description: string | null
          early_leave_threshold_minutes: number | null
          id: string
          institution_id: string | null
          is_active: boolean | null
          late_threshold_minutes: number | null
          minimum_working_hours: number | null
          name: string
          overtime_rate_multiplier: number | null
          overtime_threshold_hours: number | null
          updated_at: string | null
          working_days: number[] | null
        }
        Insert: {
          break_duration_minutes?: number | null
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string | null
          created_by?: string | null
          default_end_time?: string
          default_start_time?: string
          description?: string | null
          early_leave_threshold_minutes?: number | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          late_threshold_minutes?: number | null
          minimum_working_hours?: number | null
          name: string
          overtime_rate_multiplier?: number | null
          overtime_threshold_hours?: number | null
          updated_at?: string | null
          working_days?: number[] | null
        }
        Update: {
          break_duration_minutes?: number | null
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string | null
          created_by?: string | null
          default_end_time?: string
          default_start_time?: string
          description?: string | null
          early_leave_threshold_minutes?: number | null
          id?: string
          institution_id?: string | null
          is_active?: boolean | null
          late_threshold_minutes?: number | null
          minimum_working_hours?: number | null
          name?: string
          overtime_rate_multiplier?: number | null
          overtime_threshold_hours?: number | null
          updated_at?: string | null
          working_days?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "work_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_groups_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_for_leave: {
        Args: {
          emergency_contact_param?: Json
          end_date_param: string
          half_day_end_param?: boolean
          half_day_start_param?: boolean
          leave_type_id_param: string
          medical_certificate_url_param?: string
          reason_param: string
          start_date_param: string
          user_id_param: string
        }
        Returns: {
          application_id: string
          application_number: string
          message: string
          status: string
          success: boolean
          total_days: number
        }[]
      }
      calculate_leave_working_days: {
        Args: {
          end_date_param: string
          half_day_end?: boolean
          half_day_start?: boolean
          institution_id_param: string
          start_date_param: string
          work_group_id_param: string
        }
        Returns: number
      }
      calculate_transaction_totals: {
        Args: {
          discount_amount_param?: number
          service_charge_param?: number
          subtotal_param: number
          tax_rate_param?: number
        }
        Returns: {
          discount_amount: number
          service_charge: number
          subtotal: number
          tax_amount: number
          total_amount: number
        }[]
      }
      check_leave_quota_availability: {
        Args: {
          leave_type_id_param: string
          quota_year_param?: number
          requested_days: number
          user_id_param: string
        }
        Returns: {
          allocated_days: number
          available_days: number
          has_sufficient_quota: boolean
          message: string
          pending_days: number
          used_days: number
        }[]
      }
      generate_employee_id: {
        Args: { institution_id_param: string; role_name: string }
        Returns: string
      }
      generate_leave_application_number: {
        Args: { institution_id_param: string }
        Returns: string
      }
      generate_transaction_number: {
        Args: { cafeteria_id_param: string }
        Returns: string
      }
      get_current_cash_session: {
        Args: { cafeteria_id_param: string; staff_id_param: string }
        Returns: string
      }
      get_daily_sales_report: {
        Args: { cafeteria_id_param: string; report_date?: string }
        Returns: {
          average_transaction: number
          business_date: string
          card_sales: number
          cash_sales: number
          gross_sales: number
          net_sales: number
          total_discounts: number
          total_tax: number
          total_transactions: number
        }[]
      }
      get_user_institution_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_permissions: {
        Args: { role_name: string; system_name: string }
        Returns: Json
      }
      get_user_role_info: {
        Args: { user_id_param?: string }
        Returns: {
          full_name: string
          institution_id: string
          institution_name: string
          permissions: Json
          primary_role: string
          primary_system: string
          user_id: string
        }[]
      }
      get_user_work_schedule: {
        Args: { check_date?: string; user_id_param: string }
        Returns: {
          early_leave_threshold_minutes: number
          end_time: string
          is_working_day: boolean
          late_threshold_minutes: number
          minimum_hours: number
          start_time: string
          work_group_id: string
          work_group_name: string
          working_days: number[]
        }[]
      }
      get_wallet_balance: {
        Args: { user_id_param: string }
        Returns: number
      }
      initialize_default_leave_types: {
        Args: { institution_id_param: string }
        Returns: undefined
      }
      is_cash_drawer_open: {
        Args: { cafeteria_id_param: string; staff_id_param: string }
        Returns: boolean
      }
      is_holiday: {
        Args: {
          check_date: string
          institution_id_param: string
          work_group_id_param?: string
        }
        Returns: {
          holiday_name: string
          holiday_type: string
          is_holiday_day: boolean
          is_working_day: boolean
        }[]
      }
      record_attendance: {
        Args: {
          device_id_param?: string
          location_param?: string
          user_id_param: string
          verification_method_param: string
        }
        Returns: {
          attendance_id: string
          check_in_time: string
          message: string
          status: string
        }[]
      }
      record_premium_attendance: {
        Args: {
          device_id_param?: string
          force_override?: boolean
          location_param?: string
          user_id_param: string
          verification_method_param: string
        }
        Returns: {
          attendance_id: string
          check_in_time: string
          check_out_time: string
          is_early_leave: boolean
          is_late: boolean
          message: string
          overtime_hours: number
          status: string
          working_hours: number
        }[]
      }
      user_has_role: {
        Args: { role_name: string; system_name?: string }
        Returns: boolean
      }
      user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_card_transaction: {
        Args: { amount_param: number; card_id_param: string }
        Returns: {
          current_balance: number
          daily_limit: number
          is_valid: boolean
          message: string
          monthly_limit: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const