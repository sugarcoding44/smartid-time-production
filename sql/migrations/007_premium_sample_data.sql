-- =====================================================
-- Sample Data for SmartID HUB Premium Features
-- =====================================================
-- This file contains sample data to demonstrate premium attendance
-- and leave management features. Use for testing only.
-- =====================================================

-- Note: Run this ONLY after creating a sample institution and users
-- This script assumes the existence of a test institution

-- =====================================================
-- SAMPLE WORK GROUPS
-- =====================================================

-- Morning Teachers Work Group (7AM - 1PM)
INSERT INTO work_groups (
  institution_id, 
  name, 
  description,
  default_start_time,
  default_end_time,
  working_days,
  late_threshold_minutes,
  early_leave_threshold_minutes,
  minimum_working_hours,
  overtime_threshold_hours,
  created_by
) 
SELECT 
  i.id,
  'Morning Teachers',
  'Teachers working morning shift from 7AM to 1PM',
  '07:00:00'::TIME,
  '13:00:00'::TIME,
  ARRAY[1,2,3,4,5], -- Monday to Friday
  10, -- 10 minutes late threshold
  30, -- 30 minutes early leave threshold
  6.0, -- 6 hours minimum
  6.0, -- Overtime after 6 hours
  u.id
FROM institutions i
CROSS JOIN users u
WHERE i.name = 'Sample High School' 
  AND u.smartid_hub_role = 'admin'
LIMIT 1;

-- Afternoon Staff Work Group (1PM - 9PM)
INSERT INTO work_groups (
  institution_id, 
  name, 
  description,
  default_start_time,
  default_end_time,
  working_days,
  late_threshold_minutes,
  early_leave_threshold_minutes,
  minimum_working_hours,
  created_by
) 
SELECT 
  i.id,
  'Afternoon Staff',
  'Administrative staff working afternoon shift',
  '13:00:00'::TIME,
  '21:00:00'::TIME,
  ARRAY[1,2,3,4,5,6], -- Monday to Saturday
  15, -- 15 minutes late threshold
  30, -- 30 minutes early leave threshold
  8.0, -- 8 hours minimum
  u.id
FROM institutions i
CROSS JOIN users u
WHERE i.name = 'Sample High School' 
  AND u.smartid_hub_role = 'admin'
LIMIT 1;

-- Admin Staff Work Group (Standard 9AM - 5PM)
INSERT INTO work_groups (
  institution_id, 
  name, 
  description,
  default_start_time,
  default_end_time,
  break_start_time,
  break_end_time,
  break_duration_minutes,
  working_days,
  late_threshold_minutes,
  minimum_working_hours,
  created_by
) 
SELECT 
  i.id,
  'Administration Staff',
  'Regular office hours for administrative staff',
  '09:00:00'::TIME,
  '17:00:00'::TIME,
  '12:00:00'::TIME,
  '13:00:00'::TIME,
  60, -- 1 hour lunch break
  ARRAY[1,2,3,4,5], -- Monday to Friday
  15, -- 15 minutes late threshold
  7.0, -- 7 working hours (8 - 1 hour break)
  u.id
FROM institutions i
CROSS JOIN users u
WHERE i.name = 'Sample High School' 
  AND u.smartid_hub_role = 'admin'
LIMIT 1;

-- =====================================================
-- SAMPLE USER WORK GROUP ASSIGNMENTS
-- =====================================================

-- Assign teachers to morning shift
INSERT INTO user_work_group_assignments (
  user_id,
  work_group_id,
  effective_from,
  assigned_by
)
SELECT 
  u.id,
  wg.id,
  CURRENT_DATE - INTERVAL '30 days', -- Started 30 days ago
  admin.id
FROM users u
CROSS JOIN work_groups wg
CROSS JOIN users admin
WHERE u.smartid_hub_role = 'teacher'
  AND wg.name = 'Morning Teachers'
  AND admin.smartid_hub_role = 'admin'
  AND u.institution_id = wg.institution_id
