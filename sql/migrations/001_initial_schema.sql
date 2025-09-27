-- =====================================================
-- SmartID Ecosystem Database Schema
-- =====================================================
-- This schema supports SmartID Registry, HQ, POS, and PAY
-- Created: 2025-09-22
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. INSTITUTIONS
-- =====================================================
CREATE TABLE institutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL CHECK (type IN ('school', 'university', 'corporate', 'government')),
  registration_number VARCHAR UNIQUE,
  address TEXT,
  phone VARCHAR,
  email VARCHAR,
  contact_person VARCHAR,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  subscription_plan VARCHAR DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'premium', 'enterprise')),
  settings JSONB DEFAULT '{}',
  smartid_hq_institution_id VARCHAR UNIQUE, -- Sync with SmartID HQ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. UNIFIED USERS TABLE
-- =====================================================
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Essential Info (required for all users)
  full_name VARCHAR NOT NULL,
  ic_number VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR NOT NULL,
  
  -- Institution linking (NULL for HQ users)
  institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
  
  -- User roles across different systems
  smartid_hub_role VARCHAR CHECK (smartid_hub_role IN ('admin', 'teacher', 'student', 'staff')),
  smartid_hq_role VARCHAR CHECK (smartid_hq_role IN ('hq_superadmin', 'hq_admin', 'hq_support', 'hq_analyst')),
  smartid_pos_role VARCHAR CHECK (smartid_pos_role IN ('superadmin', 'manager', 'cashier', 'kitchen_staff')),
  smartid_pay_role VARCHAR CHECK (smartid_pay_role IN ('parent', 'student', 'guardian')),
  
  -- Primary role (determines main access)
  primary_system VARCHAR NOT NULL CHECK (primary_system IN ('registry', 'hq', 'pos', 'pay')),
  primary_role VARCHAR NOT NULL,
  
  -- Additional user info
  employee_id VARCHAR, -- For staff/teachers (institution-specific)
  grade_class VARCHAR, -- For students
  department VARCHAR, -- For staff/teachers
  date_of_birth DATE,
  gender VARCHAR CHECK (gender IN ('male', 'female')),
  address TEXT,
  avatar_url TEXT,
  
  -- System-specific info
  emergency_contact JSONB,
  parent_contact JSONB, -- For students
  pos_employee_code VARCHAR, -- For POS system
  pos_pin_code VARCHAR, -- POS login PIN
  
  -- Account status
  status VARCHAR DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive', 'suspended', 'graduated', 'transferred')),
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  
  -- Authentication (for Supabase Auth)
  auth_user_id UUID UNIQUE, -- Links to auth.users
  
  -- Sync tracking
  smartid_hq_user_id VARCHAR UNIQUE,
  last_login TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT users_institution_employee_id_unique UNIQUE(institution_id, employee_id),
  CONSTRAINT users_must_have_role CHECK (
    (smartid_hub_role IS NOT NULL) OR 
    (smartid_hq_role IS NOT NULL) OR 
    (smartid_pos_role IS NOT NULL) OR 
    (smartid_pay_role IS NOT NULL)
  )
);

-- =====================================================
-- 3. CAFETERIAS
-- =====================================================
CREATE TABLE cafeterias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  location VARCHAR NOT NULL,
  operating_hours JSONB, -- {"monday": {"open": "07:00", "close": "17:00"}}
  contact_phone VARCHAR,
  contact_email VARCHAR,
  sst_registration_number VARCHAR,
  sst_rate DECIMAL(5,4) DEFAULT 0.06, -- 6% SST
  service_tax_applicable BOOLEAN DEFAULT true,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. SMART CARDS (Issued by SmartID HQ)
