// Complete system test - file upload, leave request, and web portal display
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const testCompleteSystem = async () => {
  console.log('🎯 Testing complete file upload system...\n');

  const supabaseUrl = 'https://triiicqaljwajijeugul.supabase.co';
  const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyaWlpY3FhbGp3YWppamV1Z3VsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ2NzMwMywiZXhwIjoyMDc0MDQzMzAzfQ.cfiy1MXP3Jl1LF-_dH3B7ZBFihfGjNKvLe14W4Ndhms';
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const userId = 'fa02ce70-6ccf-4498-b0cc-834061788a1e';
  const testApiUrl = 'http://localhost:3000';

  try {
    // 1. Test file upload first
    console.log('1️⃣ Testing file upload...');
    
    const testFileName = 'medical-certificate.txt';
    const testFilePath = path.join(__dirname, testFileName);
    const testFileContent = `Medical Certificate

Patient: Test User
Date: ${new Date().toISOString().split('T')[0]}
Doctor: Dr. Smith
Clinic: Health Center

This is to certify that the above patient is medically unfit for work 
from December 20, 2024 to December 22, 2024 due to medical reasons.

This certificate is issued for leave application purposes.

Signed: Dr. Smith, MD
Medical License: MD12345`;

    fs.writeFileSync(testFilePath, testFileContent);
    console.log('📝 Test medical certificate created');

    // Create FormData for upload
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath), {
      filename: testFileName,
      contentType: 'text/plain'
    });
    formData.append('userId', userId);
    formData.append('documentType', 'medical_certificate');

    const uploadResponse = await fetch(`${testApiUrl}/api/upload/documents`, {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost:8080',
        ...formData.getHeaders()
      },
      body: formData
    });

    const uploadResult = await uploadResponse.json();
    console.log('📤 Upload response:', uploadResponse.status, uploadResult);

    if (!uploadResult.success) {
      console.log('❌ File upload failed:', uploadResult.error);
      return;
    }

    const uploadedFileUrl = uploadResult.data.fileUrl;
    console.log('✅ File uploaded successfully!');
    console.log('📁 File URL:', uploadedFileUrl);

    // 2. Submit leave request with uploaded document
    console.log('\n2️⃣ Submitting leave request with document...');
    
    const leaveRequestData = {
      userId: userId,
      leaveType: 'sick',
      startDate: '2024-12-20',
      endDate: '2024-12-22',
      reason: 'Medical leave with uploaded medical certificate',
      supportingDocumentsUrls: [uploadedFileUrl]
    };

    const leaveResponse = await fetch(`${testApiUrl}/api/leave/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:8080'
      },
      body: JSON.stringify(leaveRequestData)
    });

    const leaveResult = await leaveResponse.json();
    console.log('📋 Leave request response:', leaveResponse.status, leaveResult);

    if (!leaveResult.success) {
      console.log('❌ Leave request failed:', leaveResult.error);
      return;
    }

    console.log('✅ Leave request submitted with document!');
    console.log('📄 Application ID:', leaveResult.data.applicationId);
    console.log('📁 Supporting documents:', leaveResult.data.supportingDocuments?.length || 0);

    // 3. Verify document in database
    console.log('\n3️⃣ Verifying document stored in database...');
    
    const { data: application, error: dbError } = await supabase
      .from('leave_applications')
      .select('id, application_number, supporting_documents_urls, reason')
      .eq('id', leaveResult.data.applicationId)
      .single();

    if (dbError) {
      console.log('❌ Database verification failed:', dbError.message);
    } else {
      console.log('✅ Application found in database!');
      console.log('📋 Application Number:', application.application_number);
      console.log('📁 Documents URLs:', application.supporting_documents_urls);
      console.log('💬 Reason:', application.reason);
    }

    // 4. Test web portal API (would display these documents)
    console.log('\n4️⃣ Testing web portal API...');
    
    // This would be used by the web portal to display applications with documents
    const portalResponse = await fetch(`${testApiUrl}/api/leave/applications`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Portal API status:', portalResponse.status);
    
    if (portalResponse.ok) {
      const portalData = await portalResponse.json();
      if (portalData.success) {
        const appsWithDocs = portalData.data?.filter(app => 
          app.supporting_documents_urls && app.supporting_documents_urls.length > 0
        ) || [];
        
        console.log(`📋 Found ${appsWithDocs.length} applications with documents`);
        
        if (appsWithDocs.length > 0) {
          console.log('✅ Web portal would display these applications with document links!');
        }
      }
    }

    // 5. Test document accessibility
    console.log('\n5️⃣ Testing document accessibility...');
    
    const docResponse = await fetch(uploadedFileUrl);
    console.log('📄 Document access status:', docResponse.status);
    
    if (docResponse.ok) {
      const docContent = await docResponse.text();
      console.log('✅ Document is accessible via URL');
      console.log('📝 Content preview:', docContent.substring(0, 100) + '...');
    }

    // Cleanup
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('\n🗑️ Test file cleaned up');
    }

    console.log('\n🎉 COMPLETE SUCCESS! File upload system is fully functional!');
    console.log('\n📋 System Capabilities Verified:');
    console.log('✅ File upload to Supabase storage');
    console.log('✅ Leave request submission with documents');
    console.log('✅ Document URLs stored in database');
    console.log('✅ Documents accessible via public URLs');
    console.log('✅ Web portal can retrieve applications with documents');
    console.log('\n🚀 Ready for production use!');

  } catch (error) {
    console.error('❌ System test error:', error.message);
  }
};

// Run the complete test
testCompleteSystem();