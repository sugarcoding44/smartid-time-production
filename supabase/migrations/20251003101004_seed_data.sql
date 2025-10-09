-- Initial seed data for testing

-- Create test institution
INSERT INTO public.institutions (
    id,
    name,
    type,
    registration_number,
    status,
    subscription_plan,
    timezone,
    time_enabled,
    time_settings
) VALUES (
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'SmartID Demo School',
    'school',
    'EDU123456',
    'active',
    'basic',
    'Asia/Kuala_Lumpur',
    true,
    '{"allow_overtime": true, "overtime_approval_required": true, "leave_approval_required": true}'
);

-- Create test location
INSERT INTO public.institution_locations (
    id,
    institution_id,
    name,
    location_type,
    address,
    city,
    state,
    country,
    postal_code,
    latitude,
    longitude,
    is_primary,
    is_active,
    time_enabled,
    attendance_radius,
    operating_hours
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'Main Campus',
    'campus',
    'Jalan Pintas 1/1',
    'Shah Alam',
    'Selangor',
    'Malaysia',
    '40150',
    3.0731,
    101.5183,
    true,
    true,
    true,
    100,
    '{"start": "08:00", "end": "17:00"}'
);

-- Create test admin user
INSERT INTO public.users (
    id,
    full_name,
    ic_number,
    email,
    phone,
    username,
    institution_id,
    employee_id,
    primary_system,
    primary_role,
    smartid_time_role,
    email_verified,
    phone_verified
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Admin User',
    '901203-14-5566',
    'admin@smartiddemo.edu.my',
    '+60123456789',
    'admin',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'ADM001',
    'time_web',
    'admin',
    'admin',
    true,
    true
);

-- Create test staff user
INSERT INTO public.users (
    id,
    full_name,
    ic_number,
    email,
    phone,
    username,
    institution_id,
    employee_id,
    primary_system,
    primary_role,
    smartid_time_role
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'Staff User',
    '910304-14-5577',
    'staff@smartiddemo.edu.my',
    '+60123456790',
    'staff',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'STF001',
    'time_web',
    'staff',
    'staff'
);

-- Create test user details
INSERT INTO public.user_details (
    id,
    department,
    position,
    join_date
) VALUES 
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Administration',
    'System Administrator',
    '2025-01-01'
),
(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'Academic',
    'Teacher',
    '2025-01-01'
);

-- Create test work group
INSERT INTO time.work_groups (
    id,
    institution_id,
    name,
    description,
    working_days,
    default_start_time,
    default_end_time,
    minimum_working_hours,
    break_duration_minutes,
    is_default,
    created_by,
    updated_by
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d483',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'Regular Office Hours',
    'Standard working hours for staff',
    ARRAY[1,2,3,4,5],
    '08:00',
    '17:00',
    8,
    60,
    true,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
);

-- Assign users to work group
INSERT INTO time.user_work_group_assignments (
    id,
    user_id,
    work_group_id,
    effective_from,
    is_active,
    created_by,
    updated_by
) VALUES 
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d484',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'f47ac10b-58cc-4372-a567-0e02b2c3d483',
    '2025-01-01',
    true,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d485',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'f47ac10b-58cc-4372-a567-0e02b2c3d483',
    '2025-01-01',
    true,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
);

-- Create initial leave types for the test institution
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM leave.leave_types 
        WHERE institution_id = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
        AND code IN ('AL', 'ML', 'EL')
    ) THEN
        -- Annual Leave
        INSERT INTO leave.leave_types (
            id,
            institution_id,
            name,
            code,
            description,
            color,
            has_annual_quota,
            default_quota_days,
            is_system_default,
            created_by,
            updated_by
        ) VALUES (
            'f47ac10b-58cc-4372-a567-0e02b2c3d48c',
            '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
            'Annual Leave',
            'AL',
            'Regular annual leave entitlement',
            '#4CAF50',
            true,
            14.0,
            true,
            'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        );

        -- Medical Leave
        INSERT INTO leave.leave_types (
            id,
            institution_id,
            name,
            code,
            description,
            color,
            has_annual_quota,
            default_quota_days,
            requires_medical_certificate,
            is_system_default,
            created_by,
            updated_by
        ) VALUES (
            'f47ac10b-58cc-4372-a567-0e02b2c3d48d',
            '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
            'Medical Leave',
            'ML',
            'Sick leave with medical certificate',
            '#F44336',
            true,
            14.0,
            true,
            true,
            'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        );

        -- Emergency Leave
        INSERT INTO leave.leave_types (
            id,
            institution_id,
            name,
            code,
            description,
            color,
            has_annual_quota,
            default_quota_days,
            min_advance_notice_days,
            is_system_default,
            created_by,
            updated_by
        ) VALUES (
            'f47ac10b-58cc-4372-a567-0e02b2c3d48e',
            '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
            'Emergency Leave',
            'EL',
            'Leave for urgent personal matters',
            '#FF9800',
            true,
            3.0,
            0,
            true,
            'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
        );
    END IF;
END $$;

-- Create test leave quotas
INSERT INTO leave.user_leave_quotas (
    id,
    user_id,
    leave_type_id,
    quota_year,
    allocated_days,
    created_by,
    updated_by,
    last_updated_by
) VALUES 
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d486',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    (SELECT id FROM leave.leave_types WHERE code = 'AL' AND institution_id = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'),
    2025,
    14,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d487',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    (SELECT id FROM leave.leave_types WHERE code = 'AL' AND institution_id = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'),
    2025,
    14,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
);