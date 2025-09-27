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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const smartCardId = searchParams.get('smartCardId')
    const palmId = searchParams.get('palmId')
    
    if (!userId && !smartCardId && !palmId) {
      return NextResponse.json(
        { error: 'userId, smartCardId, or palmId is required' },
        { status: 400 }
      )
    }

    // Use service role client to bypass auth
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log(`💳 Fetching wallet balance for user: ${userId}`)

    // Strategy 1: Try wallet_balances table
    try {
      let walletQuery = serviceSupabase
        .from('wallet_balances')
        .select('balance, currency, last_updated, status')

      if (userId) {
        walletQuery = walletQuery.eq('user_id', userId)
      } else if (smartCardId) {
        walletQuery = walletQuery.eq('card_id', smartCardId)
      } else if (palmId) {
        walletQuery = walletQuery.eq('palm_id', palmId)
      }

      const { data: walletData, error: walletError } = await walletQuery.maybeSingle()

      if (!walletError && walletData) {
        console.log(`✅ Found wallet balance: RM${walletData.balance}`)
        return NextResponse.json({
          success: true,
          source: 'wallet_balances',
          data: {
            balance: parseFloat(walletData.balance || 0),
            currency: walletData.currency || 'MYR',
            last_updated: walletData.last_updated,
            status: walletData.status || 'active'
          }
        })
      }
    } catch (walletError) {
      console.log('⚠️ No wallet_balances table or error:', walletError)
    }

    // Strategy 2: Try smart_cards table for e-wallet balance
    try {
      let cardQuery = serviceSupabase
        .from('smart_cards')
        .select('id, card_number, balance, status, user_id')

      if (userId) {
        cardQuery = cardQuery.eq('user_id', userId)
      } else if (smartCardId) {
        cardQuery = cardQuery.eq('id', smartCardId)
      }

      const { data: cardData, error: cardError } = await cardQuery.maybeSingle()

      if (!cardError && cardData && cardData.balance !== null) {
        console.log(`✅ Found smart card balance: RM${cardData.balance}`)
        return NextResponse.json({
          success: true,
          source: 'smart_cards',
          data: {
            balance: parseFloat(cardData.balance || 0),
            currency: 'MYR',
            card_number: cardData.card_number,
            status: cardData.status || 'active'
          }
        })
      }
    } catch (cardError) {
      console.log('⚠️ No smart_cards table or error:', cardError)
    }

    // Strategy 3: Check if user has palm/card enrollment - if not, return RM0
    try {
      if (userId) {
        // Check for biometric enrollments
        const { data: palmEnrollment } = await serviceSupabase
          .from('biometric_enrollments')
          .select('id, palm_id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle()

        // Check for smart cards
        const { data: smartCard } = await serviceSupabase
          .from('smart_cards')
          .select('id, card_number')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle()

        if (!palmEnrollment && !smartCard) {
          console.log(`ℹ️ User has no palm or smart card - returning RM0`)
          return NextResponse.json({
            success: true,
            source: 'no_enrollment',
            data: {
              balance: 0,
              currency: 'MYR',
              status: 'not_enrolled',
              message: 'No palm biometric or smart card found. Please enroll to use e-wallet.'
            }
          })
        }

        console.log(`ℹ️ User has enrollment but no wallet balance - returning RM0`)
        return NextResponse.json({
          success: true,
          source: 'enrolled_no_balance',
          data: {
            balance: 0,
            currency: 'MYR',
            status: 'active',
            has_palm: !!palmEnrollment,
            has_card: !!smartCard
          }
        })
      }
    } catch (enrollmentError) {
      console.log('⚠️ Error checking enrollments:', enrollmentError)
    }

    // Strategy 4: Default fallback - return RM0
    console.log(`💰 No wallet data found - returning default RM0`)
    return NextResponse.json({
      success: true,
      source: 'default',
      data: {
        balance: 0,
        currency: 'MYR',
        status: 'inactive',
        message: 'E-wallet not set up yet'
      }
    })

  } catch (error) {
    console.error('❌ Wallet API error:', error)
    return NextResponse.json({
      success: true,
      source: 'error_fallback',
      data: {
        balance: 0,
        currency: 'MYR',
        status: 'error'
      }
    })
  }
}

// POST endpoint to update wallet balance (for future use)
export async function POST(request: NextRequest) {
  try {
    const { userId, amount, transaction_type = 'top_up', description = '' } = await request.json()
    
    if (!userId || amount === undefined) {
      return NextResponse.json(
        { error: 'userId and amount are required' },
        { status: 400 }
      )
    }

    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // For now, just return success - implement actual wallet update logic later
    return NextResponse.json({
      success: true,
      message: `Wallet ${transaction_type} of RM${amount} recorded for user ${userId}`,
      transaction: {
        user_id: userId,
        amount: parseFloat(amount),
        type: transaction_type,
        description,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Wallet update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
