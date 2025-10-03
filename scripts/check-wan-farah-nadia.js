const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndUpdateWanFarahNadia() {
  try {
    console.log('🔍 Checking Wan Farah Nadia\'s user data...');
    
    // The correct user ID from the debug output
    const userId = 'b1674744-a7d8-4161-a912-d3592085903d';
    
    // Get full user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('❌ Error fetching user:', userError);
      return;
    }
    
    console.log('✅ Found user:');
    console.log('   Name:', userData.full_name);
    console.log('   Email:', userData.email);
    console.log('   Primary System:', userData.primary_system);
    console.log('   Primary Role:', userData.primary_role);
    console.log('   SmartID TIME Role:', userData.smartid_time_role);
    console.log('   Auth User ID:', userData.auth_user_id);
    console.log('   Institution ID:', userData.institution_id);
    console.log('   Can Access Web Portal:', userData.can_access_web_portal);
    
    // Check if we need to update for TIME portal access
    if (userData.primary_system !== 'time_web' || userData.smartid_time_role !== 'superadmin') {
      console.log('\n📝 Updating user for TIME portal superadmin access...');
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          primary_system: 'time_web',
          primary_role: 'admin',  // Keep as admin since this is what's in the DB
          smartid_time_role: 'superadmin',
          can_access_web_portal: true,
          requires_web_access: true,
          auth_user_id: userId,  // Make sure auth_user_id is set to the Supabase auth ID
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Error updating user:', updateError);
        return;
      }
      
      console.log('✅ Successfully updated user for TIME portal access');
      console.log('   Updated Primary System:', updatedUser.primary_system);
      console.log('   Updated SmartID TIME Role:', updatedUser.smartid_time_role);
    } else {
      console.log('\n✅ User already has TIME portal superadmin access');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkAndUpdateWanFarahNadia();