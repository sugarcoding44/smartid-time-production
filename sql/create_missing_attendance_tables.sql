-- Create missing tables required for attendance_records

-- 1. Create work_groups table if it doesn't exist
CREATE TABLE IF NOT EXISTS work_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id),
    scheduled_start_time TIME DEFAULT '08:00:00',
    scheduled_end_time TIME DEFAULT '17:00:00',
    working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- Monday to Friday (1=Mon, 7=Sun)
    break_duration_minutes INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, name)
);

-- 2. Create institution_holidays table if it doesn't exist  
CREATE TABLE IF NOT EXISTS institution_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    date DATE NOT NULL,
    holiday_type VARCHAR DEFAULT 'public' CHECK (holiday_type IN ('public', 'religious', 'institutional', 'other')),
    description TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR, -- 'yearly', 'monthly', etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(institution_id, date, name)
);

-- 3. Create update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Add triggers for work_groups and institution_holidays
CREATE TRIGGER update_work_groups_updated_at 
    BEFORE UPDATE ON work_groups 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institution_holidays_updated_at 
    BEFORE UPDATE ON institution_holidays 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_groups_institution ON work_groups(institution_id);
CREATE INDEX IF NOT EXISTS idx_work_groups_manager ON work_groups(manager_id);
CREATE INDEX IF NOT EXISTS idx_institution_holidays_institution ON institution_holidays(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_holidays_date ON institution_holidays(date);

-- 6. Insert sample work groups for existing institutions
INSERT INTO work_groups (institution_id, name, description, scheduled_start_time, scheduled_end_time)
SELECT 
    id as institution_id,
    'Default Staff' as name,
    'Default work group for all staff members' as description,
    '08:00:00'::TIME as scheduled_start_time,
    '17:00:00'::TIME as scheduled_end_time
FROM institutions 
ON CONFLICT (institution_id, name) DO NOTHING;

-- 7. Insert some common holidays
INSERT INTO institution_holidays (institution_id, name, date, holiday_type, description)
SELECT 
    id as institution_id,
    'New Year Day' as name,
    '2025-01-01'::DATE as date,
    'public' as holiday_type,
    'New Year celebration' as description
FROM institutions
ON CONFLICT (institution_id, date, name) DO NOTHING;

INSERT INTO institution_holidays (institution_id, name, date, holiday_type, description)
SELECT 
    id as institution_id,
    'Malaysia Day' as name,
    '2025-09-16'::DATE as date,
    'public' as holiday_type,
    'Malaysia national day' as description
FROM institutions
ON CONFLICT (institution_id, date, name) DO NOTHING;

-- 8. Update existing users to have a work_group_id
UPDATE users SET 
    work_group_id = (
        SELECT id FROM work_groups 
        WHERE work_groups.institution_id = users.institution_id 
        AND name = 'Default Staff' 
        LIMIT 1
    )
WHERE work_group_id IS NULL 
AND institution_id IS NOT NULL;

-- Show the results
SELECT 'Tables created successfully!' as message;
SELECT 'Work Groups:' as info, COUNT(*) as count FROM work_groups;
SELECT 'Institution Holidays:' as info, COUNT(*) as count FROM institution_holidays;
SELECT 'Users with work groups:' as info, COUNT(*) as count FROM users WHERE work_group_id IS NOT NULL;
