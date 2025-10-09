// Test script to verify leave API endpoints
const testLeaveAPI = async () => {
  console.log('🧪 Testing Leave API Endpoints...\n');

  const baseUrl = 'http://localhost:3000';
  
  // Test data
  const testUserId = 'fa02ce70-6ccf-4498-b0cc-834061788a1e'; // User: biskitsdoughbar@gmail.com
  const leaveRequest = {
    userId: testUserId,
    leaveType: 'annual',
    startDate: '2024-12-10',
    endDate: '2024-12-12',
    reason: 'Family vacation',
    totalDays: 3,
    status: 'pending',
    approvalLevel: 1,
    appliedDate: '2024-10-04'
  };

  try {
    // Test 1: Submit Leave Request
    console.log('1️⃣ Testing POST /api/leave/request');
    const submitResponse = await fetch(`${baseUrl}/api/leave/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8080'
      },
      body: JSON.stringify(leaveRequest)
    });

    const submitData = await submitResponse.json();
    console.log('✅ Submit Response:', submitResponse.status, submitData);
    
    // Test 2: Get Leave Balance
    console.log('\n2️⃣ Testing GET /api/leave/balance');
    const balanceResponse = await fetch(`${baseUrl}/api/leave/balance?userId=${testUserId}`, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:8080'
      }
    });

    const balanceData = await balanceResponse.json();
    console.log('✅ Balance Response:', balanceResponse.status, balanceData);

    // Test 3: Get Leave History
    console.log('\n3️⃣ Testing GET /api/leave/history');
    const historyResponse = await fetch(`${baseUrl}/api/leave/history?userId=${testUserId}`, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:8080'
      }
    });

    const historyData = await historyResponse.json();
    console.log('✅ History Response:', historyResponse.status, historyData);

    // Test 4: CORS Preflight
    console.log('\n4️⃣ Testing CORS OPTIONS request');
    const corsResponse = await fetch(`${baseUrl}/api/leave/request`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:8080',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    console.log('✅ CORS Response:', corsResponse.status);
    console.log('CORS Headers:', Object.fromEntries(corsResponse.headers));

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }

  console.log('\n✨ Test completed!');
};

// Run the test
testLeaveAPI();