-- =====================================================
CREATE TABLE smart_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  smartid_hq_card_id VARCHAR UNIQUE NOT NULL,
  card_number VARCHAR UNIQUE NOT NULL,
  nfc_id VARCHAR UNIQUE NOT NULL,
  card_type VARCHAR DEFAULT 'student' CHECK (card_type IN ('student', 'staff', 'visitor', 'temporary')),
  issue_date DATE,
  expiry_date DATE,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'lost', 'stolen', 'expired', 'replaced')),
  balance DECIMAL(10,2) DEFAULT 0.00,
  daily_limit DECIMAL(10,2) DEFAULT 50.00,
  monthly_limit DECIMAL(10,2) DEFAULT 500.00,
  issued_by VARCHAR, -- SmartID HQ user
  last_balance_sync TIMESTAMP WITH TIME ZONE,
  last_used TIMESTAMP WITH TIME ZONE,
  card_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. BIOMETRIC ENROLLMENTS
-- =====================================================
CREATE TABLE biometric_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  smartid_hq_biometric_id VARCHAR UNIQUE,
  biometric_type VARCHAR NOT NULL CHECK (biometric_type IN ('palm_vein', 'fingerprint', 'face')),
  template_hash VARCHAR NOT NULL, -- Hash of biometric template
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  device_id VARCHAR,
  enrolled_by UUID REFERENCES users(id),
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_verified TIMESTAMP WITH TIME ZONE,
  verification_count INTEGER DEFAULT 0,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'expired', 'synced')),
  sync_status VARCHAR DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
  synced_to_hq_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. ATTENDANCE RECORDS
-- =====================================================
CREATE TABLE attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  date DATE DEFAULT CURRENT_DATE,
  status VARCHAR DEFAULT 'present' CHECK (status IN ('present', 'late', 'absent', 'early_leave')),
  verification_method VARCHAR CHECK (verification_method IN ('palm_vein', 'nfc_card', 'manual')),
  device_id VARCHAR,
  location VARCHAR,
  notes TEXT,
  sync_to_hq_status VARCHAR DEFAULT 'pending' CHECK (sync_to_hq_status IN ('pending', 'synced', 'failed')),
  synced_to_hq_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- 7. MENU CATEGORIES
-- =====================================================
CREATE TABLE menu_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cafeteria_id UUID REFERENCES cafeterias(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  available_from TIME,
  available_to TIME,
  available_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- 1=Monday, 7=Sunday
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cafeteria_id, name)
);

-- =====================================================
-- 8. MENU ITEMS
-- =====================================================
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cafeteria_id UUID REFERENCES cafeterias(id) ON DELETE CASCADE,
  category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(8,2) NOT NULL CHECK (price >= 0),
  cost_price DECIMAL(8,2),
  sku VARCHAR,
  barcode VARCHAR,
  is_taxable BOOLEAN DEFAULT true,
  tax_rate DECIMAL(5,4) DEFAULT 0.06,
  is_active BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_alert INTEGER DEFAULT 10,
  track_stock BOOLEAN DEFAULT false,
  preparation_time INTEGER DEFAULT 5, -- minutes
  calories INTEGER,
  allergens TEXT[],
  ingredients TEXT[],
  display_order INTEGER DEFAULT 0,
  available_from TIME,
  available_to TIME,
  available_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7],
  nutritional_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cafeteria_id, sku)
);

-- =====================================================
-- 9. MENU ITEM VARIANTS
-- =====================================================
CREATE TABLE menu_item_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  variant_type VARCHAR NOT NULL CHECK (variant_type IN ('size', 'addon', 'modifier')),
  name VARCHAR NOT NULL,
  price_adjustment DECIMAL(8,2) DEFAULT 0.00,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. POS TRANSACTIONS
