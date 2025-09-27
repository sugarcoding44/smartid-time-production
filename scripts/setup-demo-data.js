// Setup script to create demo data for SmartID Registry
// Run this once to populate your database with initial data

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  console.error('Please ensure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDemoData() {
  console.log('🚀 Setting up demo data for SmartID Registry...')
  
  try {
    // 1. Create demo school
    console.log('📚 Creating demo school...')
    const { data: school, error: schoolError } = await supabase
      .from('school_registry')
      .upsert([
        {
          school_name: 'SMK Bukit Jelutong',
          school_code: 'BJ001',
          admin_email: 'admin@smkbukitjelutong.edu.my',
          admin_password_hash: 'handled_by_supabase_auth'
        }
      ], {
        onConflict: 'school_code',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (schoolError) {
      if (schoolError.message.includes('duplicate')) {
        console.log('✅ School already exists, fetching existing school...')
        const { data: existingSchool, error: fetchError } = await supabase
          .from('school_registry')
          .select('*')
          .eq('school_code', 'BJ001')
          .single()
        
        if (fetchError) {
          throw fetchError
        }
        
        console.log(`✅ Using existing school: ${existingSchool.school_name}`)
        // Continue with existing school
      } else {
        throw schoolError
      }
    } else {
      console.log(`✅ Created school: ${school.school_name}`)
    }

    // 2. Get the school ID for creating users
    const { data: schoolData, error: schoolFetchError } = await supabase
      .from('school_registry')
      .select('id')
      .eq('school_code', 'BJ001')
      .single()

    if (schoolFetchError) {
      throw schoolFetchError
    }

    const schoolId = schoolData.id
    console.log(`📋 School ID: ${schoolId}`)

    // 3. Create demo users
    console.log('👥 Creating demo users...')
    const demoUsers = [
      {
        full_name: 'Siti Aminah binti Rahman',
        employee_id: 'TC0001',
        user_type: 'teacher',
        ic_number: '801234567890',
        email: 'siti.aminah@smkbukitjelutong.edu.my',
        phone: '012-345-6789',
        school_id: schoolId,
        palm_id: 'PLM12345',
        smart_card_id: 'CRD67890',
        biometric_enrolled: true,
        card_issued: true,
        is_active: true
      },
      {
        full_name: 'Mohammad bin Abdullah',
        employee_id: 'ST0001',
        user_type: 'staff',
        ic_number: '750987654321',
        email: 'mohammad@smkbukitjelutong.edu.my',
        phone: '019-876-5432',
        school_id: schoolId,
        palm_id: null,
        smart_card_id: 'CRD67891',
        biometric_enrolled: false,
        card_issued: true,
        is_active: true
      },
      {
        full_name: 'Nur Aisyah binti Hassan',
        employee_id: 'SD0001',
        user_type: 'student',
        ic_number: '051234567890',
        email: null,
        phone: '012-345-6789',
        school_id: schoolId,
        palm_id: 'PLM12346',
        smart_card_id: null,
        biometric_enrolled: true,
        card_issued: false,
        is_active: true
      },
      {
        full_name: 'Lim Kai Wei',
        employee_id: 'TC0002',
        user_type: 'teacher',
        ic_number: '851230987654',
        email: 'lim.kaiwei@smkbukitjelutong.edu.my',
        phone: '017-654-3210',
        school_id: schoolId,
        palm_id: 'PLM12347',
        smart_card_id: 'CRD67892',
        biometric_enrolled: true,
        card_issued: true,
        is_active: true
      }
    ]

    const { data: users, error: usersError } = await supabase
      .from('school_users')
      .upsert(demoUsers, {
        onConflict: 'employee_id',
        ignoreDuplicates: true
      })
      .select()

    if (usersError) {
      console.warn('⚠️  Some users might already exist:', usersError.message)
    } else {
      console.log(`✅ Created ${users?.length || demoUsers.length} demo users`)
    }

    console.log('\n🎉 Demo data setup completed successfully!')
    console.log('\nYou can now:')
    console.log('- Visit http://localhost:3000/dashboard/users to see the users')
    console.log('- Add new users through the UI')
    console.log('- Test palm enrollment and card issuance features')
    
  } catch (error) {
    console.error('❌ Error setting up demo data:', error)
    process.exit(1)
  }
}

// Run the setup
setupDemoData()
