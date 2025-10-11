-- ================================================
-- RFID Smart Card System Integration with Existing Attendance
-- Integrates with your current attendance_records table structure
-- ================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- 1. RFID Card Management (Same as before)
-- ================================================

-- SmartID Cards table - stores physical card information
-- All cards are "SmartID Cards" but can be RFID or NFC type
CREATE TABLE IF NOT EXISTS public.smartid_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_uid VARCHAR(50) NOT NULL UNIQUE, -- Card UID from XT-N424 WR reader
    card_brand VARCHAR(50) NOT NULL DEFAULT 'SmartID Card', -- Always "SmartID Card"
    card_technology VARCHAR(20) NOT NULL CHECK (card_technology IN ('rfid', 'nfc')), -- RFID or NFC
    card_chip_type VARCHAR(50) NOT NULL, -- ntag424, mifare-1k, etc.
    card_number VARCHAR(50) UNIQUE, -- Human-readable card number
    card_name VARCHAR(100), -- Optional friendly name
    manufacturer VARCHAR(50) DEFAULT 'NXP', -- NXP, etc.
    uid_length INTEGER NOT NULL, -- 7 bytes for NTAG424, 4 for MIFARE Classic
    atq VARCHAR(10), -- Answer To Request from reader
    sak VARCHAR(10), -- Select Acknowledge from reader
    is_active BOOLEAN DEFAULT true,
    last_detected_at TIMESTAMPTZ,
    detection_count INTEGER DEFAULT 0,
    reader_info JSONB DEFAULT '{}', -- Reader type, connection info, etc.
    technical_data JSONB DEFAULT '{}', -- ATQ, SAK, memory size, etc.
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Card Enrollment - links cards to users and institutions
CREATE TABLE IF NOT EXISTS public.card_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES smartid_cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES institutions(id),
    enrollment_status VARCHAR(20) DEFAULT 'active' CHECK (
        enrollment_status IN ('pending', 'active', 'suspended', 'expired', 'revoked')
    ),
    enrollment_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMPTZ, -- Optional card expiry
    access_level VARCHAR(20) DEFAULT 'standard' CHECK (
        access_level IN ('basic', 'standard', 'premium', 'admin', 'security')
    ),
    allowed_locations UUID[] DEFAULT '{}', -- Array of location IDs where card can be used
    access_schedule JSONB DEFAULT '{}', -- Time-based access restrictions
    enrollment_reason TEXT,
    enrolled_by UUID NOT NULL REFERENCES users(id),
    last_used_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(card_id, user_id, institution_id)
);

-- Card Access Events - log every card tap/detection
CREATE TABLE IF NOT EXISTS public.card_access_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES smartid_cards(id),
    enrollment_id UUID REFERENCES card_enrollments(id),
    user_id UUID REFERENCES users(id),
    institution_id UUID REFERENCES institutions(id),
    location_id UUID REFERENCES institution_locations(id),
    event_type VARCHAR(20) NOT NULL CHECK (
        event_type IN ('attendance_in', 'attendance_out', 'door_access', 'payment', 'enrollment', 'verification')
    ),
    access_result VARCHAR(20) NOT NULL CHECK (
        access_result IN ('granted', 'denied', 'pending', 'error')
    ),
    denial_reason VARCHAR(100), -- expired, suspended, wrong_location, etc.
    reader_type VARCHAR(50) DEFAULT 'XT-N424-WR',
    reader_location VARCHAR(100),
    detected_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    processing_time_ms INTEGER, -- Time taken to process the card
    technical_details JSONB DEFAULT '{}', -- ATQ, SAK, signal strength, etc.
    device_info JSONB DEFAULT '{}', -- Reader info, connection type, etc.
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- 2. E-Wallet System (Same as before)
-- ================================================

