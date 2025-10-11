import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// CORS handler
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('🔐 Environment check:')
    console.log('  - Supabase URL exists:', !!supabaseUrl)
    console.log('  - Service role key exists:', !!serviceRoleKey)
    console.log('  - Service role key length:', serviceRoleKey?.length || 0)
    console.log('  - Service role key prefix:', serviceRoleKey?.substring(0, 20) + '...')
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase configuration',
        details: {
          has_url: !!supabaseUrl,
          has_service_key: !!serviceRoleKey
        }
      }, { status: 500, headers: corsHeaders() })
    }
    
    // Use service role to bypass RLS
    const serviceSupabase = createServiceClient(supabaseUrl, serviceRoleKey)

    const body = await request.json()
    const { card_uid, card_id } = body

    console.log('🔍 Debug: Checking enrollments for card UID:', card_uid)

    // First, find ALL cards with this UID (there might be duplicates)
    const { data: allCards, error: allCardsError } = await serviceSupabase
      .from('smartid_cards')
      .select('id, card_uid, card_number, institution_id, created_at')
      .eq('card_uid', card_uid)
      .order('created_at', { ascending: true }) // Oldest first
    
    console.log('📊 All cards with this UID:', allCards)
    console.log('📊 Total cards found:', allCards?.length || 0)

    if (allCardsError || !allCards || allCards.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No cards found with this UID',
        card_uid,
        error: allCardsError
      }, { headers: corsHeaders() })
    }

    // Check each card for enrollments and use the first one that has enrollments
    let finalCard = null
    let finalEnrollments = []
    
    console.log(`🔍 Checking ${allCards.length} card(s) for enrollments...`)
    
    for (const card of allCards) {
      console.log(`  ➡️ Checking card ID ${card.id} (${card.card_number})...`)
      
      // First try a simple query without relations
      console.log(`    🔍 Trying simple SELECT * query...`)
      const { data: simpleEnrollments, error: simpleError } = await serviceSupabase
        .from('card_enrollments')
        .select('*')
        .eq('card_id', card.id)
      
      console.log(`    📊 Simple query result:`, {
        count: simpleEnrollments?.length || 0,
        error: simpleError ? JSON.stringify(simpleError) : null,
        data_preview: simpleEnrollments?.slice(0, 1)
      })
      
      // Then try with user relation
      console.log(`    🔍 Trying query with user relation...`)
      const { data: enrollments, error: enrollError } = await serviceSupabase
        .from('card_enrollments')
        .select(`
          id,
          card_id,
          user_id,
          institution_id,
          enrollment_status,
          enrollment_date,
          access_level,
          enrollment_reason,
          users(id, full_name, employee_id, email, ic_number)
        `)
        .eq('card_id', card.id)
        .order('enrollment_date', { ascending: false })
      
      console.log(`    📊 With relation query result:`, { 
        enrollments_count: enrollments?.length || 0, 
        error: enrollError ? JSON.stringify(enrollError) : null,
        raw_data: JSON.stringify(enrollments, null, 2)
      })
      
      if (enrollError) {
        console.error(`    ❌ Query error:`, enrollError)
      }
      
      // Use whichever query succeeded
      let finalEnrollmentsForCard = enrollments && enrollments.length > 0 ? enrollments : simpleEnrollments
      
      if (finalEnrollmentsForCard && finalEnrollmentsForCard.length > 0) {
        console.log(`    ✅ Found ${finalEnrollmentsForCard.length} enrollment(s)!`)
        
        // If enrollments don't have user data (simple query was used), fetch users separately
        if (finalEnrollmentsForCard[0] && !finalEnrollmentsForCard[0].users) {
          console.log(`    🔍 Fetching user data separately...`)
          
          const enrichedEnrollments = []
          for (const enrollment of finalEnrollmentsForCard) {
            const { data: userData } = await serviceSupabase
              .from('users')
              .select('id, full_name, employee_id, email, ic_number')
              .eq('id', enrollment.user_id)
              .single()
            
            enrichedEnrollments.push({
              ...enrollment,
              users: userData
            })
          }
          
          console.log(`    ✅ Enriched with user data`)
          finalEnrollmentsForCard = enrichedEnrollments
        }
        
        finalCard = card
        finalEnrollments = finalEnrollmentsForCard
        break // Use the first card that has enrollments
      } else {
        console.log(`    ⚠️ No enrollments found for this card.`)
      }
    }
    
    // If no card has enrollments, use the oldest card
    if (!finalCard) {
      console.log(`⚠️ No cards have enrollments. Using oldest card.`)
      finalCard = allCards[0]
      finalEnrollments = []
    }
    
    console.log('🎯 Final result:')
    console.log('  - Card:', finalCard)
    console.log('  - Enrollments:', finalEnrollments.length)
    
    return NextResponse.json({
      success: true,
      card_data: finalCard,
      enrollments: finalEnrollments,
      enrollment_count: finalEnrollments.length,
      debug_info: {
        all_cards: allCards.map(c => ({ id: c.id, card_number: c.card_number })),
        total_cards_found: allCards.length,
        card_institution_id: finalCard.institution_id,
        enrollments_institutions: finalEnrollments.map(e => e.institution_id)
      }
    }, { headers: corsHeaders() })

  } catch (error) {
    console.error('❌ Debug query error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: `Debug query failed: ${error}`,
        message: 'Failed to query card enrollments'
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}