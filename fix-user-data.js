// Fix user data inconsistency - create missing user record
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local if available
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  console.log('No .env.local file found, using environment variables');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserData() {
  console.log('🔍 Checking user data consistency...\n');

  const testUserId = 'fa02ce70-6ccf-4498-b0cc-834061788a1e';
  const institutionId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  try {
    // 1. Check if user exists in users table
    console.log('1️⃣ Checking if user exists in users table...');
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUserId)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('❌ Error checking user:', userError.message);
      return;
    }

    if (existingUser) {
      console.log('✅ User already exists:', existingUser.full_name);
    } else {
      console.log('❌ User does not exist in users table');
      
      // 2. Check leave applications with this user ID
      console.log('\n2️⃣ Checking leave applications for this user...');
      const { data: leaveApps, error: leaveError } = await supabase
        .from('leave_applications')
        .select('id, application_number, user_id')
        .eq('user_id', testUserId);

      if (leaveError) {
        console.error('❌ Error checking leave applications:', leaveError.message);
        return;
      }

      console.log(`📋 Found ${leaveApps?.length || 0} leave applications for user ${testUserId}`);
      
      if (leaveApps && leaveApps.length > 0) {
        console.log('\n3️⃣ Creating missing user record...');
        
        // Create the user record
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: testUserId,
            full_name: 'Test User (Generated)',
            email: 'testuser@example.com',
            employee_id: 'TEST001',
            institution_id: institutionId,
            primary_system: 'time_web',
            primary_role: 'employee',
            smartid_time_role: 'user',
            status: 'active',
            ic_number: '123456789012',
            phone: '+60123456789',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating user:', createError.message);
          return;
        }

        console.log('✅ User created successfully:', newUser.full_name);
      }
    }

    // 3. Test the history API now
    console.log('\n4️⃣ Testing leave history API...');
    const response = await fetch(`http://localhost:3000/api/leave/history?userId=${testUserId}`, {
      headers: { 'Origin': 'http://localhost:8080' }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ History API working!');
      console.log(`📊 Found ${data.data?.length || 0} leave applications`);
      
      if (data.data && data.data.length > 0) {
        console.log('\n📋 Leave Applications:');
        data.data.forEach((app, index) => {
          console.log(`  ${index + 1}. ${app.applicationNumber} - ${app.leaveType} (${app.status})`);
        });
      }
    } else {
      console.log('❌ History API still failing:', response.status);
      const errorData = await response.text();
      console.log('Error response:', errorData);
    }

    // 4. Check institutions
    console.log('\n5️⃣ Checking institution...');
    const { data: institution, error: instError } = await supabase
      .from('institutions')
      .select('id, name')
      .eq('id', institutionId)
      .single();

    if (instError) {
      console.log('❌ Institution not found:', instError.message);
    } else {
      console.log('✅ Institution found:', institution.name);
    }

  } catch (error) {
    console.error('❌ Script error:', error.message);
  }

  console.log('\n🏁 User data fix completed!');
}

// Run the fix
fixUserData();