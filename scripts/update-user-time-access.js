const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateUserForTimeAccess() {
  try {
    console.log('🔍 Updating user for TIME portal access...');
    
    const authUserId = '7a4d71fa-6fad-418c-978f-1142468960ff';
    
    // Update the user to have TIME portal access
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        primary_system: 'time_web',  // Set to time_web for TIME portal superadmins
        primary_role: 'superadmin',  // Set role to superadmin
        smartid_time_role: 'superadmin',  // Explicitly set TIME role
        can_access_web_portal: true, // Allow web portal access
        requires_web_access: true,   // Mark as requiring web access
        updated_at: new Date().toISOString()
      })
      .eq('auth_user_id', authUserId)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Error updating user:', updateError);
      return;
    }
    
    console.log('✅ Successfully updated user for TIME portal access');
    console.log('   User ID:', updatedUser.id);
    console.log('   Name:', updatedUser.full_name);
    console.log('   Primary System:', updatedUser.primary_system);
    console.log('   SmartID HUB Role:', updatedUser.smartid_hub_role);
    console.log('   SmartID TIME Role:', updatedUser.smartid_time_role);
    console.log('   Can Access Web Portal:', updatedUser.can_access_web_portal);
    console.log('   Institution ID:', updatedUser.institution_id);
    
    console.log('\n✨ User now has TIME portal admin access!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateUserForTimeAccess();