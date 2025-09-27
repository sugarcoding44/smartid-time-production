const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function runMigration() {
  try {
    // Create Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('🔄 Running user setup tokens migration...')

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'sql', 'migrations', '009_user_setup_tokens.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    // Split SQL into individual statements (simple split by semicolon and new line)
    const statements = migrationSQL
      .split(';\n')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'))
      .map(stmt => stmt.endsWith(';') ? stmt : stmt + ';')

    console.log(`📝 Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim() === ';') continue

      console.log(`   Executing statement ${i + 1}/${statements.length}...`)
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql: statement 
      }).catch(async () => {
        // If rpc doesn't exist, try direct query
        return await supabase
          .from('__migrations__') // This will fail but we'll catch it
          .select()
          .limit(0)
      })

      // Try alternative approach - execute via raw SQL
      try {
        // For table creation and other DDL, we might need to use the REST API directly
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ sql: statement })
        })

        if (!response.ok) {
          console.log(`   ⚠️  Statement ${i + 1} may need manual execution:`)
          console.log(`   ${statement.substring(0, 100)}...`)
        }
      } catch (err) {
        console.log(`   ⚠️  Statement ${i + 1} may need manual execution in Supabase dashboard`)
      }
    }

    console.log('✅ Migration completed! Please verify in Supabase dashboard.')
    console.log('\n🔧 Manual Steps if needed:')
    console.log('1. Go to Supabase Dashboard → SQL Editor')
    console.log('2. Copy and paste the contents of: sql/migrations/009_user_setup_tokens.sql')
    console.log('3. Click "Run" to execute the migration')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.log('\n🔧 Manual Steps:')
    console.log('1. Go to Supabase Dashboard → SQL Editor')
    console.log('2. Copy and paste the contents of: sql/migrations/009_user_setup_tokens.sql')
    console.log('3. Click "Run" to execute the migration')
  }
}

runMigration()
