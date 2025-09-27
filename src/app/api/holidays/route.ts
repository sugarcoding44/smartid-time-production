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
    const year = searchParams.get('year')
    const type = searchParams.get('type')

    if (!institutionId) {
      return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 })
    }

    // Build query
    let query = supabase
      .from('institution_holidays')
      .select(`
        id,
        name,
        description,
        holiday_date,
        end_date,
        holiday_type,
        is_working_day,
        is_paid,
        is_recurring,
        recurrence_pattern,
        affected_work_groups,
        created_at,
        created_by
      `)
      .eq('institution_id', institutionId)
      .order('holiday_date', { ascending: true })

    // Apply filters
    if (year && year !== 'all') {
      // Filter by year using date functions
      const yearInt = parseInt(year)
      if (!isNaN(yearInt)) {
        query = query
          .gte('holiday_date', `${yearInt}-01-01`)
          .lte('holiday_date', `${yearInt}-12-31`)
      }
    }

    if (type && type !== 'all') {
      query = query.eq('holiday_type', type)
    }

    const { data: holidays, error } = await query

    if (error) {
      console.error('Error fetching holidays:', error)
      return NextResponse.json({ error: 'Failed to fetch holidays' }, { status: 500 })
    }

    // Format the response to match frontend expectations
    const formattedHolidays = holidays?.map(holiday => ({
      id: holiday.id,
      name: holiday.name,
      description: holiday.description,
      start_date: holiday.holiday_date,
      end_date: holiday.end_date || holiday.holiday_date, // Use start date if end date is null
      type: mapDatabaseTypeToFrontend(holiday.holiday_type),
      recurring: holiday.is_recurring || false,
      created_at: holiday.created_at,
      created_by: holiday.created_by
    })) || []

    return NextResponse.json({
      success: true,
      data: formattedHolidays
    })

  } catch (error) {
    console.error('Error in holidays API:', error)
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
      start_date,
      end_date,
      type,
      recurring,
      user_id
    } = body

    // Validate required fields
    if (!institution_id || !name || !start_date || !end_date) {
      return NextResponse.json({ 
        error: 'Missing required fields: institution_id, name, start_date, end_date' 
      }, { status: 400 })
    }

    // Validate dates
    const startDate = new Date(start_date)
    const endDate = new Date(end_date)
    if (startDate > endDate) {
      return NextResponse.json({ 
        error: 'End date must be after or equal to start date' 
      }, { status: 400 })
    }

    // Create the holiday
    const { data: holiday, error } = await supabase
      .from('institution_holidays')
      .insert({
        institution_id,
        name: name.trim(),
        description: description?.trim() || null,
        holiday_date: start_date,
        end_date: start_date === end_date ? null : end_date, // Only set end_date if different from start
        holiday_type: mapFrontendTypeToDatabase(type),
        is_working_day: false, // Default to non-working day
        is_paid: true, // Default to paid holiday
        is_recurring: recurring || false,
        recurrence_pattern: recurring ? 'yearly' : null,
        created_by: user_id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating holiday:', error)
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: 'A holiday with this name and date already exists' 
        }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Failed to create holiday' }, { status: 500 })
    }

    // Format the response
    const formattedHoliday = {
      id: holiday.id,
      name: holiday.name,
      description: holiday.description,
      start_date: holiday.holiday_date,
      end_date: holiday.end_date || holiday.holiday_date,
      type: mapDatabaseTypeToFrontend(holiday.holiday_type),
      recurring: holiday.is_recurring || false,
      created_at: holiday.created_at,
      created_by: holiday.created_by
    }

    return NextResponse.json({
      success: true,
      data: formattedHoliday
    })

  } catch (error) {
    console.error('Error in holidays POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions
function mapDatabaseTypeToFrontend(dbType: string): string {
  // Map database holiday types to frontend types
  const typeMap: { [key: string]: string } = {
    'public': 'public',
    'school': 'school', 
    'custom': 'cultural' // Map custom to cultural for frontend compatibility
  }
  return typeMap[dbType] || 'public'
}

function mapFrontendTypeToDatabase(frontendType: string): string {
  // Map frontend types to database holiday types
  const typeMap: { [key: string]: string } = {
    'public': 'public',
    'school': 'school',
    'religious': 'custom', // Map religious to custom
    'cultural': 'custom' // Map cultural to custom
  }
  return typeMap[frontendType] || 'public'
}
