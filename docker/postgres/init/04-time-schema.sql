-- Work Groups Management
CREATE TABLE IF NOT EXISTS work_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Work Group Assignments
CREATE TABLE IF NOT EXISTS user_work_group_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    work_group_id UUID NOT NULL REFERENCES work_groups(id),
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
    CONSTRAINT no_overlapping_assignments 
        EXCLUDE USING gist (
            user_id WITH =,
            daterange(effective_from, effective_to, '[]') WITH &&
        )
);

-- Institution Holidays
CREATE TABLE IF NOT EXISTS institution_holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    holiday_date DATE NOT NULL,
    end_date DATE, -- For multi-day holidays
    holiday_type VARCHAR(50) NOT NULL CHECK (holiday_type IN ('public', 'school', 'religious', 'special', 'event')),
    is_recurring BOOLEAN DEFAULT false,
    recurring_pattern VARCHAR(50), -- yearly, academic-yearly, etc.
    affected_work_groups UUID[], -- Array of work_group_ids, NULL means all groups
    is_working_day BOOLEAN DEFAULT false, -- True for special working days
    is_half_day BOOLEAN DEFAULT false,
    half_day_end_time TIME,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Holiday Assignments (for specific departments/branches)
CREATE TABLE IF NOT EXISTS holiday_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    holiday_id UUID NOT NULL REFERENCES institution_holidays(id),
    location_id UUID REFERENCES institution_locations(id),
    department_id UUID, -- If you have departments table
    work_group_id UUID REFERENCES work_groups(id),
    override_date DATE, -- If date differs for this assignment
    override_end_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Work Schedule Templates
CREATE TABLE IF NOT EXISTS work_schedule_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    schedule_type VARCHAR(50) CHECK (schedule_type IN ('fixed', 'rotating', 'flexible')),
    rotation_days INTEGER, -- For rotating schedules
    schedule_pattern JSONB, -- Detailed schedule pattern
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Work Schedule Shifts
CREATE TABLE IF NOT EXISTS work_schedule_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES work_schedule_templates(id),
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Work Schedule Exceptions
CREATE TABLE IF NOT EXISTS work_schedule_exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Indexes
CREATE INDEX idx_work_groups_institution ON work_groups(institution_id);
CREATE INDEX idx_user_work_assignments_user ON user_work_group_assignments(user_id);
CREATE INDEX idx_user_work_assignments_group ON user_work_group_assignments(work_group_id);
CREATE INDEX idx_institution_holidays_date ON institution_holidays(holiday_date, end_date);
CREATE INDEX idx_institution_holidays_institution ON institution_holidays(institution_id);
CREATE INDEX idx_holiday_assignments_holiday ON holiday_assignments(holiday_id);
CREATE INDEX idx_work_schedule_templates_institution ON work_schedule_templates(institution_id);

-- Functions for holiday checking
CREATE OR REPLACE FUNCTION is_holiday(
    p_institution_id UUID,
    p_date DATE,
    p_work_group_id UUID DEFAULT NULL
) RETURNS TABLE (
    is_holiday_day BOOLEAN,
    holiday_name VARCHAR,
    holiday_type VARCHAR,
    is_working_day BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TRUE,
        h.name,
        h.holiday_type,
        h.is_working_day
    FROM institution_holidays h
    WHERE h.institution_id = p_institution_id
        AND p_date BETWEEN h.holiday_date AND COALESCE(h.end_date, h.holiday_date)
        AND (
            h.affected_work_groups IS NULL 
            OR p_work_group_id IS NULL 
            OR p_work_group_id = ANY(h.affected_work_groups)
        )
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::VARCHAR, FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's work schedule for a specific date
CREATE OR REPLACE FUNCTION get_user_work_schedule(
    p_user_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
    work_group_id UUID,
    work_group_name VARCHAR,
    start_time TIME,
    end_time TIME,
    working_days INTEGER[],
    minimum_hours DECIMAL,
    late_threshold_minutes INTEGER,
    early_leave_threshold_minutes INTEGER,
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
    FROM user_work_group_assignments uwga
    JOIN work_groups wg ON wg.id = uwga.work_group_id
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
            15::INTEGER,
            15::INTEGER,
            EXTRACT(DOW FROM p_date) BETWEEN 1 AND 5;
    END IF;
END;
$$ LANGUAGE plpgsql;