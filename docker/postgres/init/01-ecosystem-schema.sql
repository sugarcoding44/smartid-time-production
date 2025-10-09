-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS public;

-- Core tables (shared across all systems)

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

-- SmartID TIME specific tables

CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    location_id UUID REFERENCES institution_locations(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) CHECK (status IN ('present', 'late', 'absent', 'leave', 'holiday')),
    verification_method VARCHAR(20) CHECK (verification_method IN ('palm_vein', 'nfc_card', 'mobile_app', 'web_portal')),
    check_in_location JSONB,
    check_out_location JSONB,
    device_id VARCHAR(100),
    total_hours DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SmartID POS specific tables

CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_id UUID REFERENCES institutions(id),
    owner_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    merchant_type VARCHAR(50) CHECK (merchant_type IN ('cafeteria', 'store', 'kiosk', 'food_court')),
    location_id UUID REFERENCES institution_locations(id),
    business_reg_no VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SmartID PAY specific tables

CREATE TABLE IF NOT EXISTS smartid_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    card_number VARCHAR(50) UNIQUE,
    card_type VARCHAR(20) CHECK (card_type IN ('student', 'staff', 'parent')),
    status VARCHAR(20) DEFAULT 'active',
    balance DECIMAL(10,2) DEFAULT 0.00,
    daily_limit DECIMAL(10,2),
    monthly_limit DECIMAL(10,2),
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cross-system relationships

-- Parent-Student Relationships (for PAY and TIME)
CREATE TABLE IF NOT EXISTS parent_student_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES users(id),
    student_id UUID NOT NULL REFERENCES users(id),
    relationship_type VARCHAR(20) CHECK (relationship_type IN ('parent', 'guardian')),
    is_emergency_contact BOOLEAN DEFAULT false,
    can_view_attendance BOOLEAN DEFAULT true,
    can_manage_wallet BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (parent_id, student_id)
);

-- Indexes
CREATE INDEX idx_users_institution ON users(institution_id);
CREATE INDEX idx_users_auth_id ON users(auth_user_id);
CREATE INDEX idx_attendance_user_date ON attendance_records(user_id, date);
CREATE INDEX idx_merchants_institution ON merchants(institution_id);
CREATE INDEX idx_smartid_cards_user ON smartid_cards(user_id);

-- Functions for role/permission checking
CREATE OR REPLACE FUNCTION user_has_system_access(user_id UUID, system_name VARCHAR) 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = user_id AND (
            (system_name = 'time' AND smartid_time_role IS NOT NULL) OR
            (system_name = 'pos' AND smartid_pos_role IS NOT NULL) OR
            (system_name = 'pay' AND smartid_pay_role IS NOT NULL) OR
            (system_name = 'hq' AND smartid_hq_role IS NOT NULL)
        )
    );
END;
$$ LANGUAGE plpgsql;