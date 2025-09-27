import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const institutionId = searchParams.get('institution_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!institutionId) {
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching palm activity for institution:', institutionId, 'limit:', limit)
    
    // Check if palm tables exist by trying a simple query first
    try {
      await supabase.from('palm_enrollment_sessions').select('id').limit(1)
    } catch (tableError: any) {
      console.warn('Palm biometric tables not found:', tableError.message)
      // Return empty data if tables don't exist yet
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'Palm biometric tables not initialized yet'
      })
    }

    let enrollmentSessions = []
    let verificationLogs = []
    
    // Try to query palm enrollment sessions for enrollment activities
    try {
      const { data, error: enrollmentError } = await supabase
        .from('palm_enrollment_sessions')
        .select(`
          id,
          user_id,
          hand_type,
          enrollment_type,
          status,
          started_at,
          completed_at,
          final_quality_score,
          users!inner(
            full_name,
            employee_id,
            institution_id
          )
        `)
        .eq('users.institution_id', institutionId)
        .order('started_at', { ascending: false })
        .limit(Math.floor(limit / 2)) // Get half from enrollments

      if (enrollmentError) {
        console.error('Error fetching enrollment sessions:', enrollmentError)
      } else {
        enrollmentSessions = data || []
      }
    } catch (error) {
      console.warn('Palm enrollment sessions table not accessible:', error)
    }

    // Try to query palm verification logs for scan activities  
    try {
      const { data, error: verificationError } = await supabase
        .from('palm_verification_logs')
        .select(`
          id,
          user_id,
          hand_type,
          verification_result,
          confidence_score,
          verification_timestamp,
          verification_purpose,
          system_source,
          users(
            full_name,
            employee_id,
            institution_id
          )
        `)
        .not('users', 'is', null)
        .eq('users.institution_id', institutionId)
        .order('verification_timestamp', { ascending: false })
        .limit(Math.floor(limit / 2)) // Get half from verifications

      if (verificationError) {
        console.error('Error fetching verification logs:', verificationError)
      } else {
        verificationLogs = data || []
      }
    } catch (error) {
      console.warn('Palm verification logs table not accessible:', error)
    }

    // Transform enrollment sessions to activity format
    const enrollmentActivities = (enrollmentSessions || []).map((session: any) => ({
      id: `enroll_${session.id}`,
      type: session.enrollment_type === 're-enrollment' ? 're-enrollment' : 'enrollment',
      user: session.users.full_name,
      employee_id: session.users.employee_id,
      action: session.status === 'completed' 
        ? `${session.hand_type === 'left' ? 'Left' : 'Right'} palm ${session.enrollment_type === 're-enrollment' ? 're-enrolled' : 'enrolled'} successfully`
        : session.status === 'failed'
        ? `${session.hand_type === 'left' ? 'Left' : 'Right'} palm enrollment failed`
        : `${session.hand_type === 'left' ? 'Left' : 'Right'} palm enrollment in progress`,
      timestamp: session.completed_at || session.started_at,
      hand_type: session.hand_type,
      quality_score: session.final_quality_score,
      status: session.status
    }))

    // Transform verification logs to activity format
    const verificationActivities = (verificationLogs || []).map((log: any) => ({
      id: `verify_${log.id}`,
      type: log.verification_result === 'success' ? 'scan' : 'failed',
      user: log.users?.full_name || 'Unknown User',
      employee_id: log.users?.employee_id || '',
      action: log.verification_result === 'success' 
        ? `${log.hand_type === 'left' ? 'Left' : 'Right'} palm scan successful`
        : log.verification_result === 'failed'
        ? `${log.hand_type === 'left' ? 'Left' : 'Right'} palm scan failed`
        : `${log.hand_type === 'left' ? 'Left' : 'Right'} palm scan ${log.verification_result}`,
      timestamp: log.verification_timestamp,
      hand_type: log.hand_type,
      confidence_score: log.confidence_score,
      verification_purpose: log.verification_purpose,
      system_source: log.system_source
    }))

    // Combine and sort all activities by timestamp
    const allActivities = [...enrollmentActivities, ...verificationActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    console.log('Returning palm activities:', allActivities.length)

    return NextResponse.json({
      success: true,
      data: allActivities,
      count: allActivities.length
    })

  } catch (error) {
    console.error('Error in palm activity API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
