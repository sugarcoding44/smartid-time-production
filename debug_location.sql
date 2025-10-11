-- Quick query to check institution location settings for attendance
-- Run this in your Supabase SQL Editor to see your institution location data

-- First, check your user's institution
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.institution_id,
    i.name as institution_name,
    i.timezone
FROM users u
JOIN institutions i ON u.institution_id = i.id
WHERE u.email LIKE '%your-email%'  -- Replace with your actual email
   OR u.full_name LIKE '%Wan Azizah%';  -- Replace with your name

-- Then check the institution location settings
SELECT 
    il.id,
    il.name as location_name,
    il.latitude,
    il.longitude,
    il.attendance_radius,
    il.address,
    il.city,
    il.state,
    il.is_active,
    il.is_attendance_enabled,
    il.location_status,
    il.is_primary,
    i.name as institution_name
FROM institution_locations il
JOIN institutions i ON il.institution_id = i.id
WHERE il.institution_id IN (
    SELECT institution_id 
    FROM users 
    WHERE email LIKE '%your-email%' -- Replace with your actual email
       OR full_name LIKE '%Wan Azizah%' -- Replace with your name
)
ORDER BY il.is_primary DESC, il.created_at DESC;

-- Check if there are any location calibration issues
-- Look for locations that should be active but aren't properly configured
SELECT 
    'Missing verified locations' as issue,
    COUNT(*) as count
FROM institution_locations il
WHERE il.location_status != 'verified'
   OR il.is_attendance_enabled = false
   OR il.is_active = false;

-- Show distance calculation example (you'll need to replace coordinates)
-- Replace these with your actual coordinates and institution coordinates
SELECT 
    'Distance Test' as test_name,
    -- Example: Calculate distance from user location to institution
    -- Replace with your current GPS coordinates and institution coordinates
    6371000 * acos(
        cos(radians(3.1390)) * cos(radians(3.1390)) *  -- Replace first pair with institution lat
        cos(radians(101.6869) - radians(101.6869)) +   -- Replace with institution lon, user lon
        sin(radians(3.1390)) * sin(radians(3.1390))    -- Replace second pair with user lat
    ) as distance_in_meters;