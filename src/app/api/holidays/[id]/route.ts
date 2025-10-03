import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const body = await request.json()
    const { id: holidayId } = await params

    const {
      name,
      description,
      start_date,
      end_date,
      type,
      recurring
    } = body

    // Validate required fields
    if (!name || !start_date || !end_date) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, start_date, end_date' 
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

    // Update the holiday
    const { data: holiday, error } = await supabase
      .from('institution_holidays')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        holiday_date: start_date,
        end_date: start_date === end_date ? null : end_date, // Only set end_date if different from start
        holiday_type: mapFrontendTypeToDatabase(type),
        is_recurring: recurring || false,
        recurrence_pattern: recurring ? 'yearly' : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', holidayId)
      .select()
      .single()

    if (error) {
      console.error('Error updating holiday:', error)
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: 'A holiday with this name and date already exists' 
        }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Failed to update holiday' }, { status: 500 })
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
    console.error('Error in holidays PATCH API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { id: holidayId } = await params

    // Delete the holiday
    const { error } = await supabase
      .from('institution_holidays')
      .delete()
      .eq('id', holidayId)

    if (error) {
      console.error('Error deleting holiday:', error)
      return NextResponse.json({ error: 'Failed to delete holiday' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Holiday deleted successfully'
    })

  } catch (error) {
    console.error('Error in holidays DELETE API:', error)
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