LIMIT 3; -- Assign first 3 teachers

-- Assign staff to admin work group
INSERT INTO user_work_group_assignments (
  user_id,
  work_group_id,
  effective_from,
  assigned_by
)
SELECT 
  u.id,
  wg.id,
  CURRENT_DATE - INTERVAL '15 days', -- Started 15 days ago
  admin.id
FROM users u
CROSS JOIN work_groups wg
CROSS JOIN users admin
WHERE u.smartid_hub_role = 'staff'
  AND wg.name = 'Administration Staff'
  AND admin.smartid_hub_role = 'admin'
  AND u.institution_id = wg.institution_id
LIMIT 2; -- Assign first 2 staff members

-- =====================================================
-- SAMPLE HOLIDAYS
-- =====================================================

-- New Year's Day
INSERT INTO institution_holidays (
  institution_id,
  name,
  description,
  holiday_date,
  holiday_type,
  is_recurring,
  recurrence_pattern,
  created_by
)
SELECT 
  i.id,
  'New Year''s Day',
  'National holiday - New Year celebration',
  '2024-01-01'::DATE,
  'public',
  true,
  'yearly',
  u.id
FROM institutions i
CROSS JOIN users u
WHERE i.name = 'Sample High School' 
  AND u.smartid_hub_role = 'admin'
LIMIT 1;

-- Chinese New Year (Multi-day holiday)
INSERT INTO institution_holidays (
  institution_id,
  name,
  description,
  holiday_date,
  end_date,
  holiday_type,
  is_recurring,
  recurrence_pattern,
  created_by
)
SELECT 
  i.id,
  'Chinese New Year',
  'Traditional Chinese New Year celebration - 2 days',
  '2024-02-10'::DATE,
  '2024-02-11'::DATE,
  'public',
  false, -- Dates change yearly
  NULL,
  u.id
FROM institutions i
CROSS JOIN users u
WHERE i.name = 'Sample High School' 
  AND u.smartid_hub_role = 'admin'
LIMIT 1;

-- School Sports Day (Custom holiday for specific work groups)
INSERT INTO institution_holidays (
  institution_id,
  name,
  description,
  holiday_date,
  holiday_type,
  affected_work_groups,
  is_working_day,
  created_by
)
SELECT 
  i.id,
  'Annual Sports Day',
  'School sports day - teachers required, admin staff can take leave',
  CURRENT_DATE + INTERVAL '30 days',
  'school',
  ARRAY[wg.id], -- Only affects admin staff
  true, -- It's a working day for teachers
  u.id
FROM institutions i
CROSS JOIN work_groups wg
CROSS JOIN users u
WHERE i.name = 'Sample High School' 
  AND wg.name = 'Administration Staff'
  AND u.smartid_hub_role = 'admin'
LIMIT 1;

-- =====================================================
-- SAMPLE LEAVE TYPES (Initialize defaults for the institution)
-- =====================================================

SELECT initialize_default_leave_types(i.id)
FROM institutions i
WHERE i.name = 'Sample High School';

-- Add a custom leave type
INSERT INTO leave_types (
  institution_id,
  name,
  code,
  description,
  color,
  is_paid,
  requires_approval,
  has_annual_quota,
  default_quota_days,
  max_consecutive_days,
  min_advance_notice_days,
  created_by
)
SELECT 
  i.id,
  'Professional Development',
  'PD',
  'Leave for attending courses, seminars, and training',
  '#8B5CF6',
  true,
  true,
  true,
  5.0, -- 5 days per year
  3, -- Max 3 consecutive days
  7, -- 1 week advance notice
  u.id
FROM institutions i
CROSS JOIN users u
WHERE i.name = 'Sample High School' 
  AND u.smartid_hub_role = 'admin'
LIMIT 1;

-- =====================================================
-- SAMPLE USER LEAVE QUOTAS
-- =====================================================

