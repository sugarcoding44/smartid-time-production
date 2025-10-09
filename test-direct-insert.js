// Test direct insert to bypass function conflicts
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const testDirectInsert = async () => {
  console.log('🧪 Testing direct leave application insert...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const authUserId = '7f185f03-7aca-47c2-900f-04033476ea8b';
  const userId = 'fa02ce70-6ccf-4498-b0cc-834061788a1e';

  try {
    // 1. Verify user lookup by auth_user_id now works
    console.log('1️⃣ Testing user lookup by auth_user_id...');
    const { data: userByAuth, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, auth_user_id')
      .eq('auth_user_id', authUserId)
      .single();

    if (userError) {
      console.log('❌ User lookup by auth_user_id failed:', userError.message);
    } else {
      console.log('✅ User found by auth_user_id!');
      console.log('👤 User:', userByAuth.full_name, '-', userByAuth.email);
      console.log('🆔 Database ID:', userByAuth.id);
    }

    // 2. Find a leave type
    console.log('\n2️⃣ Finding available leave types...');
    const { data: leaveTypes, error: leaveTypeError } = await supabase
      .from('leave_types')
      .select('id, name, is_active')
      .eq('is_active', true)
      .limit(1);

    if (leaveTypeError || !leaveTypes?.length) {
      console.log('❌ No active leave types found');
      return;
    }

    const leaveType = leaveTypes[0];
    console.log('📋 Using leave type:', leaveType.name);

    // 3. Generate application number
    const appNumber = 'LA2024-' + Date.now();

    // 4. Direct insert into leave_applications
    console.log('\n3️⃣ Directly inserting leave application...');
    const { data: newApp, error: insertError } = await supabase
      .from('leave_applications')
      .insert({
        id: crypto.randomUUID(),
        user_id: userId,
        leave_type_id: leaveType.id,
        application_number: appNumber,
        start_date: '2024-12-10',
        end_date: '2024-12-12',
        total_days: 3,
        reason: 'Test leave - direct insert method',
        status: 'pending',
        half_day_start: false,
        half_day_end: false,
        applied_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Direct insert failed:', insertError.message);
    } else {
      console.log('✅ Leave application inserted successfully!');
      console.log('📄 Application ID:', newApp.id);
      console.log('🔢 Application Number:', newApp.application_number);
    }

    // 5. Create approval workflow entry
    console.log('\n4️⃣ Creating approval workflow entry...');
    const { error: workflowError } = await supabase
      .from('leave_approval_workflow')
      .insert({
        id: crypto.randomUUID(),
        leave_application_id: newApp.id,
        approver_level: 1,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (workflowError) {
      console.log('⚠️ Approval workflow insert failed:', workflowError.message);
    } else {
      console.log('✅ Approval workflow entry created!');
    }

    // 6. Test the web portal API for listing applications
    console.log('\n5️⃣ Testing web portal applications API...');
    const response = await fetch('http://localhost:3000/api/leave/applications', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const applications = await response.json();
    console.log('📊 Applications API Response:', response.status);
    
    if (applications.success) {
      console.log(`📋 Found ${applications.data.length} leave applications`);
      const ourApp = applications.data.find(app => app.application_number === appNumber);
      if (ourApp) {
        console.log('🎯 Our new application found in the list!');
        console.log('👤 Applicant:', ourApp.user_name);
        console.log('📅 Dates:', ourApp.start_date, 'to', ourApp.end_date);
      }
    } else {
      console.log('❌ Applications API failed:', applications.error);
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }

  console.log('\n🏁 Direct insert test completed!');
};

// Add crypto for UUID generation
if (typeof crypto === 'undefined') {
  global.crypto = require('crypto');
}

// Run the test
testDirectInsert();