-- Initial seed data for testing

-- Create test institution
INSERT INTO public.institutions (
    id,
    name,
    type,
    registration_number,
    status,
    subscription_plan
) VALUES (
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'SmartID Demo School',
    'school',
    'EDU123456',
    'active',
    'basic'
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
    institution_id,
    employee_id,
    admin_role
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Admin User',
    '901203-14-5566',
    'admin@smartiddemo.edu.my',
    '+60123456789',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'ADM001',
    true
);

-- Create test staff user
INSERT INTO public.users (
    id,
    full_name,
    ic_number,
    email,
    phone,
    institution_id,
    employee_id,
    admin_role
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'Staff User',
    '910304-14-5577',
    'staff@smartiddemo.edu.my',
    '+60123456790',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'STF001',
    false
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

-- Create initial leave types
INSERT INTO public.leave_types (
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
) VALUES 
(
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
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d48d',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'Medical Leave',
    'ML',
    'Sick leave with medical certificate',
    '#F44336',
    true,
    14.0,
    true,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d48e',
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    'Emergency Leave',
    'EL',
    'Leave for urgent personal matters',
    '#FF9800',
    true,
    3.0,
    true,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
);

-- Create test leave quotas
INSERT INTO public.leave_quotas (
    id,
    user_id,
    leave_type_id,
    year,
    total_days,
    used_days,
    remaining_days,
    created_by,
    updated_by
) VALUES 
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d486',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'f47ac10b-58cc-4372-a567-0e02b2c3d48c',  -- Annual Leave
    2025,
    14,
    0,
    14,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d487',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'f47ac10b-58cc-4372-a567-0e02b2c3d48c',  -- Annual Leave
    2025,
    14,
    0,
    14,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
);