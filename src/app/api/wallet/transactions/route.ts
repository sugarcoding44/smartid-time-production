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

    console.log(`💰 Fetching wallet transactions for ${employeeId || userId}`)

    // Return mock transaction data
    const mockTransactions = [
      {
        id: '1',
        type: 'credit',
        amount: 50.00,
        description: 'Monthly allowance',
        date: new Date(Date.now() - 24*60*60*1000).toISOString(),
        status: 'completed'
      },
      {
        id: '2', 
        type: 'debit',
        amount: -12.50,
        description: 'Cafeteria payment',
        date: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
        status: 'completed'
      },
      {
        id: '3',
        type: 'credit',
        amount: 25.00,
        description: 'Bonus credit',
        date: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
        status: 'completed'
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockTransactions
    }, {
      headers: corsHeaders()
    })

  } catch (error) {
    console.error('❌ Wallet transactions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    )
  }
}