-- =====================================================
CREATE TABLE pos_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cafeteria_id UUID REFERENCES cafeterias(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES users(id), -- Customer
  card_id UUID REFERENCES smart_cards(id),
  staff_id UUID REFERENCES users(id), -- Staff who processed (must have POS role)
  transaction_number VARCHAR UNIQUE NOT NULL,
  
  -- Transaction totals
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tax_amount DECIMAL(10,2) DEFAULT 0.00 CHECK (tax_amount >= 0),
  service_charge DECIMAL(10,2) DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  
  -- Payment info
  payment_method VARCHAR CHECK (payment_method IN ('nfc_card', 'palm_vein', 'cash', 'qr_pay')),
  payment_status VARCHAR DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'voided')),
  
  -- Transaction details
  transaction_type VARCHAR DEFAULT 'sale' CHECK (transaction_type IN ('sale', 'refund', 'void')),
  original_transaction_id UUID REFERENCES pos_transactions(id),
  notes TEXT,
  
  -- Device and location
  pos_device_id VARCHAR,
  table_number VARCHAR,
  
  -- Timestamps
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Sync status
  synced_to_registry BOOLEAN DEFAULT false,
  synced_to_hq BOOLEAN DEFAULT false,
  sync_errors TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. POS TRANSACTION ITEMS