-- Create quotas for all users for current year
INSERT INTO user_leave_quotas (
  user_id,
  leave_type_id,
  quota_year,
  allocated_days
)
SELECT 
  u.id,
  lt.id,
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  CASE 
    WHEN u.smartid_hub_role = 'teacher' THEN lt.default_quota_days + 2 -- Teachers get 2 extra days
    ELSE lt.default_quota_days
  END
FROM users u
CROSS JOIN leave_types lt
WHERE u.institution_id = lt.institution_id
  AND u.smartid_hub_role IN ('teacher', 'staff', 'admin');

-- =====================================================
-- SAMPLE LEAVE APPLICATIONS
-- =====================================================

-- Sample approved leave application
INSERT INTO leave_applications (
  application_number,
  user_id,
  leave_type_id,
  start_date,
  end_date,
  total_days,
  reason,
  status,
  approved_date,
  approval_comments
)
SELECT 
  generate_leave_application_number(u.institution_id),
  u.id,
  lt.id,
  CURRENT_DATE - INTERVAL '15 days',
  CURRENT_DATE - INTERVAL '13 days', -- 3 days leave
  3.0,
  'Family vacation - pre-planned',
  'approved',
  CURRENT_DATE - INTERVAL '20 days',
  'Approved - adequate coverage arranged'
FROM users u
CROSS JOIN leave_types lt
WHERE u.smartid_hub_role = 'teacher'
  AND lt.code = 'AL' -- Annual Leave
  AND u.institution_id = lt.institution_id
LIMIT 1;

-- Update the quota to reflect used leave
UPDATE user_leave_quotas 
SET used_days = 3.0
WHERE user_id IN (
  SELECT la.user_id 
  FROM leave_applications la 
  JOIN leave_types lt ON la.leave_type_id = lt.id 
  WHERE lt.code = 'AL' AND la.status = 'approved'
)
AND leave_type_id IN (
  SELECT id FROM leave_types WHERE code = 'AL'
)
AND quota_year = EXTRACT(YEAR FROM CURRENT_DATE);

-- Sample pending leave application
INSERT INTO leave_applications (
  application_number,
  user_id,
  leave_type_id,
  start_date,
  end_date,
  total_days,
  reason,
  status,
  emergency_contact
)
SELECT 
  generate_leave_application_number(u.institution_id),
  u.id,
  lt.id,
  CURRENT_DATE + INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '11 days', -- 2 days leave
  2.0,
  'Medical appointment for routine checkup',
  'pending',
  '{"name": "Dr. Ahmad", "phone": "03-1234-5678", "relationship": "family_doctor"}'::JSONB
FROM users u
CROSS JOIN leave_types lt
WHERE u.smartid_hub_role = 'staff'
  AND lt.code = 'SL' -- Sick Leave
  AND u.institution_id = lt.institution_id
LIMIT 1;

-- Update pending quota
UPDATE user_leave_quotas 
SET pending_days = 2.0
WHERE user_id IN (
  SELECT la.user_id 
  FROM leave_applications la 
  JOIN leave_types lt ON la.leave_type_id = lt.id 
  WHERE lt.code = 'SL' AND la.status = 'pending'
  LIMIT 1
)
AND leave_type_id IN (
  SELECT id FROM leave_types WHERE code = 'SL'
)
AND quota_year = EXTRACT(YEAR FROM CURRENT_DATE);

-- =====================================================
-- SAMPLE ATTENDANCE RECORDS (Recent history)
-- =====================================================

-- Generate attendance records for the past 7 days
-- This would typically be done by the attendance system, but we'll create sample data

DO $$
DECLARE
  user_record RECORD;
  date_counter DATE;
  random_minutes INTEGER;
  check_in_time TIMESTAMP;
  check_out_time TIMESTAMP;
