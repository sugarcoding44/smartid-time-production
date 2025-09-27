import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institution_id')

    if (!institutionId) {
      return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 })
    }

    // Get leave types for the institution
    const { data: leaveTypes, error } = await supabase
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
      .eq('institution_id', institutionId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching leave types:', error)
      return NextResponse.json({ error: 'Failed to fetch leave types' }, { status: 500 })
    }

    // Format the response to match frontend expectations
    const formattedLeaveTypes = leaveTypes?.map(lt => ({
      id: lt.id,
      name: lt.name,
      description: lt.description,
      max_days: lt.default_quota_days,
      carry_forward: lt.allow_carry_forward,
      carry_forward_limit: lt.max_carry_forward_days,
      requires_approval: lt.requires_approval,
      advance_days_required: lt.min_advance_notice_days,
      color: mapDatabaseColorToFrontend(lt.color),
      icon: getIconForLeaveType(lt.name), // Generate icon based on leave type name
      is_active: lt.is_active,
      created_at: lt.created_at
    })) || []

    return NextResponse.json({
      success: true,
      data: formattedLeaveTypes
    })

  } catch (error) {
    console.error('Error in leave types API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const body = await request.json()

    const {
      institution_id,
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
    if (!institution_id || !name || max_days <= 0) {
      return NextResponse.json({ 
        error: 'Missing required fields: institution_id, name, max_days' 
      }, { status: 400 })
    }

    // Generate a unique code from name
    const code = generateCodeFromName(name)

    // Create the leave type
    const { data: leaveType, error } = await supabase
      .from('leave_types')
      .insert({
        institution_id,
        name: name.trim(),
        code,
        description: description?.trim() || null,
        color: mapFrontendColorToDatabase(color),
        is_paid: true, // Default to paid
        requires_approval: requires_approval ?? true,
        requires_medical_certificate: false, // Default
        max_consecutive_days: null,
        min_advance_notice_days: advance_days_required || 1,
        has_annual_quota: true,
        default_quota_days: max_days,
        allow_carry_forward: carry_forward || false,
        max_carry_forward_days: carry_forward ? (carry_forward_limit || 0) : null,
        is_active: is_active ?? true,
        display_order: 0,
        created_by: user_id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating leave type:', error)
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: 'A leave type with this name or code already exists' 
        }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Failed to create leave type' }, { status: 500 })
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
    console.error('Error in leave types POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions
function mapDatabaseColorToFrontend(dbColor: string): string {
  // Map hex colors to frontend color names
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
  // Map frontend color names to hex colors
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
  // Generate a short code from the name (e.g., "Annual Leave" -> "AL")
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 4) // Max 4 characters
}

function getIconForLeaveType(name: string): string {
  // Generate appropriate icons based on leave type name
  const lowerName = name.toLowerCase()
  if (lowerName.includes('annual') || lowerName.includes('vacation')) return '🏖️'
  if (lowerName.includes('sick') || lowerName.includes('medical')) return '🏥'
  if (lowerName.includes('emergency')) return '🚨'
  if (lowerName.includes('maternity') || lowerName.includes('paternity')) return '👶'
  if (lowerName.includes('study') || lowerName.includes('education')) return '📚'
  if (lowerName.includes('compassionate') || lowerName.includes('bereavement')) return '🕊️'
  return '📋' // Default icon
}