-- =====================================================
CREATE TABLE pos_transaction_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES pos_transactions(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  item_name VARCHAR NOT NULL,
  item_price DECIMAL(8,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,4) DEFAULT 0.06,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  variants JSONB,
  special_instructions TEXT,
  status VARCHAR DEFAULT 'ordered' CHECK (status IN ('ordered', 'preparing', 'ready', 'served', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. WALLET TRANSACTIONS (SmartID PAY Integration)
-- =====================================================
CREATE TABLE wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  smartid_pay_transaction_id VARCHAR UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  card_id UUID REFERENCES smart_cards(id),
  transaction_type VARCHAR NOT NULL CHECK (transaction_type IN (
    'topup_billplz', 'cashout_billplz', 'purchase', 'refund', 'penalty', 'transfer', 'parent_transfer'
  )),
  amount DECIMAL(10,2) NOT NULL,
  balance_before DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  currency VARCHAR DEFAULT 'MYR',
  merchant_location VARCHAR,
  description TEXT,
  billplz_transaction_id VARCHAR,
  parent_user_id UUID REFERENCES users(id), -- Parent who initiated transfer
  payment_method VARCHAR CHECK (payment_method IN ('nfc_card', 'palm_vein', 'billplz', 'cash', 'online')),
  status VARCHAR DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  synced_from_pay_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. PARENT CHILD RELATIONSHIPS (SmartID PAY)
-- =====================================================
CREATE TABLE parent_child_relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Parent user (smartid_pay_role = 'parent')
  child_id UUID REFERENCES users(id) ON DELETE CASCADE,  -- Student user
  relationship_type VARCHAR NOT NULL CHECK (relationship_type IN ('father', 'mother', 'guardian', 'other')),
  status VARCHAR DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
  can_topup BOOLEAN DEFAULT true,
  can_view_transactions BOOLEAN DEFAULT true,
  can_set_limits BOOLEAN DEFAULT true,
  spending_limit DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- =====================================================
-- 14. CASH DRAWER SESSIONS
-- =====================================================
CREATE TABLE cash_drawer_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cafeteria_id UUID REFERENCES cafeterias(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Staff who opened session
  session_number VARCHAR UNIQUE NOT NULL,
  
  -- Opening amounts
  opening_cash DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  opening_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Closing amounts
  closing_cash DECIMAL(10,2),
  expected_cash DECIMAL(10,2),
  cash_difference DECIMAL(10,2),
  closing_time TIMESTAMP WITH TIME ZONE,
  closed_by UUID REFERENCES users(id),
  
  -- Session totals
  total_sales DECIMAL(10,2) DEFAULT 0.00,
  total_refunds DECIMAL(10,2) DEFAULT 0.00,
  total_voids DECIMAL(10,2) DEFAULT 0.00,
  cash_sales DECIMAL(10,2) DEFAULT 0.00,
  card_sales DECIMAL(10,2) DEFAULT 0.00,
  
  status VARCHAR DEFAULT 'open' CHECK (status IN ('open', 'closed', 'balanced', 'discrepancy')),
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 15. CASH MOVEMENTS
-- =====================================================
CREATE TABLE cash_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES cash_drawer_sessions(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES users(id) ON DELETE CASCADE,
  movement_type VARCHAR NOT NULL CHECK (movement_type IN ('cash_in', 'cash_out', 'payout', 'drop', 'till_count')),
  amount DECIMAL(10,2) NOT NULL,
  reason VARCHAR NOT NULL,
  notes TEXT,
  authorized_by UUID REFERENCES users(id), -- For approvals
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 16. DEVICES
-- =====================================================
CREATE TABLE devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  device_id VARCHAR UNIQUE NOT NULL,
  device_name VARCHAR NOT NULL,
  device_type VARCHAR NOT NULL CHECK (device_type IN ('palm_scanner', 'nfc_reader', 'pos_terminal', 'attendance_kiosk')),
  location VARCHAR NOT NULL,
  ip_address INET,
  mac_address VARCHAR,
  firmware_version VARCHAR,
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'offline')),
  settings JSONB DEFAULT '{}',
  sync_with_hq BOOLEAN DEFAULT true,
  last_sync_with_hq TIMESTAMP WITH TIME ZONE,
  installed_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 17. DAILY SALES SUMMARY
-- =====================================================
CREATE TABLE daily_sales_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cafeteria_id UUID REFERENCES cafeterias(id) ON DELETE CASCADE,
  business_date DATE NOT NULL,
  
  -- Sales totals
  total_transactions INTEGER DEFAULT 0,
  gross_sales DECIMAL(10,2) DEFAULT 0.00,
  total_tax DECIMAL(10,2) DEFAULT 0.00,
  total_discounts DECIMAL(10,2) DEFAULT 0.00,
  net_sales DECIMAL(10,2) DEFAULT 0.00,
  
  -- Payment method breakdown
  cash_sales DECIMAL(10,2) DEFAULT 0.00,
  card_sales DECIMAL(10,2) DEFAULT 0.00,
  digital_wallet_sales DECIMAL(10,2) DEFAULT 0.00,
  
  -- Other metrics
  total_refunds DECIMAL(10,2) DEFAULT 0.00,
  total_voids DECIMAL(10,2) DEFAULT 0.00,
  average_transaction DECIMAL(10,2) DEFAULT 0.00,
  
  -- Top selling items
  top_items JSONB,
  
  -- Status
  is_finalized BOOLEAN DEFAULT false,
  finalized_by UUID REFERENCES users(id),
  finalized_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(cafeteria_id, business_date)
);

-- =====================================================
-- 18. SYNC LOGS
-- =====================================================
CREATE TABLE sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  system VARCHAR NOT NULL CHECK (system IN ('smartid_hq', 'smartid_pay', 'smartid_pos')),
  sync_type VARCHAR NOT NULL CHECK (sync_type IN ('user', 'card', 'biometric', 'transaction', 'attendance')),
  entity_id UUID,
  entity_type VARCHAR,
  operation VARCHAR CHECK (operation IN ('create', 'update', 'delete', 'sync')),
  status VARCHAR CHECK (status IN ('pending', 'success', 'failed', 'partial')),
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 19. SYSTEM LOGS
-- =====================================================
CREATE TABLE system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES institutions(id),
  user_id UUID REFERENCES users(id),
  device_id UUID REFERENCES devices(id),
  action VARCHAR NOT NULL,
  entity_type VARCHAR,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR CHECK (status IN ('success', 'failure', 'warning')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 20. USER SESSIONS (for tracking active sessions)
-- =====================================================
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR UNIQUE NOT NULL,
  system VARCHAR NOT NULL CHECK (system IN ('registry', 'hq', 'pos', 'pay')),
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables that have updated_at column
CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cafeterias_updated_at BEFORE UPDATE ON cafeterias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_smart_cards_updated_at BEFORE UPDATE ON smart_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_biometric_enrollments_updated_at BEFORE UPDATE ON biometric_enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_records_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON menu_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pos_transactions_updated_at BEFORE UPDATE ON pos_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parent_child_relationships_updated_at BEFORE UPDATE ON parent_child_relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cash_drawer_sessions_updated_at BEFORE UPDATE ON cash_drawer_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_sales_summary_updated_at BEFORE UPDATE ON daily_sales_summary FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
