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

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...')
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@smartiddemo.edu.my',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin User'
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ User already exists in Supabase Auth')
        // Try to get the existing user
        const { data: users } = await supabase.auth.admin.listUsers()
        const existingUser = users.users.find(u => u.email === 'admin@smartiddemo.edu.my')
        if (existingUser) {
          console.log('📧 Existing user:', existingUser.email)
          console.log('🆔 User ID:', existingUser.id)
        }
        return
      } else {
        throw authError
      }
    }

    console.log('✅ Auth user created:', authData.user.email)
    console.log('🆔 User ID:', authData.user.id)

    // Update the database user record with the auth_user_id
    const { error: updateError } = await supabase
      .from('users')
      .update({ auth_user_id: authData.user.id })
      .eq('email', 'admin@smartiddemo.edu.my')

    if (updateError) {
      console.error('❌ Failed to update user record:', updateError)
    } else {
      console.log('✅ Database user record updated with auth_user_id')
    }

    console.log('\n🎉 Test user ready!')
    console.log('📧 Email: admin@smartiddemo.edu.my')
    console.log('🔑 Password: admin123')

  } catch (error) {
    console.error('❌ Error creating test user:', error)
  }
}

// Also create the existing mobile user if needed
async function createMobileTestUser() {
  try {
    console.log('🔧 Creating mobile test user...')
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'biskitsdoughbar@gmail.com',
      password: 'test123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Wan Azizah'
      }
    })

    if (authError && !authError.message.includes('already registered')) {
      throw authError
    }

    console.log('✅ Mobile test user ready!')
    console.log('📧 Email: biskitsdoughbar@gmail.com')
    console.log('🔑 Password: test123')

  } catch (error) {
    console.error('❌ Error creating mobile test user:', error)
  }
}

async function main() {
  await createTestUser()
  await createMobileTestUser()
  
  console.log('\n📝 You can now login to the web portal with:')
  console.log('   Email: admin@smartiddemo.edu.my')
  console.log('   Password: admin123')
  console.log('\n📱 Or mobile test user:')
  console.log('   Email: biskitsdoughbar@gmail.com') 
  console.log('   Password: test123')
}

main()