-- E-Wallet accounts - one per card enrollment
CREATE TABLE IF NOT EXISTS public.card_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID NOT NULL REFERENCES card_enrollments(id) ON DELETE CASCADE,
    wallet_number VARCHAR(50) UNIQUE NOT NULL, -- Generated wallet number
    currency_code VARCHAR(3) DEFAULT 'MYR',
    balance DECIMAL(15,2) DEFAULT 0.00 CHECK (balance >= 0),
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    daily_limit DECIMAL(15,2) DEFAULT 500.00,
    monthly_limit DECIMAL(15,2) DEFAULT 5000.00,
    wallet_status VARCHAR(20) DEFAULT 'active' CHECK (
        wallet_status IN ('active', 'suspended', 'frozen', 'closed')
    ),
    pin_hash VARCHAR(255), -- Encrypted PIN for transactions
    pin_attempts INTEGER DEFAULT 0,
    last_pin_attempt_at TIMESTAMPTZ,
    auto_topup_enabled BOOLEAN DEFAULT false,
    auto_topup_threshold DECIMAL(15,2) DEFAULT 50.00,
    auto_topup_amount DECIMAL(15,2) DEFAULT 100.00,
    last_transaction_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id)
);

-- Wallet Transactions
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES card_wallets(id),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (
        transaction_type IN ('credit', 'debit', 'topup', 'refund', 'fee', 'penalty', 'adjustment')
    ),
    category VARCHAR(50) CHECK (
        category IN ('food', 'beverage', 'stationery', 'transport', 'parking', 'service', 'other')
    ),
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    reference_number VARCHAR(100), -- External reference
    location_id UUID REFERENCES institution_locations(id),
    merchant_info JSONB DEFAULT '{}',
    payment_method VARCHAR(20) CHECK (
        payment_method IN ('card_tap', 'mobile_app', 'bank_transfer', 'cash', 'admin_adjustment')
    ),
    status VARCHAR(20) DEFAULT 'completed' CHECK (
        status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')
    ),
    processed_by UUID REFERENCES users(id),
    card_access_event_id UUID REFERENCES card_access_events(id), -- Link to card tap event
    transaction_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- 3. Integration with Existing Attendance Records
-- ================================================

-- Add RFID-specific columns to your existing attendance_records table
ALTER TABLE public.attendance_records 
ADD COLUMN IF NOT EXISTS card_access_event_id UUID REFERENCES card_access_events(id),
ADD COLUMN IF NOT EXISTS card_uid VARCHAR(50),
ADD COLUMN IF NOT EXISTS reader_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS rfid_device_info JSONB DEFAULT '{}';

-- Update verification_method constraint to include RFID card types
ALTER TABLE public.attendance_records 
DROP CONSTRAINT IF EXISTS attendance_records_verification_method_check;

ALTER TABLE public.attendance_records 
ADD CONSTRAINT attendance_records_verification_method_check 
CHECK (
    verification_method IN (
        'palm_vein', 'nfc_card', 'manual', 'manual_mobile', 'manual_web', 
        'palm', 'smart_card', 'biometric', 'rfid_card', 'smartid_card'
    )
);

