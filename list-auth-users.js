const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function listAuthUsers() {
  try {
    console.log('🔍 Fetching authenticated users from Supabase...\n')
    
    // Get all authenticated users
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error('❌ Error fetching users:', error)
      return
    }

    if (!data.users || data.users.length === 0) {
      console.log('❌ No authenticated users found in Supabase Auth')
      return
    }

    console.log(`✅ Found ${data.users.length} authenticated user(s):\n`)

    data.users.forEach((user, index) => {
      console.log(`👤 User ${index + 1}:`)
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   🆔 ID: ${user.id}`)
      console.log(`   ✅ Email Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
      console.log(`   📅 Created: ${new Date(user.created_at).toLocaleString()}`)
      console.log(`   📊 Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`)
      
      if (user.user_metadata && Object.keys(user.user_metadata).length > 0) {
        console.log(`   📋 Metadata:`, user.user_metadata)
      }
      
      console.log('') // Empty line for spacing
    })

    // Also check database users table
    console.log('🔍 Checking database users table...\n')
    
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('id, full_name, email, auth_user_id, employee_id, primary_role, institution_id')
      .limit(10)

    if (dbError) {
      console.error('❌ Error fetching database users:', dbError)
    } else if (dbUsers && dbUsers.length > 0) {
      console.log(`✅ Found ${dbUsers.length} user(s) in database:\n`)
      
      dbUsers.forEach((dbUser, index) => {
        console.log(`👥 DB User ${index + 1}:`)
        console.log(`   📧 Email: ${dbUser.email}`)
        console.log(`   👤 Name: ${dbUser.full_name}`)
        console.log(`   🆔 DB ID: ${dbUser.id}`)
        console.log(`   🔗 Auth User ID: ${dbUser.auth_user_id || 'Not linked'}`)
        console.log(`   👔 Role: ${dbUser.primary_role}`)
        console.log(`   🏢 Employee ID: ${dbUser.employee_id}`)
        console.log('') // Empty line for spacing
      })
    } else {
      console.log('❌ No users found in database')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

listAuthUsers()