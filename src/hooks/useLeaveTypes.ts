import { useState, useEffect } from 'react'
import { LeaveTypesAPI } from '../lib/api/leave-types'
import type { Database } from '@/types/database'

type LeaveType = Database['public']['Tables']['leave_types']['Row']

type LeaveTypeInsert = Database['public']['Tables']['leave_types']['Insert']
type LeaveTypeUpdate = Database['public']['Tables']['leave_types']['Update']

export function useLeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Refresh data function for manual refresh
  const refreshLeaveTypes = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await LeaveTypesAPI.getAll()
      setLeaveTypes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leave types')
      setLeaveTypes([])
    } finally {
      setLoading(false)
    }
  }

  // Create new leave type
  const createLeaveType = async (leaveType: LeaveTypeInsert) => {
    try {
      setError(null)
      const newType = await LeaveTypesAPI.create(leaveType)
      setLeaveTypes(prev => [newType, ...prev])
      return newType
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create leave type'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Update leave type
  const updateLeaveType = async (id: string, updates: LeaveTypeUpdate) => {
    try {
      setError(null)
      const updatedType = await LeaveTypesAPI.update(id, updates)
      setLeaveTypes(prev => 
        prev.map(type => type.id === id ? updatedType : type)
      )
      return updatedType
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update leave type'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Delete leave type
  const deleteLeaveType = async (id: string) => {
    try {
      setError(null)
      await LeaveTypesAPI.delete(id)
      setLeaveTypes(prev => prev.filter(type => type.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete leave type'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Toggle active status
  const toggleActive = async (id: string) => {
    try {
      setError(null)
      const updatedType = await LeaveTypesAPI.toggleActive(id)
      setLeaveTypes(prev => 
        prev.map(type => type.id === id ? updatedType : type)
      )
      return updatedType
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle leave type status'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  // Search leave types
  const searchLeaveTypes = async (query: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await LeaveTypesAPI.search(query)
      setLeaveTypes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search leave types')
    } finally {
      setLoading(false)
    }
  }

  // Get active leave types only
  const getActiveTypes = () => {
    return leaveTypes.filter(type => type.is_active)
  }

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await LeaveTypesAPI.getAll()
        setLeaveTypes(data)
        setLoading(false)
      } catch (err) {
        setError('Failed to load leave types')
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return {
    leaveTypes,
    loading,
    error,
    refreshLeaveTypes,
    createLeaveType,
    updateLeaveType,
    deleteLeaveType,
    toggleActive,
    searchLeaveTypes,
    getActiveTypes
  }
}