-- Create index for RFID-related lookups
CREATE INDEX IF NOT EXISTS idx_attendance_records_card_access_event ON attendance_records(card_access_event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_card_uid ON attendance_records(card_uid);
CREATE INDEX IF NOT EXISTS idx_attendance_records_reader_type ON attendance_records(reader_type);

-- ================================================
-- 4. Indexes for Performance (RFID tables)
-- ================================================

-- SmartID Cards indexes
CREATE INDEX IF NOT EXISTS idx_smartid_cards_uid ON smartid_cards(card_uid);
CREATE INDEX IF NOT EXISTS idx_smartid_cards_technology ON smartid_cards(card_technology);
CREATE INDEX IF NOT EXISTS idx_smartid_cards_chip_type ON smartid_cards(card_chip_type);
CREATE INDEX IF NOT EXISTS idx_smartid_cards_active ON smartid_cards(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_smartid_cards_last_detected ON smartid_cards(last_detected_at);
CREATE INDEX IF NOT EXISTS idx_smartid_cards_brand_tech ON smartid_cards(card_brand, card_technology);

-- Card Enrollments indexes
CREATE INDEX IF NOT EXISTS idx_card_enrollments_card_id ON card_enrollments(card_id);
CREATE INDEX IF NOT EXISTS idx_card_enrollments_user_id ON card_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_card_enrollments_institution_id ON card_enrollments(institution_id);
CREATE INDEX IF NOT EXISTS idx_card_enrollments_status ON card_enrollments(enrollment_status);
CREATE INDEX IF NOT EXISTS idx_card_enrollments_active ON card_enrollments(enrollment_status) WHERE enrollment_status = 'active';

-- Access Events indexes
CREATE INDEX IF NOT EXISTS idx_card_access_events_card_id ON card_access_events(card_id);
CREATE INDEX IF NOT EXISTS idx_card_access_events_user_id ON card_access_events(user_id);
CREATE INDEX IF NOT EXISTS idx_card_access_events_detected_at ON card_access_events(detected_at);
CREATE INDEX IF NOT EXISTS idx_card_access_events_event_type ON card_access_events(event_type);
CREATE INDEX IF NOT EXISTS idx_card_access_events_result ON card_access_events(access_result);
CREATE INDEX IF NOT EXISTS idx_card_access_events_location ON card_access_events(location_id);

-- Wallet indexes
CREATE INDEX IF NOT EXISTS idx_card_wallets_enrollment_id ON card_wallets(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_card_wallets_number ON card_wallets(wallet_number);
CREATE INDEX IF NOT EXISTS idx_card_wallets_status ON card_wallets(wallet_status);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_number ON wallet_transactions(transaction_number);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_date ON wallet_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(transaction_type);

-- ================================================
-- 5. Security & RLS Policies (Same as before)
-- ================================================

-- Enable Row Level Security
ALTER TABLE public.smartid_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_access_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for SmartID Cards (Institution-based access)
CREATE POLICY "smartid_cards_select" ON public.smartid_cards FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM card_enrollments ce 
        JOIN users u ON ce.user_id = u.id 
        WHERE ce.card_id = smartid_cards.id 
        AND u.institution_id = (
            SELECT institution_id FROM users 
            WHERE auth_user_id = auth.uid()
        )
    )
);

CREATE POLICY "smartid_cards_insert" ON public.smartid_cards FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE auth_user_id = auth.uid() 
        AND (
            smartid_time_role IN ('admin', 'manager') OR 
            smartid_pos_role IN ('owner', 'admin', 'manager') OR
            smartid_hq_role IS NOT NULL OR
            can_manage_staff = true
        )
    )
);

-- RLS Policies for Card Enrollments
CREATE POLICY "card_enrollments_select" ON public.card_enrollments FOR SELECT USING (
    institution_id = (
        SELECT institution_id FROM users 
        WHERE auth_user_id = auth.uid()
    )
);

CREATE POLICY "card_enrollments_insert" ON public.card_enrollments FOR INSERT WITH CHECK (
    institution_id = (
        SELECT institution_id FROM users 
        WHERE auth_user_id = auth.uid()
    )
    AND EXISTS (
        SELECT 1 FROM users 
        WHERE auth_user_id = auth.uid() 
        AND (
            smartid_time_role IN ('admin', 'manager') OR 
            smartid_pos_role IN ('owner', 'admin', 'manager') OR
            smartid_hq_role IS NOT NULL OR
            can_manage_staff = true
        )
    )
);

-- ================================================
-- 6. Functions for Business Logic
-- ================================================

