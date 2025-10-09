// Complete fix script - both Supabase function and auth linkage
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const completeFix = async () => {
  console.log('🔧 Starting complete system fix...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing Supabase environment variables.');
    console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('1️⃣ Reading and executing Supabase function fix...');
    
    // Read the SQL function fix
    const sqlFix = fs.readFileSync(path.join(__dirname, 'fix-supabase-function.sql'), 'utf8');
    
    // Execute the function fix via Supabase
    const { error: functionError } = await supabase.rpc('query', {
      query: sqlFix
    });
    
    if (functionError) {
      console.log('⚠️ Function fix via RPC failed, this is expected. Function may need manual database update.');
      console.log('Function error:', functionError.message);
    } else {
      console.log('✅ Supabase function updated successfully!');
    }

    console.log('\n2️⃣ Fixing auth_user_id linkage for current user...');
    
    const authUserId = '7f185f03-7aca-47c2-900f-04033476ea8b';
    const userId = 'fa02ce70-6ccf-4498-b0cc-834061788a1e';
    
    // Update the user record to link auth_user_id
    const { error: updateError } = await supabase
      .from('users')
      .update({ auth_user_id: authUserId })
      .eq('id', userId);
    
    if (updateError) {
      console.log('❌ Failed to update auth_user_id linkage:', updateError.message);
    } else {
      console.log('✅ Auth user linkage fixed successfully!');
      console.log(`🔗 Linked auth user ${authUserId} to database user ${userId}`);
    }

    console.log('\n3️⃣ Testing the fixed system...');
    
    // Test with the API call
    const testUrl = 'http://localhost:3000/api/leave/request';
    const testData = {
      userId: userId,
      leaveType: 'annual',
      startDate: '2024-12-10',
      endDate: '2024-12-12',
      reason: 'Test leave after complete system fix',
      totalDays: 3,
      status: 'pending',
      approvalLevel: 1,
      appliedDate: '2024-10-04'
    };

    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8080'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('🧪 API Test Result:', response.status, result);

    if (result.success) {
      console.log('\n🎉 COMPLETE SUCCESS! Leave system is now fully functional!');
      console.log(`📄 Application ID: ${result.data.applicationId}`);
      console.log(`🔢 Application Number: ${result.data.applicationNumber}`);
      console.log('✨ Users can now submit leave requests from the mobile app!');
    } else {
      console.log('\n⚠️ API test still failing:', result.error);
      console.log('Additional troubleshooting may be needed.');
    }

  } catch (error) {
    console.error('❌ Error during system fix:', error.message);
  }

  console.log('\n🏁 Complete fix process finished!');
};

// Run the complete fix
completeFix();