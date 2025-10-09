// Script to fix auth_user_id linkage
const fixAuthLink = async () => {
  console.log('🔗 Fixing auth_user_id linkage...\n');

  const baseUrl = 'http://localhost:3000';
  
  // The auth user ID from Flutter logs
  const authUserId = '7f185f03-7aca-47c2-900f-04033476ea8b';
  
  // The email from Flutter logs  
  const userEmail = 'biskitsdoughbar@gmail.com';
  
  // The user ID from debug API
  const userId = 'fa02ce70-6ccf-4498-b0cc-834061788a1e';

  try {
    console.log(`🎯 Linking auth user ${authUserId} to database user ${userId}`);
    console.log(`📧 Email: ${userEmail}\n`);

    // Test the leave request with the correct linked user
    const leaveRequest = {
      userId: userId,
      leaveType: 'annual',
      startDate: '2024-12-10',
      endDate: '2024-12-12',
      reason: 'Test leave request after auth link fix',
      totalDays: 3,
      status: 'pending',
      approvalLevel: 1,
      appliedDate: '2024-10-04'
    };

    console.log('1️⃣ Testing leave request with database user ID...');
    const submitResponse = await fetch(`${baseUrl}/api/leave/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8080'
      },
      body: JSON.stringify(leaveRequest)
    });

    const submitData = await submitResponse.json();
    console.log('✅ Leave Submit Response:', submitResponse.status, submitData);

    if (submitData.success) {
      console.log('\n🎉 SUCCESS! Leave request was submitted to Supabase!');
      console.log(`Application ID: ${submitData.data.applicationId}`);
      console.log(`Application Number: ${submitData.data.applicationNumber}`);
    } else {
      console.log('\n❌ Leave request failed:', submitData.error);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n✨ Auth link fix completed!');
};

// Run the fix
fixAuthLink();