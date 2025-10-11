-- Quick script to assign a user to a work group for testing
-- Run this in your Supabase SQL Editor

-- First, let's see what work groups exist
SELECT 
  wg.id,
  wg.name,
  wg.default_start_time,
  wg.default_end_time,
  wg.working_days,
  i.name as institution_name
FROM work_groups wg
JOIN institutions i ON wg.institution_id = i.id
WHERE wg.is_active = true
ORDER BY wg.created_at DESC;

-- Check current user info
SELECT 
  u.id as user_id,
  u.full_name,
  u.email,
  u.employee_id,
  u.institution_id,
  i.name as institution_name
FROM users u
JOIN institutions i ON u.institution_id = i.id
WHERE u.email LIKE '%biskitsdoughbar@gmail.com%'
   OR u.full_name LIKE '%Wan Azizah%';

-- Check existing work group assignments
SELECT 
  uwga.id,
  uwga.user_id,
  uwga.work_group_id,
  uwga.is_active,
  u.full_name,
  wg.name as work_group_name
FROM user_work_group_assignments uwga
JOIN users u ON uwga.user_id = u.id
JOIN work_groups wg ON uwga.work_group_id = wg.id
WHERE u.email LIKE '%biskitsdoughbar@gmail.com%'
   OR u.full_name LIKE '%Wan Azizah%';

-- Assign user to a work group (update the IDs based on the results above)
-- Replace 'USER_ID_HERE' with the actual user ID
-- Replace 'WORK_GROUP_ID_HERE' with the appropriate work group ID

/*
INSERT INTO user_work_group_assignments (
  user_id,
  work_group_id,
  is_active,
  assigned_at,
  assigned_by,
  created_at,
  updated_at
) VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID
  'WORK_GROUP_ID_HERE',  -- Replace with appropriate work group ID
  true,
  NOW(),
  'system_admin',
  NOW(),
  NOW()
)
ON CONFLICT (user_id, work_group_id) 
DO UPDATE SET
  is_active = true,
  updated_at = NOW();
*/

-- Example: If you need to create a basic work group first
/*
INSERT INTO work_groups (
  institution_id,
  name,
  description,
  default_start_time,
  default_end_time,
  break_start_time,
  break_end_time,
  working_days,
  is_active,
  created_by,
  created_at,
  updated_at
) VALUES (
  'INSTITUTION_ID_HERE',  -- Replace with institution ID
  'Standard Work Hours',
  'Default work group for staff with 8:00 AM - 5:00 PM schedule',
  '08:00:00',
  '17:00:00',
  '12:00:00',
  '13:00:00',
  ARRAY[1, 2, 3, 4, 5],  -- Monday to Friday
  true,
  'system_admin',
  NOW(),
  NOW()
);
*/