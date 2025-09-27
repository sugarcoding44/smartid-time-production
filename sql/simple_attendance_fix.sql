-- Simple fix for attendance_records table schema
-- Run these commands one by one in Supabase SQL Editor

-- 1. Add missing columns
ALTER TABLE attendance_records 
ADD COLUMN IF NOT EXISTS employee_id VARCHAR;

ALTER TABLE attendance_records 
ADD COLUMN IF NOT EXISTS check_in_location JSONB;

ALTER TABLE attendance_records 
ADD COLUMN IF NOT EXISTS check_out_location JSONB;

-- 2. Update status constraint to include 'pending_approval'
ALTER TABLE attendance_records 
DROP CONSTRAINT IF EXISTS attendance_records_status_check;

ALTER TABLE attendance_records 
ADD CONSTRAINT attendance_records_status_check 
CHECK (status::text = ANY (ARRAY[
    'present'::character varying,
    'late'::character varying,
    'absent'::character varying,
    'early_leave'::character varying,
    'pending_approval'::character varying
]::text[]));

-- 3. Update verification_method constraint to include our API methods
ALTER TABLE attendance_records 
DROP CONSTRAINT IF EXISTS attendance_records_verification_method_check;

ALTER TABLE attendance_records 
ADD CONSTRAINT attendance_records_verification_method_check 
CHECK (verification_method::text = ANY (ARRAY[
    'palm_vein'::character varying,
    'nfc_card'::character varying,
    'manual'::character varying,
    'manual_mobile'::character varying,
    'manual_web'::character varying,
    'palm'::character varying,
    'smart_card'::character varying,
    'biometric'::character varying
]::text[]));

-- 4. Populate employee_id from users table where missing
UPDATE attendance_records 
SET employee_id = users.employee_id
FROM users 
WHERE attendance_records.user_id = users.id 
AND attendance_records.employee_id IS NULL;

-- 5. Migrate existing location data to check_in_location JSON format
UPDATE attendance_records 
SET check_in_location = jsonb_build_object('address', location)
WHERE location IS NOT NULL 
AND check_in_location IS NULL;

-- 6. Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_attendance_records_employee_id 
ON attendance_records(employee_id);

CREATE INDEX IF NOT EXISTS idx_attendance_records_check_in_location 
ON attendance_records USING GIN(check_in_location);

CREATE INDEX IF NOT EXISTS idx_attendance_records_check_out_location 
ON attendance_records USING GIN(check_out_location);

-- 7. Show some sample data to verify
SELECT 'Schema update completed!' as message;

SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT employee_id) as unique_employees,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(*) FILTER (WHERE check_in_location IS NOT NULL) as records_with_location,
    COUNT(*) FILTER (WHERE employee_id IS NOT NULL) as records_with_employee_id
FROM attendance_records;
