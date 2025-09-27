-- Update primary_system constraint to include hub_mobile and remove registry
-- Execute this in your Supabase SQL Editor

-- Step 1: Check current primary_system values
SELECT 
  primary_system, 
  COUNT(*) as user_count 
FROM users 
GROUP BY primary_system;

-- Step 2: Drop the existing constraint
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_primary_system_check;

-- Step 3: Create new constraint with updated values
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

-- Step 4: Update existing 'registry' users to 'hub_mobile'
-- (This will fail if constraint is applied first, so we do it after)
UPDATE users 
SET 
  primary_system = 'hub_mobile',
  updated_at = NOW()
WHERE primary_system = 'registry';

-- Step 5: Verify the changes
SELECT 
  'After Migration:' as status,
  primary_system, 
  COUNT(*) as user_count 
FROM users 
GROUP BY primary_system
ORDER BY primary_system;

-- Step 6: Test the constraint (this should succeed)
-- Uncomment to test:
/*
INSERT INTO users (
  full_name, ic_number, email, phone, primary_system, primary_role, 
  smartid_hub_role, institution_id
) VALUES (
  'Test User', '123456-78-9999', 'test@example.com', '+60123456789', 
  'hub_mobile', 'student', 'student', 
  (SELECT id FROM institutions LIMIT 1)
);

-- Clean up test
DELETE FROM users WHERE email = 'test@example.com';
*/

-- Step 7: Show constraint info
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'users_primary_system_check';
