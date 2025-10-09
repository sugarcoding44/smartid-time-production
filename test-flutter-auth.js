// Test what auth user ID the Flutter app might be using
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAuthUsers() {
  console.log('🔍 Checking available users and their auth IDs...\n');

  try {
    // List all users in the users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, auth_user_id, full_name, email, employee_id, status')
      .eq('status', 'active')
      .limit(10);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    console.log('👥 Available users:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.full_name}`);
      console.log(`     Email: ${user.email}`);
      console.log(`     Employee ID: ${user.employee_id}`);
      console.log(`     Database ID: ${user.id}`);
      console.log(`     Auth User ID: ${user.auth_user_id}`);
      console.log('');
    });

    // Test each user's auth_user_id with the API
    for (const user of users) {
      if (user.auth_user_id) {
        console.log(`🧪 Testing API with ${user.full_name} (${user.auth_user_id})...`);
        
        try {
          const response = await fetch(`http://localhost:3000/api/leave/history?userId=${user.auth_user_id}`, {
            headers: { 'Origin': 'http://localhost:8080' }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ API works! Found ${data.data?.length || 0} leave applications`);
            
            if (data.data && data.data.length > 0) {
              console.log('📋 Leave applications:');
              data.data.slice(0, 3).forEach((app, i) => {
                console.log(`  ${i + 1}. ${app.applicationNumber} - ${app.leaveType} (${app.status})`);
              });
              if (data.data.length > 3) {
                console.log(`  ... and ${data.data.length - 3} more`);
              }
            }
          } else {
            console.log(`❌ API failed with status: ${response.status}`);
          }
        } catch (e) {
          console.log(`❌ API test failed: ${e.message}`);
        }
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAuthUsers();