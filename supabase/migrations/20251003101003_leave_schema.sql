-- Leave Types
CREATE TABLE IF NOT EXISTS leave.leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    color VARCHAR(7),  -- Hex color code
    icon_url TEXT,
    
    -- Quota settings
    has_annual_quota BOOLEAN DEFAULT true,
    default_quota_days DECIMAL(5,1) DEFAULT 0,
    allow_carry_forward BOOLEAN DEFAULT false,
    max_carry_forward_days DECIMAL(5,1),
    carry_forward_expiry_months INTEGER DEFAULT 6,
    quota_reset_month INTEGER DEFAULT 1,  -- Month when quota resets (1-12)
    
    -- Approval settings
    requires_approval BOOLEAN DEFAULT true,
    requires_medical_certificate BOOLEAN DEFAULT false,
    requires_documents BOOLEAN DEFAULT false,
    allowed_document_types VARCHAR[],
    min_advance_notice_days INTEGER DEFAULT 0,
    max_consecutive_days INTEGER,
    min_days_between_applications INTEGER DEFAULT 0,
    
    -- Leave rules
    is_paid BOOLEAN DEFAULT true,
    allow_half_day BOOLEAN DEFAULT true,
    allow_hourly BOOLEAN DEFAULT false,
    min_hours INTEGER,
    affects_attendance BOOLEAN DEFAULT true,
    counts_as_present BOOLEAN DEFAULT false,
    excludes_holidays BOOLEAN DEFAULT true,
    excludes_weekends BOOLEAN DEFAULT true,
    
    -- Access control
    applicable_roles VARCHAR[] DEFAULT ARRAY['staff', 'teacher'],
    gender_specific VARCHAR(10),  -- male, female, or NULL
    min_service_months INTEGER DEFAULT 0,
    
    -- Status
    is_system_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id),
    
    UNIQUE (institution_id, code)
);

-- User Leave Quotas
CREATE TABLE IF NOT EXISTS leave.user_leave_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    leave_type_id UUID NOT NULL REFERENCES leave.leave_types(id),
    quota_year INTEGER NOT NULL,
    allocated_days DECIMAL(5,1) NOT NULL DEFAULT 0,
    carried_forward_days DECIMAL(5,1) DEFAULT 0,
    carried_forward_expiry DATE,
    additional_days DECIMAL(5,1) DEFAULT 0,
    additional_days_reason TEXT,
    used_days DECIMAL(5,1) DEFAULT 0,
    pending_days DECIMAL(5,1) DEFAULT 0,
    available_days DECIMAL(5,1) GENERATED ALWAYS AS (
        allocated_days + carried_forward_days + additional_days - used_days - pending_days
    ) STORED,
    last_updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id),
    UNIQUE (user_id, leave_type_id, quota_year)
);

-- Leave Applications
CREATE TABLE IF NOT EXISTS leave.leave_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    leave_type_id UUID NOT NULL REFERENCES leave.leave_types(id),
    
    -- Leave period
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(3,1) NOT NULL,
    half_day_start BOOLEAN DEFAULT false,
    half_day_end BOOLEAN DEFAULT false,
    
    -- Application details
    reason TEXT NOT NULL,
    emergency_contact JSONB,  -- Contact details during leave
    medical_certificate_url TEXT,
    attachments JSONB,  -- Array of attachment URLs and descriptions
    
    -- Status and approval
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'cancelled')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    applied_date DATE DEFAULT CURRENT_DATE,
    
    -- System fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Leave Approval Workflow
CREATE TABLE IF NOT EXISTS leave.leave_approval_workflow (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leave_application_id UUID NOT NULL REFERENCES leave.leave_applications(id),
    approval_level INTEGER NOT NULL DEFAULT 1,
    approver_role VARCHAR(50) NOT NULL,  -- supervisor, hod, hr, etc.
    approver_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'delegated')),
    response_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    delegated_to UUID REFERENCES users(id),
    delegation_reason TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);
eated_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- Leave Cancellation Requests
CREATE TABLE IF NOT EXISTS leave.leave_cancellation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leave_application_id UUID NOT NULL REFERENCES leave.leave_applications(id),
    requested_by UUID NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- Leave Balance Adjustments
CREATE TABLE IF NOT EXISTS leave.leave_balance_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    leave_type_id UUID NOT NULL REFERENCES leave.leave_types(id),
    quota_year INTEGER NOT NULL,
    adjustment_type VARCHAR(20) NOT NULL 
        CHECK (adjustment_type IN ('addition', 'deduction', 'correction')),
    days DECIMAL(5,1) NOT NULL,
    reason TEXT NOT NULL,
    adjusted_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_leave_types_institution ON leave.leave_types(institution_id);
