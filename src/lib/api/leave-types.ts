import { createClient } from '../supabase/client'
import type { Database } from '@/types/database'

type LeaveType = Database['public']['Tables']['leave_types']['Row']

type LeaveTypeInsert = Database['public']['Tables']['leave_types']['Insert']
type LeaveTypeUpdate = Database['public']['Tables']['leave_types']['Update']

export class LeaveTypesAPI {
  // Get all leave types
  static async getAll(): Promise<LeaveType[]> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('leave_types')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching leave types:', error)
      return []
    }
  }

  // Get active leave types only
  static async getActive(): Promise<LeaveType[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('leave_types')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch active leave types: ${error.message}`)
    }

    return data || []
  }

  // Get leave type by ID
  static async getById(id: string): Promise<LeaveType | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('leave_types')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No rows returned
      }
      throw new Error(`Failed to fetch leave type: ${error.message}`)
    }

    return data
  }

  // Create new leave type
  static async create(leaveType: LeaveTypeInsert): Promise<LeaveType> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('leave_types')
      .insert([{
        ...leaveType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to create leave type: ${error.message}`)
    }

    return data
  }

  // Update leave type
  static async update(id: string, updates: LeaveTypeUpdate): Promise<LeaveType> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('leave_types')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to update leave type: ${error.message}`)
    }

    return data
  }

  // Delete leave type
  static async delete(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('leave_types')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete leave type: ${error.message}`)
    }
  }

  // Toggle active status
  static async toggleActive(id: string): Promise<LeaveType> {
    // First get current status
    const current = await this.getById(id)
    if (!current) {
      throw new Error('Leave type not found')
    }

    // Toggle the status
    return this.update(id, { is_active: !current.is_active })
  }

  // Bulk operations
  static async bulkCreate(leaveTypes: LeaveTypeInsert[]): Promise<LeaveType[]> {
    const supabase = createClient()
    const now = new Date().toISOString()
    const typesWithTimestamps = leaveTypes.map(type => ({
      ...type,
      created_at: now,
      updated_at: now
    }))

    const { data, error } = await supabase
      .from('leave_types')
      .insert(typesWithTimestamps)
      .select('*')

    if (error) {
      throw new Error(`Failed to bulk create leave types: ${error.message}`)
    }

    return data || []
  }

  // Search leave types
  static async search(query: string): Promise<LeaveType[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('leave_types')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to search leave types: ${error.message}`)
    }

    return data || []
  }
}
