import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { id } = await params

    // Get specific leave type
    const { data: leaveType, error } = await supabase
      .from('leave_types')
      .select(`
        id,
        name,
        code,
        description,
        color,
        is_paid,
        requires_approval,
        requires_medical_certificate,
        max_consecutive_days,
        min_advance_notice_days,
        has_annual_quota,
        default_quota_days,
        allow_carry_forward,
        max_carry_forward_days,
        is_active,
        display_order,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching leave type:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Leave type not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch leave type' }, { status: 500 })
    }

    // Format the response
    const formattedLeaveType = {
      id: leaveType.id,
      name: leaveType.name,
      description: leaveType.description,
      max_days: leaveType.default_quota_days,
      carry_forward: leaveType.allow_carry_forward,
      carry_forward_limit: leaveType.max_carry_forward_days,
      requires_approval: leaveType.requires_approval,
      advance_days_required: leaveType.min_advance_notice_days,
      color: mapDatabaseColorToFrontend(leaveType.color),
      icon: getIconForLeaveType(leaveType.name),
      is_active: leaveType.is_active,
      created_at: leaveType.created_at
    }

    return NextResponse.json({
      success: true,
      data: formattedLeaveType
    })

  } catch (error) {
    console.error('Error in leave type GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { id } = await params
    const body = await request.json()

    const {
      name,
      description,
      max_days,
      carry_forward,
      carry_forward_limit,
      requires_approval,
      advance_days_required,
      color,
      is_active,
      user_id
    } = body

    // Validate required fields
    if (!name || max_days <= 0) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, max_days' 
      }, { status: 400 })
    }

    // Generate code from name if it changed
    const code = generateCodeFromName(name)

    // Update the leave type
    const { data: leaveType, error } = await supabase
      .from('leave_types')
      .update({
        name: name.trim(),
        code,
        description: description?.trim() || null,
        color: mapFrontendColorToDatabase(color),
        requires_approval: requires_approval ?? true,
        min_advance_notice_days: advance_days_required || 1,
        default_quota_days: max_days,
        allow_carry_forward: carry_forward || false,
        max_carry_forward_days: carry_forward ? (carry_forward_limit || 0) : null,
        is_active: is_active ?? true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single()

    if (error) {
      console.error('Error updating leave type:', error)
      
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Leave type not found' }, { status: 404 })
      }
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: 'A leave type with this name or code already exists' 
        }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Failed to update leave type' }, { status: 500 })
    }

    // Format the response
    const formattedLeaveType = {
      id: leaveType.id,
      name: leaveType.name,
      description: leaveType.description,
      max_days: leaveType.default_quota_days,
      carry_forward: leaveType.allow_carry_forward,
      carry_forward_limit: leaveType.max_carry_forward_days,
      requires_approval: leaveType.requires_approval,
      advance_days_required: leaveType.min_advance_notice_days,
      color: mapDatabaseColorToFrontend(leaveType.color),
      icon: getIconForLeaveType(leaveType.name),
      is_active: leaveType.is_active,
      created_at: leaveType.created_at
    }

    return NextResponse.json({
      success: true,
      data: formattedLeaveType
    })

  } catch (error) {
    console.error('Error in leave type PUT API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { id } = await params

    // Check if leave type has any active applications
    const { data: applications, error: applicationError } = await supabase
      .from('leave_applications')
      .select('id')
      .eq('leave_type_id', id)
      .limit(1)

    if (applicationError) {
      console.error('Error checking leave applications:', applicationError)
      return NextResponse.json({ error: 'Failed to check leave applications' }, { status: 500 })
    }

    if (applications && applications.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete leave type with existing applications. Please deactivate instead.' 
      }, { status: 400 })
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('leave_types')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('is_active', true)

    if (error) {
      console.error('Error deleting leave type:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Leave type not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to delete leave type' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Leave type deleted successfully'
    })

  } catch (error) {
    console.error('Error in leave type DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions (same as in the main route)
function mapDatabaseColorToFrontend(dbColor: string): string {
  const colorMap: { [key: string]: string } = {
    '#3B82F6': 'blue',
    '#10B981': 'green', 
    '#EF4444': 'red',
    '#F59E0B': 'orange',
    '#8B5CF6': 'purple',
    '#EC4899': 'pink',
    '#6366F1': 'indigo'
  }
  return colorMap[dbColor] || 'blue'
}

function mapFrontendColorToDatabase(frontendColor: string): string {
  const colorMap: { [key: string]: string } = {
    'blue': '#3B82F6',
    'green': '#10B981',
    'red': '#EF4444',
    'orange': '#F59E0B',
    'purple': '#8B5CF6',
    'pink': '#EC4899',
    'indigo': '#6366F1'
  }
  return colorMap[frontendColor] || '#3B82F6'
}

function generateCodeFromName(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 4)
}

function getIconForLeaveType(name: string): string {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('annual') || lowerName.includes('vacation')) return '🏖️'
  if (lowerName.includes('sick') || lowerName.includes('medical')) return '🏥'
  if (lowerName.includes('emergency')) return '🚨'
  if (lowerName.includes('maternity') || lowerName.includes('paternity')) return '👶'
  if (lowerName.includes('study') || lowerName.includes('education')) return '📚'
  if (lowerName.includes('compassionate') || lowerName.includes('bereavement')) return '🕊️'
  return '📋'
}
