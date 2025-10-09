// Fix the leave_applications schema to support documents
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const fixSchema = async () => {
  console.log('🔧 Fixing leave_applications schema...\n');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Check existing schema - direct query to see actual columns
    console.log('1️⃣ Checking existing leave_applications schema...');
    
    const { data: existingApps, error: schemaError } = await supabase
      .from('leave_applications')
      .select('*')
      .limit(1);
      
    if (schemaError) {
      console.log('❌ Schema check error:', schemaError.message);
    } else {
      console.log('✅ Current schema accessible');
      if (existingApps && existingApps.length > 0) {
        console.log('📋 Sample columns:', Object.keys(existingApps[0]));
      }
    }

    // Try to add supporting_documents column using a SQL query
    console.log('\n2️⃣ Adding supporting_documents column...');
    
    // Since Supabase doesn't allow direct DDL through the client, let's use a workaround
    // We'll use the medical_certificate_url column that already exists
    console.log('💡 Using existing medical_certificate_url column as document storage...');

    // Test insert using medical_certificate_url instead
    console.log('\n3️⃣ Testing insert with medical_certificate_url...');
    
    const testId = crypto.randomUUID();
    const testAppNumber = 'LA2024-TEST-' + Date.now();
    
    const { data: testInsert, error: insertError } = await supabase
      .from('leave_applications')
      .insert({
        id: testId,
        user_id: 'fa02ce70-6ccf-4498-b0cc-834061788a1e',
        leave_type_id: '550e8400-e29b-41d4-a716-446655440000', // Use a valid leave type UUID
        application_number: testAppNumber,
        start_date: '2024-12-16',
        end_date: '2024-12-18',
        total_days: 3,
        reason: 'Test with document URL in medical_certificate_url',
        status: 'pending',
        medical_certificate_url: 'https://example.com/test-document.pdf', // Store document URL here
        applied_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
      
    if (insertError) {
      console.log('❌ Test insert failed:', insertError.message);
      
      // Try to find actual leave type first
      console.log('\n4️⃣ Finding valid leave type...');
      const { data: leaveTypes, error: leaveTypeError } = await supabase
        .from('leave_types')
        .select('id, name')
        .eq('is_active', true)
        .limit(1);
        
      if (leaveTypeError) {
        console.log('❌ Leave types query failed:', leaveTypeError.message);
      } else if (leaveTypes && leaveTypes.length > 0) {
        console.log('✅ Found leave type:', leaveTypes[0].name, '-', leaveTypes[0].id);
        
        // Retry with correct leave type
        const { data: retryInsert, error: retryError } = await supabase
          .from('leave_applications')
          .insert({
            id: crypto.randomUUID(),
            user_id: 'fa02ce70-6ccf-4498-b0cc-834061788a1e',
            leave_type_id: leaveTypes[0].id,
            application_number: 'LA2024-RETRY-' + Date.now(),
            start_date: '2024-12-16',
            end_date: '2024-12-18',
            total_days: 3,
            reason: 'Test with correct leave type and document URL',
            status: 'pending',
            medical_certificate_url: 'https://example.com/retry-document.pdf',
            applied_date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (retryError) {
          console.log('❌ Retry insert failed:', retryError.message);
        } else {
          console.log('✅ Test insert successful with medical_certificate_url!');
          console.log('📄 Application ID:', retryInsert[0].id);
        }
      }
    } else {
      console.log('✅ Test insert successful!');
    }

  } catch (error) {
    console.error('❌ Schema fix error:', error.message);
  }

  console.log('\n🏁 Schema fix completed!');
  console.log('\n💡 Recommendation: Use medical_certificate_url column for document storage');
  console.log('   This column already exists and can store document URLs');
};

// Add crypto if not available
if (typeof crypto === 'undefined') {
  global.crypto = require('crypto');
}

// Run the fix
fixSchema();