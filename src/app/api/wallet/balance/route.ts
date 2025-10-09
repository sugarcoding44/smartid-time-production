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
    const employeeId = searchParams.get('employeeId')
    
    if (!userId && !employeeId) {
      return NextResponse.json(
        { error: 'userId or employeeId is required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log(`💰 Fetching wallet balance for ${employeeId || userId}`)

    // For now, return mock data since wallet functionality isn't implemented
    const mockBalance = {
      balance: 150.75,
      lastUpdated: new Date().toISOString(),
      currency: 'MYR'
    }

    return NextResponse.json({
      success: true,
      data: mockBalance
    }, {
      headers: corsHeaders()
    })

  } catch (error) {
    console.error('❌ Wallet balance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    )
  }
}