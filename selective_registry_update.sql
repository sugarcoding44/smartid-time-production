-- Selective Migration: Choose how to update existing 'registry' users
-- Execute this in your Supabase SQL Editor

-- STEP 1: Review current users and their roles
SELECT 
  id,
  full_name,
  email,
  primary_role,
  primary_system,
  smartid_hub_role,
  created_at
FROM users 
WHERE primary_system = 'registry'
ORDER BY created_at DESC;

-- STEP 2: Choose your migration strategy

-- OPTION A: Update ALL registry users to hub_mobile (recommended)
-- Uncomment if you want all existing users to be mobile app users
/*
UPDATE users 
SET 
  primary_system = 'hub_mobile',
  updated_at = NOW()
WHERE primary_system = 'registry';
*/

-- OPTION B: Update based on role (if you want to separate by role)
-- Mobile app users (teachers, staff, students)
/*
UPDATE users 
SET 
  primary_system = 'hub_mobile',
  updated_at = NOW()
WHERE primary_system = 'registry' 
  AND primary_role IN ('teacher', 'staff', 'student');
*/

-- Keep admin users as potential web users (if any)
/*
UPDATE users 
SET 
  primary_system = 'hub_web',
  updated_at = NOW()
WHERE primary_system = 'registry' 
  AND primary_role = 'admin';
*/

-- OPTION C: Update specific users by email (most precise)
-- Mobile app users
/*
UPDATE users 
SET 
  primary_system = 'hub_mobile',
  updated_at = NOW()
WHERE primary_system = 'registry' 
  AND email NOT IN (
    'admin1@yourdomain.com', 
    'admin2@yourdomain.com'
    -- Add admin emails that should stay as web users
  );
*/

-- Web admin users (if any)
/*
UPDATE users 
SET 
  primary_system = 'hub_web',
  updated_at = NOW()
WHERE primary_system = 'registry' 
  AND email IN (
    'admin1@yourdomain.com', 
    'admin2@yourdomain.com'
    -- Add admin emails here
  );
*/

-- STEP 3: Verify the results after running your chosen option
SELECT 
  primary_system,
  primary_role,
  COUNT(*) as user_count
FROM users 
GROUP BY primary_system, primary_role
ORDER BY primary_system, primary_role;
