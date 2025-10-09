-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Core tables 
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('school', 'university', 'corporate', 'government')),
    registration_number VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    subscription_plan VARCHAR(20) DEFAULT 'basic',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Core Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    ic_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    institution_id UUID REFERENCES institutions(id),
    employee_id VARCHAR(50),
    admin_role BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User Details (extended profile information)
CREATE TABLE IF NOT EXISTS public.user_details (
    id UUID PRIMARY KEY REFERENCES users(id),
    profile_photo_url TEXT,
    department VARCHAR(100),
    position VARCHAR(100),
    join_date DATE,
    emergency_contact JSONB,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Institution Locations
CREATE TABLE IF NOT EXISTS public.institution_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    name VARCHAR(255) NOT NULL,
    location_type VARCHAR(50) CHECK (location_type IN ('campus', 'building', 'cafeteria', 'store', 'office')),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Malaysia',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    attendance_radius INTEGER DEFAULT 100,
    operating_hours JSONB DEFAULT '{"start": "08:00", "end": "17:00"}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Time Management
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    name TEXT NOT NULL,
    description TEXT,
    rules JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- Clock in/out records
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    schedule_id UUID NOT NULL REFERENCES schedules(id),
    record_type TEXT NOT NULL CHECK (record_type IN ('clock_in', 'clock_out', 'break_start', 'break_end')),
    record_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    location_id UUID REFERENCES institution_locations(id),
    status TEXT DEFAULT 'unverified' CHECK (status IN ('unverified', 'verified', 'disputed', 'rejected')),
    notes TEXT,
    verification_method VARCHAR(20) CHECK (verification_method IN ('palm_vein', 'nfc_card', 'mobile_app', 'web_portal')),
    device_info JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- Attendance summary per day
CREATE TABLE IF NOT EXISTS public.attendance_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    schedule_id UUID NOT NULL REFERENCES schedules(id),
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
    UNIQUE(user_id, work_date)
);

-- Break records
CREATE TABLE IF NOT EXISTS public.break_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    schedule_id UUID NOT NULL REFERENCES schedules(id),
    break_start TIMESTAMPTZ NOT NULL,
    break_end TIMESTAMPTZ,
    break_type TEXT CHECK (break_type IN ('lunch', 'tea', 'rest', 'other')),
    duration_minutes INTEGER,
    status TEXT DEFAULT 'unverified' CHECK (status IN ('unverified', 'verified', 'disputed', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- Leave Types
CREATE TABLE IF NOT EXISTS public.leave_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    has_annual_quota BOOLEAN DEFAULT true,
    default_quota_days DECIMAL(5,1) DEFAULT 0,
    allow_half_day BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT true,
    requires_documents BOOLEAN DEFAULT false,
    is_system_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id),
    UNIQUE(institution_id, code)
);

-- Leave Applications
CREATE TABLE IF NOT EXISTS public.leave_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(3,1) NOT NULL,
    half_day_start BOOLEAN DEFAULT false,
    half_day_end BOOLEAN DEFAULT false,
    reason TEXT NOT NULL,
    documents JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- Leave Quotas
CREATE TABLE IF NOT EXISTS public.leave_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    year INTEGER NOT NULL,
    total_days DECIMAL(5,1) NOT NULL,
    used_days DECIMAL(5,1) DEFAULT 0,
    remaining_days DECIMAL(5,1) DEFAULT 0,
    carried_forward DECIMAL(5,1) DEFAULT 0,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id),
    UNIQUE(user_id, leave_type_id, year)
);

-- Holidays
CREATE TABLE IF NOT EXISTS public.holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    name TEXT NOT NULL,
    holiday_date DATE NOT NULL,
    description TEXT,
    holiday_type TEXT CHECK (holiday_type IN ('public', 'company', 'religious', 'other')),
    affects_leave BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.break_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Users can read their institutions"
    ON public.institutions
    FOR SELECT
    USING (id IN (
        SELECT institution_id FROM users
        WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their own profile"
    ON public.users
    FOR ALL
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can view their own attendance"
    ON public.attendance_records
    FOR SELECT
    USING (user_id IN (
        SELECT id FROM users
        WHERE auth_user_id = auth.uid()
    ));

CREATE POLICY "Users can view their own leave applications"
    ON public.leave_applications
    FOR SELECT
    USING (user_id IN (
        SELECT id FROM users
        WHERE auth_user_id = auth.uid()
    ));