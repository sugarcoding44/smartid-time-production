-- FIXED Migration: Update primary_system constraint safely
-- Execute this in your Supabase SQL Editor

-- Step 1: Check what we're starting with
SELECT 
  'BEFORE Migration:' as status,
  primary_system, 
  COUNT(*) as user_count 
FROM users 
GROUP BY primary_system
ORDER BY primary_system;

-- Step 2: Drop the existing constraint first
-- This allows us to update data without constraint conflicts
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_primary_system_check;

-- Step 3: Update existing 'registry' users to 'hub_mobile'
UPDATE users 
SET 
  primary_system = 'hub_mobile',
  updated_at = NOW()
WHERE primary_system = 'registry';

-- Step 4: Add the new constraint with updated allowed values
ALTER TABLE users 
ADD CONSTRAINT users_primary_system_check 
CHECK (
  (primary_system)::text = ANY (
    ARRAY[
      'hub_web'::character varying,
      'hub_mobile'::character varying, 
      'hq'::character varying,
      'pos'::character varying,
      'pay'::character varying
    ]::text[]
  )
);

-- Step 5: Verify the final result
SELECT 
  'AFTER Migration:' as status,
  primary_system, 
  COUNT(*) as user_count 
FROM users 
GROUP BY primary_system
ORDER BY primary_system;

-- Step 6: Show the new constraint definition
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'users_primary_system_check';

-- Step 7: Show allowed values
SELECT 
  'New constraint allows these values:' as info,
  unnest(ARRAY['hub_web', 'hub_mobile', 'hq', 'pos', 'pay']) as allowed_values;

-- Step 8: Test that the constraint works (optional - uncomment to test)
/*
-- This should work:
INSERT INTO users (
  full_name, ic_number, email, phone, primary_system, primary_role, 
  smartid_hub_role, institution_id, status
) VALUES (
  'Test User', '999999-99-9999', 'test-constraint@example.com', '+60199999999', 
  'hub_mobile', 'student', 'student', 
  (SELECT id FROM institutions LIMIT 1), 'active'
);

-- This should fail (registry no longer allowed):
INSERT INTO users (
  full_name, ic_number, email, phone, primary_system, primary_role, 
  smartid_hub_role, institution_id, status
) VALUES (
  'Test User 2', '888888-88-8888', 'test-constraint2@example.com', '+60188888888', 
  'registry', 'student', 'student', 
  (SELECT id FROM institutions LIMIT 1), 'active'
);

-- Clean up test records
DELETE FROM users WHERE email LIKE 'test-constraint%@example.com';
*/

-- Step 9: Create migration log
CREATE TABLE IF NOT EXISTS public.migration_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.migration_log (
  migration_name, 
  description, 
  executed_at
) VALUES (
  'update_primary_system_constraint_registry_to_hub', 
  'Updated primary_system constraint: removed registry, added hub_web and hub_mobile. Migrated existing registry users to hub_mobile.',
  NOW()
) ON CONFLICT (migration_name) DO UPDATE SET 
  executed_at = NOW(),
  description = EXCLUDED.description;
