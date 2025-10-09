-- Sample Data Initialization

-- Clear existing data (if any)
TRUNCATE TABLE 
    users, institutions, institution_locations, attendance_records,
    leave_types, leave_applications, work_groups, user_work_group_assignments,
    merchants, menu_categories, menu_items, pos_accounts
CASCADE;

-- Insert Institution
INSERT INTO institutions (
    id,
    name,
    type,
    registration_number,
    address,
    city,
    state,
    country,
    postal_code,
    phone,
    email,
    contact_person,
    status,
    subscription_plan,
    time_enabled,
    pos_enabled,
    pay_enabled
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'SmartID Academy',
    'school',
    'REG123456',
    '123 Smart Street, Technology Park',
    'Cyberjaya',
    'Selangor',
    'Malaysia',
    '63000',
    '+60123456789',
    'admin@smartid.academy',
    'John Admin',
    'active',
    'premium',
    true,
    true,
    true
);

-- Insert Locations
INSERT INTO institution_locations (
    institution_id,
    name,
    location_type,
    address,
    city,
    state,
    country,
    latitude,
    longitude,
    attendance_radius,
    is_attendance_enabled,
    is_primary
) VALUES
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Main Campus',
    'campus',
    '123 Smart Street, Technology Park',
    'Cyberjaya',
    'Selangor',
    'Malaysia',
    2.9927,
    101.6299,
    300,
    true,
    true
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Cafeteria Building',
    'cafeteria',
    '123 Smart Street, Technology Park',
    'Cyberjaya',
    'Selangor',
    'Malaysia',
    2.9928,
    101.6300,
    100,
    false,
    false
);

-- Insert Admin User
INSERT INTO users (
    id,
    full_name,
    ic_number,
    email,
    phone,
    institution_id,
    primary_system,
    primary_role,
    smartid_time_role,
    smartid_pos_role,
    status,
    employee_id
) VALUES (
    'a47ac10b-58cc-4372-a567-0e02b2c3d479',
    'System Admin',
    '901010-10-1010',
    'admin@smartid.academy',
    '+60123456789',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'time_web',
    'admin',
    'admin',
    'admin',
    'active',
    'ADM001'
);

-- Insert Work Groups
INSERT INTO work_groups (
    id,
    institution_id,
    name,
    description,
    working_days,
    default_start_time,
    default_end_time,
    minimum_working_hours,
    break_duration_minutes,
    is_default
) VALUES
(
    'b47ac10b-58cc-4372-a567-0e02b2c3d479',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Standard Office Hours',
    'Regular 9-5 work schedule',
    ARRAY[1,2,3,4,5],
    '09:00',
    '17:00',
    8.0,
    60,
    true
),
(
    'b47ac10b-58cc-4372-a567-0e02b2c3d480',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Flexible Hours',
    'Flexible work schedule',
    ARRAY[1,2,3,4,5],
    '08:00',
    '18:00',
    8.0,
    60,
    false
);

-- Assign Admin to Work Group
INSERT INTO user_work_group_assignments (
    user_id,
    work_group_id,
    effective_from,
    is_active
) VALUES (
    'a47ac10b-58cc-4372-a567-0e02b2c3d479',
    'b47ac10b-58cc-4372-a567-0e02b2c3d479',
    CURRENT_DATE,
    true
);

-- Insert Leave Types
INSERT INTO leave_types (
    institution_id,
    name,
    code,
    description,
    color,
    has_annual_quota,
    default_quota_days,
    requires_approval,
    is_system_default
) VALUES
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Annual Leave',
    'AL',
    'Regular annual leave entitlement',
    '#4CAF50',
    true,
    14.0,
    true,
    true
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Medical Leave',
    'ML',
    'Sick leave with medical certificate',
    '#F44336',
    true,
    14.0,
    true,
    true
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Emergency Leave',
    'EL',
    'Leave for urgent matters',
    '#FF9800',
    true,
    3.0,
    true,
    true
);

