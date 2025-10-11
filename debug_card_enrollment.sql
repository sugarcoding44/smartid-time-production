-- Debug Card Enrollment Issue for card UID: A0AC391A
-- Run these queries in Supabase SQL Editor

-- 1. Check ALL smartid_cards with this UID
SELECT 
    id,
    card_uid,
    card_number,
    card_name,
    institution_id,
    is_active,
    created_at,
    updated_at
FROM smartid_cards 
WHERE card_uid = 'A0AC391A'
ORDER BY created_at DESC;

-- 2. Check ALL card_enrollments for ANY card with this UID
SELECT 
    ce.id as enrollment_id,
    ce.card_id,
    ce.user_id,
    ce.institution_id,
    ce.enrollment_status,
    ce.enrollment_date,
    ce.access_level,
    ce.enrollment_reason,
    sc.card_uid,
    sc.card_number,
    u.full_name,
    u.employee_id
FROM card_enrollments ce
JOIN smartid_cards sc ON ce.card_id = sc.id
JOIN users u ON ce.user_id = u.id
WHERE sc.card_uid = 'A0AC391A'
ORDER BY ce.enrollment_date DESC;

-- 3. Check for potential duplicate enrollments (what's causing the constraint error)
SELECT 
    ce.card_id,
    ce.user_id,
    ce.institution_id,
    COUNT(*) as enrollment_count,
    STRING_AGG(ce.enrollment_status, ', ') as statuses,
    STRING_AGG(ce.id::text, ', ') as enrollment_ids
FROM card_enrollments ce
JOIN smartid_cards sc ON ce.card_id = sc.id
WHERE sc.card_uid = 'A0AC391A'
GROUP BY ce.card_id, ce.user_id, ce.institution_id
HAVING COUNT(*) > 1;

-- 4. Check the specific constraint that's failing
SELECT 
    ce.*,
    sc.card_uid,
    sc.card_number,
    u.full_name,
    u.employee_id
FROM card_enrollments ce
JOIN smartid_cards sc ON ce.card_id = sc.id
JOIN users u ON ce.user_id = u.id
WHERE sc.card_uid = 'A0AC391A'
  AND u.full_name ILIKE '%Wan Azizah%'
  AND ce.institution_id = '22064159-f32b-4a0b-959e-0442fa2e3460';

-- 5. Check ALL enrollments for user "Wan Azizah" to see if she has multiple cards
SELECT 
    ce.id as enrollment_id,
    ce.card_id,
    ce.enrollment_status,
    ce.enrollment_date,
    sc.card_uid,
    sc.card_number,
    sc.card_name,
    u.full_name,
    u.employee_id
FROM card_enrollments ce
JOIN smartid_cards sc ON ce.card_id = sc.id
JOIN users u ON ce.user_id = u.id
WHERE u.full_name ILIKE '%Wan Azizah%'
ORDER BY ce.enrollment_date DESC;

-- 6. Check if there are "phantom" enrollments (deleted cards but enrollments remain)
SELECT 
    ce.id as enrollment_id,
    ce.card_id,
    ce.user_id,
    ce.institution_id,
    ce.enrollment_status,
    u.full_name,
    u.employee_id,
    sc.id as card_exists
FROM card_enrollments ce
JOIN users u ON ce.user_id = u.id
LEFT JOIN smartid_cards sc ON ce.card_id = sc.id
WHERE u.full_name ILIKE '%Wan Azizah%'
  AND ce.institution_id = '22064159-f32b-4a0b-959e-0442fa2e3460';

-- 7. Show the exact constraint violation details
SELECT 
    card_id,
    user_id, 
    institution_id,
    COUNT(*) as duplicate_count
FROM card_enrollments 
WHERE card_id IN (
    SELECT id FROM smartid_cards WHERE card_uid = 'A0AC391A'
)
GROUP BY card_id, user_id, institution_id;