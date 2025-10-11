-- Debug query to check user's work group assignment
-- Run this in Supabase SQL Editor to see what's happening

-- Check user details
SELECT 
  u.id as user_id,
  u.auth_user_id,
  u.full_name,
  u.email,
  u.employee_id,
  u.institution_id
FROM users u
WHERE u.email = 'biskitsdoughbar@gmail.com'
   OR u.full_name LIKE '%Wan Azizah%';

-- Check work group assignments for this user
SELECT 
  uwga.id,
  uwga.user_id,
  uwga.work_group_id,
  uwga.is_active,
  uwga.assigned_at,
  wg.name as work_group_name,
  wg.default_start_time,
  wg.default_end_time,
  wg.working_days
FROM user_work_group_assignments uwga
LEFT JOIN work_groups wg ON uwga.work_group_id = wg.id
WHERE uwga.user_id IN (
  SELECT u.id FROM users u 
  WHERE u.email = 'biskitsdoughbar@gmail.com' 
     OR u.full_name LIKE '%Wan Azizah%'
);

-- Check if user has multiple IDs issue
SELECT 
  'By email' as search_method,
  u.id as user_id,
  u.auth_user_id,
  u.full_name,
  u.email
FROM users u
WHERE u.email = 'biskitsdoughbar@gmail.com'

UNION ALL

SELECT 
  'By auth_user_id' as search_method,
  u.id as user_id,
  u.auth_user_id,
  u.full_name,
  u.email
FROM users u
WHERE u.auth_user_id = '7f185f03-7aca-47c2-900f-04033476ea8b';

-- Current Malaysian time for reference
SELECT 
  NOW() as utc_time,
  NOW() AT TIME ZONE 'Asia/Kuala_Lumpur' as malaysian_time,
  EXTRACT(hour FROM (NOW() AT TIME ZONE 'Asia/Kuala_Lumpur')) as current_hour;