-- Set up leave quotas for admin
INSERT INTO user_leave_quotas (
    user_id,
    leave_type_id,
    quota_year,
    allocated_days
) 
SELECT 
    'a47ac10b-58cc-4372-a567-0e02b2c3d479',
    id,
    EXTRACT(YEAR FROM CURRENT_DATE),
    default_quota_days
FROM leave_types
WHERE institution_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

-- Insert Sample Merchant (Cafeteria)
INSERT INTO merchants (
    id,
    institution_id,
    name,
    merchant_type,
    location_id,
    owner_id,
    status
) VALUES (
    'c47ac10b-58cc-4372-a567-0e02b2c3d479',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Smart Cafe',
    'cafeteria',
    (SELECT id FROM institution_locations WHERE name = 'Cafeteria Building'),
    'a47ac10b-58cc-4372-a567-0e02b2c3d479',
    'active'
);

-- Insert POS Account
INSERT INTO pos_accounts (
    merchant_id,
    institution_id,
    owner_id,
    account_number,
    account_type,
    subscription_plan,
    subscription_status,
    max_devices,
    max_users
) VALUES (
    'c47ac10b-58cc-4372-a567-0e02b2c3d479',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'a47ac10b-58cc-4372-a567-0e02b2c3d479',
    'POS001',
    'standard',
    'premium',
    'active',
    5,
    10
);

-- Insert Menu Categories
INSERT INTO menu_categories (
    merchant_id,
    name,
    description,
    sort_order
) VALUES
(
    'c47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Main Dishes',
    'Main course meals',
    1
),
(
    'c47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Beverages',
    'Drinks and refreshments',
    2
);

-- Insert Menu Items
INSERT INTO menu_items (
    merchant_id,
    category_id,
    name,
    description,
    price,
    is_available
) 
SELECT 
    'c47ac10b-58cc-4372-a567-0e02b2c3d479',
    id,
    'Nasi Goreng',
    'Malaysian fried rice with chicken and vegetables',
    8.50,
    true
FROM menu_categories 
WHERE name = 'Main Dishes'
UNION ALL
SELECT 
    'c47ac10b-58cc-4372-a567-0e02b2c3d479',
    id,
    'Teh Tarik',
    'Malaysian pulled milk tea',
    3.50,
    true
FROM menu_categories 
WHERE name = 'Beverages';

-- Insert Payment Methods
INSERT INTO payment_methods (
    code,
    name,
    category,
    requires_verification,
    is_online
) VALUES
('cash', 'Cash', 'cash', false, false),
('card', 'Credit/Debit Card', 'card', true, true),
('duitnow', 'DuitNow QR', 'ewallet', true, true),
('smartid_card', 'SmartID Card', 'smartid', true, false),
('smartid_palm', 'SmartID Palm', 'smartid', true, false);

-- Enable Payment Methods for Merchant
INSERT INTO merchant_payment_methods (
    merchant_id,
    payment_method_id,
    is_enabled
)
SELECT 
    'c47ac10b-58cc-4372-a567-0e02b2c3d479',
    id,
    true
FROM payment_methods;

-- Sample SmartID Card
INSERT INTO smartid_cards (
    user_id,
    card_number,
    card_type,
    status,
    balance,
    daily_limit,
    monthly_limit
) VALUES (
    'a47ac10b-58cc-4372-a567-0e02b2c3d479',
    'CARD001',
    'staff',
    'active',
    100.00,
    50.00,
    1000.00
);

-- Insert Sample Attendance Records
INSERT INTO attendance_records (
    user_id,
    institution_id,
    date,
    check_in,
    check_out,
    status,
    verification_method,
    location_id
) VALUES (
    'a47ac10b-58cc-4372-a567-0e02b2c3d479',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    CURRENT_DATE,
    CURRENT_TIMESTAMP - INTERVAL '8 hours',
    CURRENT_TIMESTAMP,
    'present',
    'palm_vein',
    (SELECT id FROM institution_locations WHERE is_primary = true)
);