BEGIN
  -- For each user with a work group assignment
  FOR user_record IN 
    SELECT DISTINCT u.id as user_id, u.institution_id, uwga.work_group_id
    FROM users u
    JOIN user_work_group_assignments uwga ON u.id = uwga.user_id
    WHERE uwga.is_active = true
  LOOP
    -- Generate records for past 7 days
    FOR i IN 0..6 LOOP
      date_counter := CURRENT_DATE - i;
      
      -- Skip weekends for most work groups (assuming Mon-Fri schedule)
      IF EXTRACT(dow FROM date_counter) NOT IN (0, 6) THEN
        -- Get work schedule
        SELECT wg.default_start_time, wg.default_end_time
        INTO check_in_time, check_out_time
        FROM work_groups wg
        WHERE wg.id = user_record.work_group_id;
        
        -- Add some randomness to arrival time (-10 to +30 minutes)
        random_minutes := (random() * 40 - 10)::INTEGER;
        check_in_time := date_counter + check_in_time + (random_minutes || ' minutes')::INTERVAL;
        
        -- Add randomness to departure time (-30 to +60 minutes)
        random_minutes := (random() * 90 - 30)::INTEGER;
        check_out_time := date_counter + check_out_time + (random_minutes || ' minutes')::INTERVAL;
        
        -- Insert attendance record
        INSERT INTO attendance_records (
          user_id,
          institution_id,
          work_group_id,
          check_in_time,
          check_out_time,
          date,
          status,
          verification_method,
          device_id,
          location,
          actual_working_hours,
          auto_calculated
        ) VALUES (
          user_record.user_id,
          user_record.institution_id,
          user_record.work_group_id,
          check_in_time,
          check_out_time,
          date_counter,
          CASE 
            WHEN random_minutes > 15 THEN 'late'
            ELSE 'present'
          END,
          'palm_vein',
          'DEVICE-001',
          'Main Entrance',
          EXTRACT(EPOCH FROM (check_out_time - check_in_time)) / 3600.0,
          true
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- You can run these queries to verify the sample data was created correctly

/*

-- Check work groups
SELECT wg.name, wg.default_start_time, wg.default_end_time, 
       array_length(wg.working_days, 1) as working_days_count
FROM work_groups wg
JOIN institutions i ON wg.institution_id = i.id
WHERE i.name = 'Sample High School';

-- Check user work group assignments
SELECT u.full_name, u.smartid_hub_role, wg.name as work_group_name
FROM user_work_group_assignments uwga
JOIN users u ON uwga.user_id = u.id
JOIN work_groups wg ON uwga.work_group_id = wg.id
WHERE uwga.is_active = true;

-- Check holidays
SELECT ih.name, ih.holiday_date, ih.end_date, ih.holiday_type
FROM institution_holidays ih
JOIN institutions i ON ih.institution_id = i.id
WHERE i.name = 'Sample High School'
ORDER BY ih.holiday_date;

-- Check leave types
SELECT lt.name, lt.code, lt.default_quota_days, lt.requires_approval
FROM leave_types lt
JOIN institutions i ON lt.institution_id = i.id
WHERE i.name = 'Sample High School'
ORDER BY lt.display_order;

-- Check user quotas
SELECT u.full_name, lt.name, ulq.allocated_days, ulq.used_days, 
       ulq.pending_days, ulq.available_days
FROM user_leave_quotas ulq
JOIN users u ON ulq.user_id = u.id
JOIN leave_types lt ON ulq.leave_type_id = lt.id
WHERE ulq.quota_year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY u.full_name, lt.name;

-- Check leave applications
SELECT la.application_number, u.full_name, lt.name, 
       la.start_date, la.end_date, la.total_days, la.status
FROM leave_applications la
JOIN users u ON la.user_id = u.id
JOIN leave_types lt ON la.leave_type_id = lt.id
ORDER BY la.created_at DESC;

-- Check recent attendance
SELECT u.full_name, ar.date, ar.check_in_time, ar.check_out_time, 
       ar.status, ar.actual_working_hours
FROM attendance_records ar
JOIN users u ON ar.user_id = u.id
WHERE ar.date >= CURRENT_DATE - 7
ORDER BY ar.date DESC, u.full_name;

*/
