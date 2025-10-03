const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserAuthLink() {
  try {
    console.log('🔍 Checking current auth user...');
    
    // The auth user we know from the debug output
    const authUserId = '7a4d71fa-6fad-418c-978f-1142468960ff';
    const authEmail = 'nadia@pointgate.net';
    
    // Find the user with matching email
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', authEmail)
      .single();
    
    if (findError) {
      console.error('❌ Error finding user:', findError);
      return;
    }
    
    if (existingUser) {
      console.log('✅ Found existing user:', existingUser.id, existingUser.full_name);
      
      // Update the user to link with auth user ID
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          auth_user_id: authUserId,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Error updating user:', updateError);
        return;
      }
      
      console.log('✅ Successfully linked user to auth ID');
      console.log('   User ID:', updatedUser.id);
      console.log('   Auth User ID:', updatedUser.auth_user_id);
      console.log('   Institution ID:', updatedUser.institution_id);
      
    } else {
      console.log('⚠️ No user found with email:', authEmail);
      
      // Create a new user linked to the auth user
      console.log('📝 Creating new user linked to auth...');
      
      // Find an institution to assign
      const { data: institutions } = await supabase
        .from('institutions')
        .select('id, name')
        .limit(1);
      
      if (!institutions || institutions.length === 0) {
        console.error('❌ No institutions found. Please create an institution first.');
        return;
      }
      
      const institutionId = institutions[0].id;
      console.log('🏫 Using institution:', institutions[0].name);
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth_user_id: authUserId,
          full_name: 'Nadia Admin',
          email: authEmail,
          employee_id: 'AD0001',
          primary_role: 'admin',
          primary_system: 'hub_web',
          smartid_hub_role: 'admin',
          ic_number: '000000-00-0000',
          institution_id: institutionId,
          status: 'active'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating user:', createError);
        return;
      }
      
      console.log('✅ Successfully created new user');
      console.log('   User ID:', newUser.id);
      console.log('   Auth User ID:', newUser.auth_user_id);
      console.log('   Institution ID:', newUser.institution_id);
    }
    
    console.log('\n✨ User authentication link fixed! You should now be able to access the dashboard.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixUserAuthLink();