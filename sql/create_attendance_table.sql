-- Create attendance_records table in Supabase
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGSERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    date DATE NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    check_in_location JSONB,
    check_out_location JSONB,
    status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'pending_approval')),
    method TEXT DEFAULT 'biometric' CHECK (method IN ('biometric', 'manual', 'admin')),
    work_duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_employee_date UNIQUE(employee_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_records_employee_date ON attendance_records(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_user_date ON attendance_records(user_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_records_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(date);

-- Enable Row Level Security (RLS)
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own attendance records" ON attendance_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attendance records" ON attendance_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance records" ON attendance_records
    FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role to do everything (for API operations)
CREATE POLICY "Service role can manage all attendance records" ON attendance_records
    FOR ALL USING (auth.role() = 'service_role');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_attendance_updated_at
    BEFORE UPDATE ON attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_attendance_updated_at();

-- Insert some sample data for testing
INSERT INTO attendance_records (employee_id, user_id, date, check_in_time, check_out_time, check_in_location, check_out_location, status, method, work_duration_minutes) VALUES 
-- For the current user (Wan Emyllia Faireen) 
('TC0003', 'a1cf5ac6-0333-40c0-b1a5-539aa65896ed', CURRENT_DATE - INTERVAL '1 day', 
 (CURRENT_DATE - INTERVAL '1 day' + TIME '08:15:00'), 
 (CURRENT_DATE - INTERVAL '1 day' + TIME '17:30:00'),
 '{"latitude": 2.9384606, "longitude": 101.7131781, "address": "University of Malaya, Kuala Lumpur, Malaysia", "accuracy": 5}',
 '{"latitude": 2.9384606, "longitude": 101.7131781, "address": "University of Malaya, Kuala Lumpur, Malaysia", "accuracy": 5}',
 'present', 'biometric', 555),

('TC0003', 'a1cf5ac6-0333-40c0-b1a5-539aa65896ed', CURRENT_DATE - INTERVAL '2 days', 
 (CURRENT_DATE - INTERVAL '2 days' + TIME '08:10:00'), 
 (CURRENT_DATE - INTERVAL '2 days' + TIME '17:25:00'),
 '{"latitude": 2.9384606, "longitude": 101.7131781, "address": "University of Malaya, Kuala Lumpur, Malaysia", "accuracy": 5}',
 '{"latitude": 2.9384606, "longitude": 101.7131781, "address": "University of Malaya, Kuala Lumpur, Malaysia", "accuracy": 5}',
 'present', 'biometric', 555),

('TC0003', 'a1cf5ac6-0333-40c0-b1a5-539aa65896ed', CURRENT_DATE - INTERVAL '3 days', 
 (CURRENT_DATE - INTERVAL '3 days' + TIME '08:05:00'), 
 (CURRENT_DATE - INTERVAL '3 days' + TIME '17:20:00'),
 '{"latitude": 2.9384606, "longitude": 101.7131781, "address": "University of Malaya, Kuala Lumpur, Malaysia", "accuracy": 5}',
 '{"latitude": 2.9384606, "longitude": 101.7131781, "address": "University of Malaya, Kuala Lumpur, Malaysia", "accuracy": 5}',
 'present', 'biometric', 555);

-- Add more sample records for other users if they exist
DO $$ 
DECLARE 
    user_record RECORD;
BEGIN
    -- Add sample data for other users in the system
    FOR user_record IN 
        SELECT id, employee_id 
        FROM users 
        WHERE employee_id IN ('2024001', '2024002', '2024003', '2024004')
    LOOP
        -- Add 3 days of sample data for each user
        FOR day_offset IN 1..3 LOOP
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
                user_record.employee_id,
                user_record.id,
                CURRENT_DATE - INTERVAL '1 day' * day_offset,
                (CURRENT_DATE - INTERVAL '1 day' * day_offset) + TIME '08:00:00' + (RANDOM() * INTERVAL '30 minutes'),
                (CURRENT_DATE - INTERVAL '1 day' * day_offset) + TIME '17:00:00' + (RANDOM() * INTERVAL '60 minutes'),
                '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia", "accuracy": 10}',
                '{"latitude": 3.1390, "longitude": 101.6869, "address": "Kuala Lumpur, Malaysia", "accuracy": 10}',
                'present',
                'biometric',
                480 + (RANDOM() * 60)::INTEGER
            ) ON CONFLICT (employee_id, date) DO NOTHING;
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
    COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END) as present_days,
    COUNT(CASE WHEN status = 'late' THEN 1 END) as late_days,
    COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_days,
    COUNT(CASE WHEN status = 'pending_approval' THEN 1 END) as pending_days,
    ROUND(
        (COUNT(CASE WHEN status IN ('present', 'late') THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 2
    ) as attendance_rate
FROM attendance_records 
GROUP BY employee_id, user_id, DATE_TRUNC('month', date);

-- Test the setup
SELECT 'Attendance table created successfully!' as message;
SELECT 
    COUNT(*) as total_records,
    COUNT(DISTINCT employee_id) as unique_employees,
    MIN(date) as earliest_date,
    MAX(date) as latest_date
FROM attendance_records;
