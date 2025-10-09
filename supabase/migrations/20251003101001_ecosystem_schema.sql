-- Institutions (base organization table)
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('school', 'university', 'corporate', 'government')),
    registration_number VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Malaysia',
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    contact_person VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    subscription_plan VARCHAR(20) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
    timezone VARCHAR(50) DEFAULT 'Asia/Kuala_Lumpur',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- SmartID TIME specific
    time_enabled BOOLEAN DEFAULT false,
    time_settings JSONB DEFAULT '{}',
    
    -- SmartID POS specific
    pos_enabled BOOLEAN DEFAULT false,
    pos_connected_at TIMESTAMP WITH TIME ZONE,
    pos_status VARCHAR(20) DEFAULT 'disconnected',
    pos_settings JSONB DEFAULT '{}',
    
    -- SmartID PAY specific
    pay_enabled BOOLEAN DEFAULT false,
    pay_settings JSONB DEFAULT '{}'
);

-- Core Users table (unified user management)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE, -- For auth provider mapping
    full_name VARCHAR(255) NOT NULL,
    ic_number VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(50),
    username VARCHAR(50) UNIQUE,
    password_hash TEXT, -- For systems requiring direct auth
    employee_id VARCHAR(50),
    institution_id UUID REFERENCES institutions(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    
    -- System-specific roles
    primary_system VARCHAR(20) NOT NULL CHECK (primary_system IN ('time_web', 'time_mobile', 'hub_web', 'hub_mobile', 'hq', 'pos', 'pay')),
    primary_role VARCHAR(50) NOT NULL,
    
    -- Role per system
    smartid_time_role VARCHAR(20) CHECK (smartid_time_role IN ('admin', 'supervisor', 'staff', 'student', NULL)),
    smartid_pos_role VARCHAR(20) CHECK (smartid_pos_role IN ('owner', 'admin', 'manager', 'staff', 'cashier', NULL)),
    smartid_pay_role VARCHAR(20) CHECK (smartid_pay_role IN ('parent', 'student', 'staff', NULL)),
    smartid_hq_role VARCHAR(20) CHECK (smartid_hq_role IN ('hq_superadmin', 'hq_admin', 'hq_support', 'hq_analyst', NULL)),
    
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    requires_password_change BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Details (extended profile information)
CREATE TABLE IF NOT EXISTS user_details (
    id UUID PRIMARY KEY REFERENCES users(id),
    profile_photo_url TEXT,
    department VARCHAR(100),
    position VARCHAR(100),
    join_date DATE,
    emergency_contact JSONB,
    address TEXT,
    additional_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Institution Locations (shared across systems)
CREATE TABLE IF NOT EXISTS institution_locations (
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
    
    -- SmartID TIME specific
    time_enabled BOOLEAN DEFAULT false,
    attendance_radius INTEGER DEFAULT 100,
    operating_hours JSONB DEFAULT '{"start": "08:00", "end": "17:00"}',
    
    -- SmartID POS specific
    pos_enabled BOOLEAN DEFAULT false,
    pos_terminal_id VARCHAR(50),
    pos_settings JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_auth_id ON users(auth_user_id);
CREATE INDEX idx_users_ic_number ON users(ic_number);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_locations_institution ON institution_locations(institution_id);

-- Enable RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_locations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable admins to manage everything"
    ON public.institutions
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.auth_user_id = auth.uid()
            AND smartid_hq_role IN ('hq_superadmin', 'hq_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.auth_user_id = auth.uid()
            AND smartid_hq_role IN ('hq_superadmin', 'hq_admin')
        )
    );

CREATE POLICY "Allow users to read their institution"
    ON public.institutions
    FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT institution_id FROM users
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Enable admins to manage users"
    ON public.users
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.auth_user_id = auth.uid()
            AND (
                u.smartid_time_role = 'admin'
                OR u.smartid_pos_role IN ('owner', 'admin')
                OR u.smartid_hq_role IN ('hq_superadmin', 'hq_admin')
            )
            AND u.institution_id = institution_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.auth_user_id = auth.uid()
            AND (
                u.smartid_time_role = 'admin'
                OR u.smartid_pos_role IN ('owner', 'admin')
                OR u.smartid_hq_role IN ('hq_superadmin', 'hq_admin')
            )
            AND u.institution_id = institution_id
        )
    );

CREATE POLICY "Allow users to read other users from same institution"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (
        institution_id IN (
            SELECT institution_id FROM users
            WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Allow users to manage their own profile"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());