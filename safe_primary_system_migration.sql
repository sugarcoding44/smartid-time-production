-- SAFE Migration: Update data first, then constraint
-- Execute this in your Supabase SQL Editor

-- Step 1: Check what we're starting with
SELECT 
  'BEFORE Migration:' as status,
  primary_system, 
  COUNT(*) as user_count 
FROM users 
GROUP BY primary_system
ORDER BY primary_system;

-- Step 2: First, temporarily disable the constraint validation
-- (This allows us to update data without constraint conflicts)
ALTER TABLE users 
ALTER CONSTRAINT users_primary_system_check NOT VALID;

-- Step 3: Update existing 'registry' users to 'hub_mobile'
UPDATE users 
SET 
  primary_system = 'hub_mobile',
  updated_at = NOW()
WHERE primary_system = 'registry';

-- Step 4: Drop the old constraint completely
ALTER TABLE users 
DROP CONSTRAINT users_primary_system_check;

-- Step 5: Add the new constraint with updated allowed values
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

-- Step 6: Validate all existing data against new constraint
ALTER TABLE users 
VALIDATE CONSTRAINT users_primary_system_check;

-- Step 7: Verify the final result
SELECT 
  'AFTER Migration:' as status,
  primary_system, 
  COUNT(*) as user_count 
FROM users 
GROUP BY primary_system
ORDER BY primary_system;

-- Step 8: Show the new constraint definition
SELECT 
  'New constraint allows these values:' as info,
  unnest(ARRAY['hub_web', 'hub_mobile', 'hq', 'pos', 'pay']) as allowed_values;

-- Step 9: Optional - create a log of this migration
INSERT INTO public.migration_log (
  migration_name, 
  description, 
  executed_at
) VALUES (
  'update_primary_system_constraint_registry_to_hub', 
  'Updated primary_system constraint: removed registry, added hub_web and hub_mobile. Migrated existing registry users to hub_mobile.',
  NOW()
) ON CONFLICT DO NOTHING;

-- Create migration_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.migration_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);