CREATE INDEX idx_user_leave_quotas_user ON leave.user_leave_quotas(user_id);
CREATE INDEX idx_user_leave_quotas_type_year ON leave.user_leave_quotas(leave_type_id, quota_year);
CREATE INDEX idx_leave_applications_user ON leave.leave_applications(user_id);
CREATE INDEX idx_leave_applications_institution ON leave.leave_applications(institution_id);
CREATE INDEX idx_leave_applications_dates ON leave.leave_applications(start_date, end_date);
CREATE INDEX idx_leave_applications_status ON leave.leave_applications(status);
CREATE INDEX idx_leave_approval_workflow_application ON leave.leave_approval_workflow(leave_application_id);
CREATE INDEX idx_leave_approval_workflow_approver ON leave.leave_approval_workflow(approver_id);

-- Enable RLS
ALTER TABLE leave.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave.user_leave_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave.leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave.leave_approval_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave.leave_cancellation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave.leave_balance_adjustments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow users to read leave types from their institution"
    ON leave.leave_types
    FOR SELECT
    TO authenticated
    USING (
        institution_id IN (
            SELECT institution_id FROM users
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to read their leave quotas"
    ON leave.user_leave_quotas
    FOR SELECT
    TO authenticated
    USING (
        user_id IN (
            SELECT id FROM users
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to manage their leave applications"
    ON leave.leave_applications
    TO authenticated
    USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()))
    WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Function to calculate leave days between two dates
CREATE OR REPLACE FUNCTION leave.calculate_leave_days(
    p_start_date DATE,
    p_end_date DATE,
    p_exclude_weekends BOOLEAN DEFAULT true,
    p_exclude_holidays BOOLEAN DEFAULT true,
    p_half_day_start BOOLEAN DEFAULT false,
    p_half_day_end BOOLEAN DEFAULT false,
    p_institution_id UUID = NULL
) RETURNS DECIMAL(3,1) AS $$
DECLARE
    v_days DECIMAL(3,1) := 0;
    v_current_date DATE := p_start_date;
    v_is_holiday BOOLEAN;
    v_is_weekend BOOLEAN;
BEGIN
    WHILE v_current_date <= p_end_date LOOP
        v_is_weekend := EXTRACT(DOW FROM v_current_date) IN (0, 6);
        
        IF p_institution_id IS NOT NULL THEN
            SELECT EXISTS (
                SELECT 1 FROM time.holidays
                WHERE institution_id = p_institution_id
                AND holiday_date = v_current_date
            ) INTO v_is_holiday;
        ELSE
            v_is_holiday := false;
        END IF;
        
        -- Check if we should count this day
        IF (NOT p_exclude_weekends OR NOT v_is_weekend)
            AND (NOT p_exclude_holidays OR NOT v_is_holiday)
        THEN
            -- Add full or half day
            IF (v_current_date = p_start_date AND p_half_day_start) OR
               (v_current_date = p_end_date AND p_half_day_end)
            THEN
                v_days := v_days + 0.5;
            ELSE
                v_days := v_days + 1;
            END IF;
        END IF;
        
        v_current_date := v_current_date + 1;
    END LOOP;
    
    RETURN v_days;
END;
$$ LANGUAGE plpgsql;

-- Default leave types for each institution
INSERT INTO leave.leave_types (
    institution_id,
    name,
    code,
    description,
    color,
    has_annual_quota,
    default_quota_days,
    is_system_default
)
SELECT 
    i.id,
    'Annual Leave',
    'AL',
    'Regular annual leave entitlement',
    '#4CAF50',
    true,
    14.0,
    true
FROM institutions i
WHERE NOT EXISTS (
    SELECT 1 FROM leave.leave_types 
    WHERE institution_id = i.id AND code = 'AL'
);

INSERT INTO leave.leave_types (
    institution_id,
    name,
    code,
    description,
    color,
    has_annual_quota,
    default_quota_days,
    requires_medical_certificate,
    is_system_default
)
SELECT 
    i.id,
    'Medical Leave',
    'ML',
    'Sick leave with medical certificate',
    '#F44336',
    true,
    14.0,
    true,
    true
FROM institutions i
WHERE NOT EXISTS (
    SELECT 1 FROM leave.leave_types 
    WHERE institution_id = i.id AND code = 'ML'
);

INSERT INTO leave.leave_types (
    institution_id,
    name,
    code,
    description,
    color,
    has_annual_quota,
    default_quota_days,
    min_advance_notice_days,
    is_system_default
)
SELECT 
    i.id,
    'Emergency Leave',
    'EL',
    'Leave for urgent personal matters',
    '#FF9800',
    true,
    3.0,
    0,
    true
FROM institutions i
WHERE NOT EXISTS (
    SELECT 1 FROM leave.leave_types 
    WHERE institution_id = i.id AND code = 'EL'
);