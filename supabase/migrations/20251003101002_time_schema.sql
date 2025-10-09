-- Work Groups Management
CREATE TABLE IF NOT EXISTS time.work_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Monday, 7=Sunday
    default_start_time TIME NOT NULL DEFAULT '08:00',
    default_end_time TIME NOT NULL DEFAULT '17:00',
    minimum_working_hours DECIMAL(4,2) DEFAULT 8.00,
    late_threshold_minutes INTEGER DEFAULT 15,
    early_leave_threshold_minutes INTEGER DEFAULT 15,
    break_duration_minutes INTEGER DEFAULT 60,
    break_start_time TIME DEFAULT '12:00',
    break_end_time TIME DEFAULT '13:00',
    overtime_start_minutes INTEGER DEFAULT 30, -- Minutes after scheduled end time
    overtime_minimum_minutes INTEGER DEFAULT 60,
    overtime_maximum_hours DECIMAL(4,2) DEFAULT 4.00,
    flexi_time_enabled BOOLEAN DEFAULT false,
    flexi_time_start_range TIME DEFAULT '07:00',
    flexi_time_end_range TIME DEFAULT '10:00',
    settings JSONB DEFAULT '{}',
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- User Work Group Assignments
CREATE TABLE IF NOT EXISTS time.user_work_group_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    work_group_id UUID NOT NULL REFERENCES time.work_groups(id),
    effective_from DATE NOT NULL,
    effective_to DATE,
    custom_start_time TIME,
    custom_end_time TIME,
    custom_working_days INTEGER[],
    custom_minimum_hours DECIMAL(4,2),
    custom_break_start TIME,
    custom_break_end TIME,
    override_reason TEXT,
    approved_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- Work Schedule Templates
CREATE TABLE IF NOT EXISTS time.work_schedule_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    schedule_type VARCHAR(50) CHECK (schedule_type IN ('fixed', 'rotating', 'flexible')),
    rotation_days INTEGER, -- For rotating schedules
    schedule_pattern JSONB, -- Detailed schedule pattern
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- Work Schedule Shifts
CREATE TABLE IF NOT EXISTS time.work_schedule_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES time.work_schedule_templates(id),
    shift_name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration_minutes INTEGER DEFAULT 60,
    break_start_time TIME,
    break_end_time TIME,
    working_hours DECIMAL(4,2),
    color VARCHAR(7), -- Hex color code
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- Work Schedule Exceptions
CREATE TABLE IF NOT EXISTS time.work_schedule_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    exception_date DATE NOT NULL,
    original_start_time TIME,
    original_end_time TIME,
    new_start_time TIME,
    new_end_time TIME,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clock in/out records
CREATE TABLE IF NOT EXISTS time.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    schedule_id UUID NOT NULL REFERENCES time.work_schedule_templates(id),
    record_type TEXT NOT NULL CHECK (record_type IN ('clock_in', 'clock_out', 'break_start', 'break_end')),
    record_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    location_id UUID REFERENCES institution_locations(id),
    status TEXT DEFAULT 'unverified' CHECK (status IN ('unverified', 'verified', 'disputed', 'rejected')),
    notes TEXT,
    verification_method VARCHAR(20) CHECK (verification_method IN ('palm_vein', 'nfc_card', 'mobile_app', 'web_portal')),
    check_in_location JSONB,
    check_out_location JSONB,
    device_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- Attendance summary per day
CREATE TABLE IF NOT EXISTS time.attendance_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    schedule_id UUID NOT NULL REFERENCES time.work_schedule_templates(id),
    work_date DATE NOT NULL,
    first_clock_in TIMESTAMPTZ,
    last_clock_out TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    total_hours DECIMAL(10,2) DEFAULT 0,
    overtime_hours DECIMAL(10,2) DEFAULT 0,
    break_hours DECIMAL(10,2) DEFAULT 0,
    late_minutes INTEGER DEFAULT 0,
    early_out_minutes INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id),
    CONSTRAINT attendance_summary_date_unique UNIQUE(user_id, work_date)
);

-- Enable RLS
ALTER TABLE time.work_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE time.user_work_group_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time.work_schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE time.work_schedule_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE time.work_schedule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE time.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE time.attendance_summary ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable admins to manage time records"
    ON time.attendance_records
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.auth_user_id = auth.uid()
            AND smartid_time_role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.auth_user_id = auth.uid()
            AND smartid_time_role = 'admin'
        )
    );

CREATE POLICY "Allow users to manage their own attendance"
    ON time.attendance_records
    TO authenticated
    USING (
        user_id IN (
            SELECT id FROM users
            WHERE auth_user_id = auth.uid()
        )
    )
    WITH CHECK (
        user_id IN (
            SELECT id FROM users
            WHERE auth_user_id = auth.uid()
        )
    );

-- Function to get user's work schedule for a specific date
CREATE OR REPLACE FUNCTION time.get_user_schedule(
    p_user_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    work_group_id UUID,
    work_group_name VARCHAR,
    start_time TIME,
    end_time TIME,
    working_days INTEGER[],
    minimum_hours DECIMAL,
    late_threshold INTEGER,
    early_threshold INTEGER,
    is_working_day BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wg.id,
        wg.name,
        COALESCE(uwga.custom_start_time, wg.default_start_time),
        COALESCE(uwga.custom_end_time, wg.default_end_time),
        COALESCE(uwga.custom_working_days, wg.working_days),
        COALESCE(uwga.custom_minimum_hours, wg.minimum_working_hours),
        wg.late_threshold_minutes,
        wg.early_leave_threshold_minutes,
        EXTRACT(DOW FROM p_date) + 1 = ANY(COALESCE(uwga.custom_working_days, wg.working_days))
    FROM time.user_work_group_assignments uwga
    JOIN time.work_groups wg ON wg.id = uwga.work_group_id
    WHERE uwga.user_id = p_user_id
        AND uwga.is_active = true
        AND p_date BETWEEN uwga.effective_from AND COALESCE(uwga.effective_to, '9999-12-31')
    ORDER BY uwga.effective_from DESC
    LIMIT 1;

    -- If no assignment found, return default schedule
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            NULL::UUID,
            'Default'::VARCHAR,
            '08:00'::TIME,
            '17:00'::TIME,
            ARRAY[1,2,3,4,5]::INTEGER[],
            8.0::DECIMAL,
            15,
            15,
            EXTRACT(DOW FROM p_date) BETWEEN 1 AND 5;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate working hours between two timestamps
CREATE OR REPLACE FUNCTION time.calculate_working_hours(
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_break_duration INTEGER DEFAULT 60
) RETURNS DECIMAL AS $$
DECLARE
    v_total_minutes INTEGER;
    v_break_minutes INTEGER := p_break_duration;
BEGIN
    -- Calculate total minutes between timestamps
    v_total_minutes := EXTRACT(EPOCH FROM (p_end_time - p_start_time))/60;
    
    -- If total time is more than 4 hours, deduct break time
    IF v_total_minutes >= 240 THEN  -- 4 hours = 240 minutes
        v_total_minutes := v_total_minutes - v_break_minutes;
    END IF;
    
    -- Convert to hours with 2 decimal places
    RETURN ROUND((v_total_minutes::DECIMAL / 60), 2);
END;
$$ LANGUAGE plpgsql;