-- Migration: Update existing 'registry' users to 'hub_mobile'
-- Execute this in your Supabase SQL Editor

-- First, let's see what we're updating
SELECT 
  primary_system, 
  COUNT(*) as user_count 
FROM users 
GROUP BY primary_system;

-- Update existing 'registry' users to 'hub_mobile'
-- These users were created via the web admin and should be mobile app users
UPDATE users 
SET 
  primary_system = 'hub_mobile',
  updated_at = NOW()
WHERE primary_system = 'registry';

-- Verify the update
SELECT 
  primary_system, 
  COUNT(*) as user_count 
FROM users 
GROUP BY primary_system;

-- Optional: If you have any users that should remain as web admin users,
-- you can update them separately (uncomment and modify as needed)
/*
UPDATE users 
SET 
  primary_system = 'hub_web',
  updated_at = NOW()
WHERE primary_system = 'hub_mobile' 
  AND primary_role = 'admin'  -- or whatever condition identifies web admin users
  AND email IN ('admin@yourdomain.com', 'another-admin@yourdomain.com');
*/

-- Add a comment to track this migration
INSERT INTO public.migrations_log (migration_name, executed_at, description) 
VALUES (
  'update_registry_to_hub_mobile', 
  NOW(), 
  'Updated existing registry users to hub_mobile system'
) ON CONFLICT DO NOTHING;

-- If migrations_log table doesn't exist, create it (optional tracking)
CREATE TABLE IF NOT EXISTS public.migrations_log (
  id SERIAL PRIMARY KEY,
  migration_name TEXT UNIQUE NOT NULL,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  description TEXT
);

-- Show final counts
SELECT 
  'Migration Complete - Final Counts:' as status,
  primary_system, 
  COUNT(*) as user_count 
FROM users 
GROUP BY primary_system;
