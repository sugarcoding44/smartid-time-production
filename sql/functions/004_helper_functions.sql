-- =====================================================
-- Helper Functions for SmartID Ecosystem
-- =====================================================
-- These functions provide common operations and utilities
-- =====================================================

-- =====================================================
-- USER MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to get user's primary role information
CREATE OR REPLACE FUNCTION get_user_role_info(user_id_param UUID DEFAULT NULL)
RETURNS TABLE (
  user_id UUID,
  full_name VARCHAR,
  primary_system VARCHAR,
  primary_role VARCHAR,
  institution_id UUID,
  institution_name VARCHAR,
  permissions JSONB
) AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Use provided user_id or get current user's id
  target_user_id := COALESCE(user_id_param, (
    SELECT id FROM users WHERE auth_user_id = auth.uid() LIMIT 1
  ));
  
  RETURN QUERY
  SELECT 
    u.id,
    u.full_name,
    u.primary_system,
    u.primary_role,
    u.institution_id,
    i.name as institution_name,
    get_user_permissions(u.primary_system, u.primary_role) as permissions
  FROM users u
  LEFT JOIN institutions i ON u.institution_id = i.id
  WHERE u.id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user permissions based on role
CREATE OR REPLACE FUNCTION get_user_permissions(system_name VARCHAR, role_name VARCHAR)
RETURNS JSONB AS $$
BEGIN
  RETURN CASE 
    WHEN system_name = 'hub' THEN
      CASE role_name
        WHEN 'admin' THEN jsonb_build_object(
          'can_manage_users', true,
          'can_manage_devices', true,
          'can_view_reports', true,
          'can_manage_biometrics', true,
          'can_sync_data', true
        )
        WHEN 'teacher' THEN jsonb_build_object(
          'can_manage_users', false,
          'can_view_attendance', true,
          'can_manage_students', true,
          'can_view_reports', false
        )
        WHEN 'staff' THEN jsonb_build_object(
          'can_manage_users', false,
          'can_view_attendance', true,
          'can_manage_devices', false,
          'can_enroll_biometrics', true
        )
        WHEN 'student' THEN jsonb_build_object(
          'can_view_own_data', true,
          'can_update_profile', false
        )
        ELSE jsonb_build_object()
      END
    WHEN system_name = 'hq' THEN
      CASE role_name
        WHEN 'hq_superadmin' THEN jsonb_build_object(
          'can_manage_institutions', true,
          'can_manage_all_users', true,
          'can_issue_cards', true,
          'can_view_all_data', true,
          'can_manage_system', true
        )
        WHEN 'hq_admin' THEN jsonb_build_object(
          'can_manage_institutions', true,
          'can_manage_users', true,
          'can_issue_cards', true,
          'can_view_reports', true
        )
        WHEN 'hq_support' THEN jsonb_build_object(
          'can_view_institutions', true,
          'can_view_sync_logs', true,
          'can_support_users', true
        )
        WHEN 'hq_analyst' THEN jsonb_build_object(
          'can_view_reports', true,
          'can_analyze_data', true
        )
        ELSE jsonb_build_object()
      END
    WHEN system_name = 'pos' THEN
      CASE role_name
        WHEN 'superadmin' THEN jsonb_build_object(
          'can_void', true,
          'can_refund', true,
          'can_cash_out', true,
          'can_manage_menu', true,
          'can_manage_staff', true,
          'can_view_reports', true,
          'can_close_till', true,
          'can_override_price', true,
          'can_apply_discount', true,
          'max_discount_percent', 50,
          'max_void_amount', 999999.99
        )
        WHEN 'manager' THEN jsonb_build_object(
          'can_void', true,
          'can_refund', true,
          'can_cash_out', false,
          'can_manage_menu', true,
          'can_manage_staff', false,
          'can_view_reports', true,
          'can_close_till', true,
          'can_override_price', true,
          'can_apply_discount', true,
          'max_discount_percent', 25,
          'max_void_amount', 500.00
        )
        WHEN 'cashier' THEN jsonb_build_object(
          'can_void', true,
          'can_refund', true,
          'can_cash_out', false,
          'can_manage_menu', false,
          'can_manage_staff', false,
          'can_view_reports', false,
          'can_close_till', false,
          'can_override_price', false,
          'can_apply_discount', true,
          'max_discount_percent', 10,
          'max_void_amount', 50.00
        )
        WHEN 'kitchen_staff' THEN jsonb_build_object(
          'can_void', false,
          'can_refund', false,
          'can_cash_out', false,
          'can_manage_menu', false,
          'can_view_orders', true,
          'can_update_order_status', true
        )
        ELSE jsonb_build_object()
      END
    WHEN system_name = 'pay' THEN
      CASE role_name
        WHEN 'parent' THEN jsonb_build_object(
          'can_topup_wallet', true,
          'can_view_child_transactions', true,
          'can_set_spending_limits', true,
          'can_cashout', true
        )
        WHEN 'student' THEN jsonb_build_object(
          'can_view_balance', true,
          'can_view_transactions', true,
          'can_make_payments', true
        )
        WHEN 'guardian' THEN jsonb_build_object(
          'can_topup_wallet', true,
          'can_view_child_transactions', true,
          'can_set_spending_limits', true
        )
        ELSE jsonb_build_object()
      END
    ELSE jsonb_build_object()
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate unique employee ID
CREATE OR REPLACE FUNCTION generate_employee_id(institution_id_param UUID, role_name VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
  institution_code VARCHAR;
  role_prefix VARCHAR;
  sequence_num INTEGER;
  employee_id VARCHAR;
BEGIN
  -- Get institution code (first 3 letters of name, uppercase)
  SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z]', '', 'g'), 3))
  INTO institution_code
  FROM institutions 
  WHERE id = institution_id_param;
  
  -- Set role prefix
  role_prefix := CASE role_name
    WHEN 'admin' THEN 'ADM'
    WHEN 'teacher' THEN 'TCH'
    WHEN 'staff' THEN 'STF'
    WHEN 'student' THEN 'STD'
    ELSE 'USR'
  END;
  
  -- Get next sequence number for this institution and role
  SELECT COALESCE(MAX(CAST(SUBSTRING(employee_id FROM '\d+$') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM users 
  WHERE institution_id = institution_id_param 
    AND employee_id LIKE institution_code || role_prefix || '%';
  
  -- Format: [INSTITUTION][ROLE][NUMBER] (e.g., SKTADM001, SKTSTD1234)
  employee_id := institution_code || role_prefix || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN employee_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate user creation
CREATE OR REPLACE FUNCTION validate_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate employee_id if not provided
  IF NEW.employee_id IS NULL AND NEW.institution_id IS NOT NULL THEN
    NEW.employee_id := generate_employee_id(NEW.institution_id, NEW.primary_role);
  END IF;
  
  -- Validate email format
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format: %', NEW.email;
  END IF;
  
  -- Validate IC number format (Malaysian IC: XXXXXX-XX-XXXX)
  IF NEW.ic_number !~ '^\d{6}-\d{2}-\d{4}$' THEN
    RAISE EXCEPTION 'Invalid IC number format. Expected: XXXXXX-XX-XXXX';
  END IF;
  
  -- Validate phone number (Malaysian format)
  IF NEW.phone !~ '^(\+?6?01[02-46-9]|(\+?6?0)[2-9])[0-9-]{7,9}$' THEN
    RAISE EXCEPTION 'Invalid phone number format';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation trigger
CREATE TRIGGER validate_user_data_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION validate_user_data();

-- =====================================================
-- POS FUNCTIONS
-- =====================================================

-- Function to generate transaction number
CREATE OR REPLACE FUNCTION generate_transaction_number(cafeteria_id_param UUID)
RETURNS VARCHAR AS $$
DECLARE
  cafe_code VARCHAR;
  date_code VARCHAR;
  sequence_num INTEGER;
  transaction_num VARCHAR;
BEGIN
  -- Get cafeteria code (first 3 letters of name)
  SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z]', '', 'g'), 3))
  INTO cafe_code
  FROM cafeterias 
  WHERE id = cafeteria_id_param;
  
  -- Get date code (YYMMDD)
  date_code := TO_CHAR(CURRENT_DATE, 'YYMMDD');
  
  -- Get next sequence number for today
  SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM '\d+$') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM pos_transactions 
  WHERE cafeteria_id = cafeteria_id_param 
    AND DATE(transaction_date) = CURRENT_DATE;
  
  -- Format: [CAFE][DATE][SEQUENCE] (e.g., CAF240922001)
  transaction_num := cafe_code || date_code || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN transaction_num;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate transaction totals
CREATE OR REPLACE FUNCTION calculate_transaction_totals(
  subtotal_param DECIMAL,
  tax_rate_param DECIMAL DEFAULT 0.06,
  discount_amount_param DECIMAL DEFAULT 0.00,
  service_charge_param DECIMAL DEFAULT 0.00
)
RETURNS TABLE (
  subtotal DECIMAL,
  tax_amount DECIMAL,
  discount_amount DECIMAL,
  service_charge DECIMAL,
  total_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    subtotal_param,
    ROUND((subtotal_param * tax_rate_param), 2) as tax_amount,
    discount_amount_param,
    service_charge_param,
    ROUND((subtotal_param + (subtotal_param * tax_rate_param) + service_charge_param - discount_amount_param), 2) as total_amount;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if cash drawer session is open
CREATE OR REPLACE FUNCTION is_cash_drawer_open(cafeteria_id_param UUID, staff_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  open_session_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO open_session_count
  FROM cash_drawer_sessions
  WHERE cafeteria_id = cafeteria_id_param
    AND staff_id = staff_id_param
    AND status = 'open';
    
  RETURN open_session_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get current cash drawer session
CREATE OR REPLACE FUNCTION get_current_cash_session(cafeteria_id_param UUID, staff_id_param UUID)
RETURNS UUID AS $$
DECLARE
  session_id UUID;
BEGIN
  SELECT id
  INTO session_id
  FROM cash_drawer_sessions
  WHERE cafeteria_id = cafeteria_id_param
    AND staff_id = staff_id_param
    AND status = 'open'
  ORDER BY opening_time DESC
  LIMIT 1;
    
  RETURN session_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ATTENDANCE FUNCTIONS
-- =====================================================

-- Function to record attendance
CREATE OR REPLACE FUNCTION record_attendance(
  user_id_param UUID,
  verification_method_param VARCHAR,
  device_id_param VARCHAR DEFAULT NULL,
  location_param VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  attendance_id UUID,
  status VARCHAR,
  check_in_time TIMESTAMP WITH TIME ZONE,
  message TEXT
) AS $$
DECLARE
  existing_record attendance_records%ROWTYPE;
  new_record attendance_records%ROWTYPE;
  user_institution_id UUID;
  current_time TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
  -- Get user's institution
  SELECT institution_id INTO user_institution_id
  FROM users WHERE id = user_id_param;
  
  -- Check for existing record today
  SELECT * INTO existing_record
  FROM attendance_records
  WHERE user_id = user_id_param 
    AND date = CURRENT_DATE;
  
  IF existing_record.id IS NOT NULL THEN
    -- Update existing record with check-out
    IF existing_record.check_out_time IS NULL THEN
      UPDATE attendance_records
      SET 
        check_out_time = current_time,
        updated_at = current_time
      WHERE id = existing_record.id
      RETURNING * INTO new_record;
      
      RETURN QUERY
      SELECT 
        new_record.id,
        new_record.status,
        new_record.check_out_time,
        'Check-out recorded successfully'::TEXT;
    ELSE
      -- Already checked out
      RETURN QUERY
      SELECT 
        existing_record.id,
        existing_record.status,
        existing_record.check_in_time,
        'Already checked out for today'::TEXT;
    END IF;
  ELSE
    -- Create new record for check-in
    INSERT INTO attendance_records (
      user_id,
      institution_id,
      check_in_time,
      date,
      status,
      verification_method,
      device_id,
      location
    ) VALUES (
      user_id_param,
      user_institution_id,
      current_time,
      CURRENT_DATE,
      CASE 
        WHEN EXTRACT(HOUR FROM current_time) >= 9 THEN 'late'
        ELSE 'present'
      END,
      verification_method_param,
      device_id_param,
      location_param
    )
    RETURNING * INTO new_record;
    
    RETURN QUERY
    SELECT 
      new_record.id,
      new_record.status,
      new_record.check_in_time,
      'Check-in recorded successfully'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- WALLET FUNCTIONS
-- =====================================================

-- Function to get user's current wallet balance
CREATE OR REPLACE FUNCTION get_wallet_balance(user_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
  balance DECIMAL(10,2);
BEGIN
  SELECT COALESCE(sc.balance, 0.00)
  INTO balance
  FROM smart_cards sc
  WHERE sc.user_id = user_id_param
    AND sc.status = 'active'
  ORDER BY sc.created_at DESC
  LIMIT 1;
  
  RETURN COALESCE(balance, 0.00);
END;
$$ LANGUAGE plpgsql;

-- Function to validate card for transaction
CREATE OR REPLACE FUNCTION validate_card_transaction(
  card_id_param UUID,
  amount_param DECIMAL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  current_balance DECIMAL,
  daily_limit DECIMAL,
  monthly_limit DECIMAL,
  message TEXT
) AS $$
DECLARE
  card smart_cards%ROWTYPE;
  daily_spent DECIMAL;
  monthly_spent DECIMAL;
BEGIN
  -- Get card details
  SELECT * INTO card
  FROM smart_cards
  WHERE id = card_id_param;
  
  IF card.id IS NULL THEN
    RETURN QUERY
    SELECT false, 0.00::DECIMAL, 0.00::DECIMAL, 0.00::DECIMAL, 'Card not found'::TEXT;
    RETURN;
  END IF;
  
  IF card.status != 'active' THEN
    RETURN QUERY
    SELECT false, card.balance, card.daily_limit, card.monthly_limit, 'Card is not active'::TEXT;
    RETURN;
  END IF;
  
  IF card.balance < amount_param THEN
    RETURN QUERY
    SELECT false, card.balance, card.daily_limit, card.monthly_limit, 'Insufficient balance'::TEXT;
    RETURN;
  END IF;
  
  -- Check daily spending limit
  SELECT COALESCE(SUM(total_amount), 0)
  INTO daily_spent
  FROM pos_transactions
  WHERE card_id = card_id_param
    AND DATE(transaction_date) = CURRENT_DATE
    AND payment_status = 'completed';
  
  IF (daily_spent + amount_param) > card.daily_limit THEN
    RETURN QUERY
    SELECT false, card.balance, card.daily_limit, card.monthly_limit, 'Daily limit exceeded'::TEXT;
    RETURN;
  END IF;
  
  -- Check monthly spending limit
  SELECT COALESCE(SUM(total_amount), 0)
  INTO monthly_spent
  FROM pos_transactions
  WHERE card_id = card_id_param
    AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
    AND payment_status = 'completed';
  
  IF (monthly_spent + amount_param) > card.monthly_limit THEN
    RETURN QUERY
    SELECT false, card.balance, card.daily_limit, card.monthly_limit, 'Monthly limit exceeded'::TEXT;
    RETURN;
  END IF;
  
  -- All validations passed
  RETURN QUERY
  SELECT true, card.balance, card.daily_limit, card.monthly_limit, 'Valid for transaction'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- REPORTING FUNCTIONS
-- =====================================================

-- Function to get daily sales report
CREATE OR REPLACE FUNCTION get_daily_sales_report(
  cafeteria_id_param UUID,
  report_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  business_date DATE,
  total_transactions INTEGER,
  gross_sales DECIMAL,
  total_tax DECIMAL,
  total_discounts DECIMAL,
  net_sales DECIMAL,
  cash_sales DECIMAL,
  card_sales DECIMAL,
  average_transaction DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH transaction_summary AS (
    SELECT 
      COUNT(*) as trans_count,
      SUM(subtotal) as gross,
      SUM(tax_amount) as tax,
      SUM(discount_amount) as discounts,
      SUM(total_amount) as net,
      SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END) as cash,
      SUM(CASE WHEN payment_method IN ('nfc_card', 'palm_vein') THEN total_amount ELSE 0 END) as card
    FROM pos_transactions
    WHERE cafeteria_id = cafeteria_id_param
      AND DATE(transaction_date) = report_date
      AND payment_status = 'completed'
  )
  SELECT 
    report_date,
    ts.trans_count::INTEGER,
    COALESCE(ts.gross, 0)::DECIMAL,
    COALESCE(ts.tax, 0)::DECIMAL,
    COALESCE(ts.discounts, 0)::DECIMAL,
    COALESCE(ts.net, 0)::DECIMAL,
    COALESCE(ts.cash, 0)::DECIMAL,
    COALESCE(ts.card, 0)::DECIMAL,
    CASE 
      WHEN ts.trans_count > 0 THEN ROUND(ts.net / ts.trans_count, 2)
      ELSE 0
    END::DECIMAL
  FROM transaction_summary ts;
END;
$$ LANGUAGE plpgsql;
