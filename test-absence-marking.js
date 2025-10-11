// Test script for the automatic absence marking system
// Run this to test the absence marking functionality

const API_BASE_URL = 'http://localhost:3000'; // Update with your actual URL

async function testAbsenceMarking() {
  console.log('🧪 Testing Absence Marking System...\n');
  
  try {
    // Test with dry run first
    console.log('1. Testing dry run (simulation mode)...');
    const dryRunResponse = await fetch(`${API_BASE_URL}/api/attendance/mark-absent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: new Date().toISOString().split('T')[0], // Today
        dryRun: true // Simulation mode
      })
    });
    
    const dryRunResult = await dryRunResponse.json();
    console.log('Dry run result:', JSON.stringify(dryRunResult, null, 2));
    
    if (dryRunResult.success) {
      console.log(`✅ Dry run successful! Would mark ${dryRunResult.stats.marked_absent} users as absent`);
      
      // Uncomment the following to run the actual marking
      /*
      console.log('\n2. Running actual absence marking...');
      const liveResponse = await fetch(`${API_BASE_URL}/api/attendance/mark-absent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0], // Today
          dryRun: false // Live mode
        })
      });
      
      const liveResult = await liveResponse.json();
      console.log('Live result:', JSON.stringify(liveResult, null, 2));
      
      if (liveResult.success) {
        console.log(`✅ Successfully marked ${liveResult.stats.marked_absent} users as absent`);
      } else {
        console.error('❌ Live run failed:', liveResult.error);
      }
      */
    } else {
      console.error('❌ Dry run failed:', dryRunResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testAbsenceDocumentation() {
  console.log('\n🧪 Testing Absence Documentation Submission...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/attendance/submit-absence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'your-test-user-id', // Replace with actual user ID
        date: new Date().toISOString().split('T')[0],
        reason: 'Medical emergency - had to visit hospital',
        absenceType: 'emergency',
        contactNumber: '+60123456789',
        additionalNotes: 'Available for contact after 2 PM',
        documentation: [] // Could include file URLs here
      })
    });
    
    const result = await response.json();
    console.log('Documentation submission result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Absence documentation submitted successfully!');
    } else {
      console.error('❌ Documentation submission failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Schedule information
function showSchedulingInfo() {
  console.log('\n📅 Scheduling the Absence Marking System:\n');
  console.log('To automatically run absence marking daily, you can:');
  console.log('');
  console.log('1. Set up a cron job (Linux/Mac):');
  console.log('   # Run every weekday at 6 PM');
  console.log('   0 18 * * 1-5 curl -X POST http://localhost:3000/api/attendance/mark-absent -H "Content-Type: application/json" -d \'{"dryRun": false}\'');
  console.log('');
  console.log('2. Use Windows Task Scheduler:');
  console.log('   - Create a new task that runs daily');
  console.log('   - Set it to run a PowerShell script that calls the API');
  console.log('');
  console.log('3. Use Supabase Edge Functions or Vercel Cron:');
  console.log('   - Set up a scheduled function that calls the mark-absent API');
  console.log('');
  console.log('4. Use a service like GitHub Actions with cron:');
  console.log('   - Create a workflow that runs on schedule');
  console.log('');
  console.log('Recommended: Run every weekday at 6 PM (after work hours)');
}

// Run the tests
testAbsenceMarking();
// testAbsenceDocumentation(); // Uncomment to test documentation submission
showSchedulingInfo();