-- Function to generate wallet number
CREATE OR REPLACE FUNCTION generate_wallet_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        -- Generate format: WLT-YYYYMMDD-NNNNNN
        new_number := 'WLT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                      LPAD(FLOOR(RANDOM() * 999999 + 1)::TEXT, 6, '0');
        
        SELECT COUNT(*) INTO exists_check 
        FROM card_wallets 
        WHERE wallet_number = new_number;
        
        EXIT WHEN exists_check = 0;
    END LOOP;
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate transaction number
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        -- Generate format: TXN-YYYYMMDDHHMMSS-NNNNN
        new_number := 'TXN-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || '-' || 
                      LPAD(FLOOR(RANDOM() * 99999 + 1)::TEXT, 5, '0');
        
        SELECT COUNT(*) INTO exists_check 
        FROM wallet_transactions 
        WHERE transaction_number = new_number;
        
        EXIT WHEN exists_check = 0;
    END LOOP;
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-create wallet when card is enrolled
CREATE OR REPLACE FUNCTION create_wallet_on_enrollment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.enrollment_status = 'active' THEN
        INSERT INTO card_wallets (
            enrollment_id,
            wallet_number,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            generate_wallet_number(),
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create wallet
CREATE TRIGGER trigger_create_wallet_on_enrollment
    AFTER INSERT ON card_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION create_wallet_on_enrollment();

-- Function to update card detection stats
CREATE OR REPLACE FUNCTION update_card_detection()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE smartid_cards 
    SET 
        last_detected_at = NEW.detected_at,
        detection_count = detection_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.card_id;
    
    -- Update enrollment usage
    UPDATE card_enrollments 
    SET 
        last_used_at = NEW.detected_at,
        usage_count = usage_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.enrollment_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update detection counts
CREATE TRIGGER trigger_update_card_detection
    AFTER INSERT ON card_access_events
    FOR EACH ROW
    EXECUTE FUNCTION update_card_detection();

-- Function to handle RFID attendance check-in/check-out
CREATE OR REPLACE FUNCTION handle_rfid_attendance(
    p_user_id UUID,
    p_institution_id UUID,
    p_card_access_event_id UUID,
    p_card_uid VARCHAR,
    p_location JSONB DEFAULT NULL,
    p_device_id VARCHAR DEFAULT 'XT-N424-WR',
    p_work_group_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    existing_record attendance_records%ROWTYPE;
    attendance_action VARCHAR := 'check_in';
    result JSONB;
BEGIN
    -- Check if user already has attendance record for today
    SELECT * INTO existing_record 
    FROM attendance_records 
    WHERE user_id = p_user_id 
    AND date = today_date;
    
    IF FOUND THEN
        -- User already has a record for today
        IF existing_record.check_in_time IS NOT NULL AND existing_record.check_out_time IS NULL THEN
            -- Check out
            attendance_action := 'check_out';
            
            UPDATE attendance_records 
            SET 
                check_out_time = CURRENT_TIMESTAMP,
                check_out_location = p_location,
                verification_method = 'smartid_card',
                device_id = p_device_id,
                updated_at = CURRENT_TIMESTAMP,
                rfid_device_info = jsonb_build_object(
                    'card_access_event_id', p_card_access_event_id,
                    'card_uid', p_card_uid,
                    'reader_type', 'XT-N424-WR',
                    'action', 'check_out'
                )
            WHERE id = existing_record.id;
            
        ELSE
            -- Already checked out, create new record or ignore
            attendance_action := 'already_complete';
        END IF;
    ELSE
        -- Create new attendance record (check in)
        INSERT INTO attendance_records (
            user_id,
            institution_id,
            check_in_time,
            date,
            status,
            verification_method,
            device_id,
            check_in_location,
            work_group_id,
            card_access_event_id,
            card_uid,
            reader_type,
            rfid_device_info,
            created_at,
            updated_at
        ) VALUES (
            p_user_id,
            p_institution_id,
            CURRENT_TIMESTAMP,
            today_date,
            'present',
            'smartid_card',
            p_device_id,
            p_location,
            p_work_group_id,
            p_card_access_event_id,
            p_card_uid,
            'XT-N424-WR',
            jsonb_build_object(
                'card_access_event_id', p_card_access_event_id,
                'card_uid', p_card_uid,
                'reader_type', 'XT-N424-WR',
                'action', 'check_in'
            ),
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
    END IF;
    
    -- Return result
    result := jsonb_build_object(
        'action', attendance_action,
        'user_id', p_user_id,
        'date', today_date,
        'timestamp', CURRENT_TIMESTAMP
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 7. Views for Easy Querying
-- ================================================

-- View for active card enrollments with user and wallet info
CREATE OR REPLACE VIEW active_card_enrollments AS
SELECT 
    ce.id AS enrollment_id,
    sc.id AS card_id,
    sc.card_uid,
    sc.card_brand,
    sc.card_technology,
    sc.card_chip_type,
    sc.card_number,
    u.full_name AS user_name,
    u.employee_id,
    u.email,
    i.name AS institution_name,
    ce.access_level,
    ce.enrollment_date,
    ce.expiry_date,
    cw.wallet_number,
    cw.balance AS wallet_balance,
    cw.wallet_status,
    sc.last_detected_at,
    ce.usage_count
FROM card_enrollments ce
JOIN smartid_cards sc ON ce.card_id = sc.id
JOIN users u ON ce.user_id = u.id
JOIN institutions i ON ce.institution_id = i.id
LEFT JOIN card_wallets cw ON cw.enrollment_id = ce.id
WHERE ce.enrollment_status = 'active' 
AND sc.is_active = true;

-- View for recent card access events
CREATE OR REPLACE VIEW recent_card_access AS
SELECT 
    cae.id,
    cae.event_type,
    cae.access_result,
    sc.card_uid,
    sc.card_brand,
    sc.card_technology,
    u.full_name AS user_name,
    il.name AS location_name,
    cae.detected_at,
    cae.processing_time_ms,
    cae.reader_type
FROM card_access_events cae
JOIN smartid_cards sc ON cae.card_id = sc.id
LEFT JOIN users u ON cae.user_id = u.id
LEFT JOIN institution_locations il ON cae.location_id = il.id
ORDER BY cae.detected_at DESC;

-- View for today's SmartID card attendance
CREATE OR REPLACE VIEW todays_smartid_attendance AS
SELECT 
    ar.id,
    u.full_name AS user_name,
    u.employee_id,
    ar.check_in_time,
    ar.check_out_time,
    ar.status,
    ar.card_uid,
    ar.reader_type,
    ar.check_in_location,
    ar.check_out_location,
    i.name AS institution_name,
    ar.verification_method
FROM attendance_records ar
JOIN users u ON ar.user_id = u.id
JOIN institutions i ON ar.institution_id = i.id
WHERE ar.date = CURRENT_DATE
AND ar.verification_method IN ('smartid_card', 'rfid_card', 'nfc_card', 'smart_card')
ORDER BY ar.check_in_time DESC;

-- ================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================

COMMENT ON TABLE smartid_cards IS 'Physical SmartID cards (RFID/NFC) detected by XT-N424 WR readers';
COMMENT ON TABLE card_enrollments IS 'Links SmartID cards to users and institutions with access control';
COMMENT ON TABLE card_access_events IS 'Log of every SmartID card detection/tap event from readers';
COMMENT ON TABLE card_wallets IS 'E-wallet accounts associated with SmartID card enrollments';
COMMENT ON TABLE wallet_transactions IS 'Financial transactions made with SmartID cards';

COMMENT ON COLUMN smartid_cards.card_uid IS 'Unique identifier read from SmartID card by XT-N424 WR reader';
COMMENT ON COLUMN smartid_cards.card_technology IS 'SmartID card technology: rfid or nfc';
COMMENT ON COLUMN smartid_cards.card_brand IS 'Always "SmartID Card" - standardized brand name';
COMMENT ON COLUMN card_enrollments.access_level IS 'Determines what the SmartID card can access in the system';
COMMENT ON COLUMN card_access_events.processing_time_ms IS 'Time taken to process SmartID card detection in milliseconds';
COMMENT ON COLUMN attendance_records.card_access_event_id IS 'Links attendance to the original SmartID card detection event';
COMMENT ON COLUMN attendance_records.rfid_device_info IS 'SmartID card-specific device and card information';

COMMENT ON FUNCTION handle_rfid_attendance IS 'Handles check-in/check-out logic for SmartID card attendance';
COMMENT ON VIEW active_card_enrollments IS 'Shows all active SmartID card enrollments with user and wallet details';
COMMENT ON VIEW todays_smartid_attendance IS 'Shows today''s attendance records created via SmartID cards';
