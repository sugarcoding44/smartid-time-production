-- Add sample attendance records for testing
-- First, create the attendance_records table if it doesn't exist

CREATE TABLE IF NOT EXISTS attendance_records (
    id SERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    date DATE NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    check_in_location JSONB,
    check_out_location JSONB,
    status TEXT DEFAULT 'present', -- 'present', 'absent', 'late', 'pending_approval'
    method TEXT DEFAULT 'biometric', -- 'biometric', 'manual', 'admin'
    work_duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, date)
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_attendance_records_employee_date ON attendance_records(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_user_date ON attendance_records(user_id, date);

-- Add sample attendance data for current month
-- Using existing users from the users table
INSERT INTO attendance_records (employee_id, user_id, date, check_in_time, check_out_time, check_in_location, check_out_location, status, method, work_duration_minutes) VALUES 
-- Wan Emyllia Faireen binti Wan Morhakim (2024001)
('2024001', (SELECT id FROM users WHERE employee_id = '2024001' LIMIT 1), CURRENT_DATE - INTERVAL '1 day', 
 (CURRENT_DATE - INTERVAL '1 day' + TIME '08:15:00'), 
 (CURRENT_DATE - INTERVAL '1 day' + TIME '17:30:00'),
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 'present', 'biometric', 555),

('2024001', (SELECT id FROM users WHERE employee_id = '2024001' LIMIT 1), CURRENT_DATE - INTERVAL '2 days', 
 (CURRENT_DATE - INTERVAL '2 days' + TIME '08:10:00'), 
 (CURRENT_DATE - INTERVAL '2 days' + TIME '17:25:00'),
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 'present', 'biometric', 555),

('2024001', (SELECT id FROM users WHERE employee_id = '2024001' LIMIT 1), CURRENT_DATE - INTERVAL '3 days', 
 (CURRENT_DATE - INTERVAL '3 days' + TIME '08:05:00'), 
 (CURRENT_DATE - INTERVAL '3 days' + TIME '17:20:00'),
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 'present', 'biometric', 555),

-- Ahmad Rahman bin Ismail (2024002)
('2024002', (SELECT id FROM users WHERE employee_id = '2024002' LIMIT 1), CURRENT_DATE - INTERVAL '1 day', 
 (CURRENT_DATE - INTERVAL '1 day' + TIME '08:20:00'), 
 (CURRENT_DATE - INTERVAL '1 day' + TIME '17:35:00'),
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 'present', 'biometric', 555),

('2024002', (SELECT id FROM users WHERE employee_id = '2024002' LIMIT 1), CURRENT_DATE - INTERVAL '2 days', 
 (CURRENT_DATE - INTERVAL '2 days' + TIME '08:25:00'), 
 (CURRENT_DATE - INTERVAL '2 days' + TIME '17:40:00'),
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 'late', 'biometric', 555),

-- Siti Nurhaliza binti Abdul Rahman (2024003) 
('2024003', (SELECT id FROM users WHERE employee_id = '2024003' LIMIT 1), CURRENT_DATE - INTERVAL '1 day', 
 (CURRENT_DATE - INTERVAL '1 day' + TIME '08:00:00'), 
 (CURRENT_DATE - INTERVAL '1 day' + TIME '17:15:00'),
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 'present', 'biometric', 555),

('2024003', (SELECT id FROM users WHERE employee_id = '2024003' LIMIT 1), CURRENT_DATE - INTERVAL '2 days', 
 (CURRENT_DATE - INTERVAL '2 days' + TIME '08:12:00'), 
 (CURRENT_DATE - INTERVAL '2 days' + TIME '17:28:00'),
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 'present', 'biometric', 556),

-- Dr. Lim Wei Ming (2024004)
('2024004', (SELECT id FROM users WHERE employee_id = '2024004' LIMIT 1), CURRENT_DATE - INTERVAL '1 day', 
 (CURRENT_DATE - INTERVAL '1 day' + TIME '07:55:00'), 
 (CURRENT_DATE - INTERVAL '1 day' + TIME '17:10:00'),
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 'present', 'biometric', 555),

('2024004', (SELECT id FROM users WHERE employee_id = '2024004' LIMIT 1), CURRENT_DATE - INTERVAL '2 days', 
 (CURRENT_DATE - INTERVAL '2 days' + TIME '08:08:00'), 
 (CURRENT_DATE - INTERVAL '2 days' + TIME '17:22:00'),
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
 'present', 'biometric', 554);

-- Add some more records to get to ~20 days for the month
-- Add entries for the past 20 days with realistic patterns
DO $$
DECLARE
    r RECORD;
    day_offset INTEGER;
    check_in_time TIME;
    work_minutes INTEGER;
    status_val TEXT;
BEGIN
    -- Loop through existing users
    FOR r IN SELECT id, employee_id FROM users WHERE employee_id IN ('2024001', '2024002', '2024003', '2024004') LOOP
        -- Add 15 more days of data (we already have ~3 days above)
        FOR day_offset IN 4..18 LOOP
            -- Randomize check-in time between 7:50 and 8:30
            check_in_time := TIME '08:00:00' + (RANDOM() * INTERVAL '40 minutes') - INTERVAL '10 minutes';
            
            -- Work duration between 8-9 hours (480-540 minutes)
            work_minutes := 480 + (RANDOM() * 60)::INTEGER;
            
            -- Status: 90% present, 5% late, 5% absent
            IF RANDOM() < 0.9 THEN
                status_val := 'present';
            ELSIF RANDOM() < 0.95 THEN
                status_val := 'late';
            ELSE
                status_val := 'absent';
            END IF;
            
            -- Only insert if not absent
            IF status_val != 'absent' THEN
                INSERT INTO attendance_records (
                    employee_id, 
                    user_id, 
                    date, 
                    check_in_time, 
                    check_out_time, 
                    check_in_location, 
                    check_out_location, 
                    status, 
                    method, 
                    work_duration_minutes
                ) VALUES (
                    r.employee_id,
                    r.id,
                    CURRENT_DATE - INTERVAL '1 day' * day_offset,
                    (CURRENT_DATE - INTERVAL '1 day' * day_offset) + check_in_time,
                    (CURRENT_DATE - INTERVAL '1 day' * day_offset) + check_in_time + INTERVAL '1 minute' * work_minutes,
                    '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
                    '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia"}',
                    status_val,
                    'biometric',
                    work_minutes
                ) ON CONFLICT (employee_id, date) DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- Create a view for easy attendance summary queries
CREATE OR REPLACE VIEW attendance_summary AS
SELECT 
    employee_id,
    user_id,
    DATE_TRUNC('month', date) as month_year,
    COUNT(*) as total_days,
    COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
    COUNT(CASE WHEN status = 'late' THEN 1 END) as late_days,
    COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
    ROUND(
        (COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2
    ) as attendance_rate
FROM attendance_records 
GROUP BY employee_id, user_id, DATE_TRUNC('month', date);

-- Test the data
SELECT 'Attendance Summary for Current Month:' as info;
SELECT 
    u.full_name,
    a.employee_id,
    a.total_days,
    a.present_days,
    a.late_days,
    a.absent_days,
    a.attendance_rate
FROM attendance_summary a
JOIN users u ON u.id = a.user_id
WHERE a.month_year = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY a.employee_id;
