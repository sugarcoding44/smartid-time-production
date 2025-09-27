-- =====================================================
-- Row Level Security Policies for SmartID Ecosystem
-- =====================================================
-- These policies ensure data isolation between institutions
-- and proper access control based on user roles
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafeterias ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_child_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_drawer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR POLICIES
-- =====================================================

-- Get current user's institution ID
CREATE OR REPLACE FUNCTION get_user_institution_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT institution_id 
    FROM users 
    WHERE auth_user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has specific role in any system
CREATE OR REPLACE FUNCTION user_has_role(role_name TEXT, system_name TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
BEGIN
  SELECT * INTO user_record FROM users WHERE auth_user_id = auth.uid();
  
  IF user_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check system-specific roles
  IF system_name = 'hub' THEN
    RETURN user_record.smartid_hub_role = role_name;
  ELSIF system_name = 'hq' THEN
    RETURN user_record.smartid_hq_role = role_name;
  ELSIF system_name = 'pos' THEN
    RETURN user_record.smartid_pos_role = role_name;
  ELSIF system_name = 'pay' THEN
    RETURN user_record.smartid_pay_role = role_name;
  ELSE
    -- Check any system role
    RETURN (
      user_record.smartid_hub_role = role_name OR
      user_record.smartid_hq_role = role_name OR
      user_record.smartid_pos_role = role_name OR
      user_record.smartid_pay_role = role_name
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is admin in any system
CREATE OR REPLACE FUNCTION user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    user_has_role('admin', 'hub') OR
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq') OR
    user_has_role('superadmin', 'pos')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INSTITUTIONS POLICIES
-- =====================================================

-- HQ users can see all institutions, others can only see their own
CREATE POLICY "institutions_select" ON institutions
  FOR SELECT USING (
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq') OR
    id = get_user_institution_id()
  );

-- Only HQ users can insert/update institutions
CREATE POLICY "institutions_insert" ON institutions
  FOR INSERT WITH CHECK (
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq')
  );

CREATE POLICY "institutions_update" ON institutions
  FOR UPDATE USING (
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq') OR
    (id = get_user_institution_id() AND user_has_role('admin', 'registry'))
  );

-- =====================================================
-- USERS POLICIES
-- =====================================================

-- Users can see users in their institution + HQ can see all
CREATE POLICY "users_select" ON users
  FOR SELECT USING (
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq') OR
    institution_id = get_user_institution_id() OR
    auth_user_id = auth.uid()
  );

-- Users can update their own profile, admins can update users in their institution
CREATE POLICY "users_update" ON users
  FOR UPDATE USING (
    auth_user_id = auth.uid() OR
    (institution_id = get_user_institution_id() AND user_is_admin()) OR
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq')
  );

-- Only admins can insert users
CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (
    user_is_admin() OR
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq')
  );

-- =====================================================
-- CAFETERIAS POLICIES
-- =====================================================

-- Users can only see cafeterias in their institution
CREATE POLICY "cafeterias_select" ON cafeterias
  FOR SELECT USING (
    institution_id = get_user_institution_id() OR
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq')
  );

-- Only admins and POS superadmins can manage cafeterias
CREATE POLICY "cafeterias_insert" ON cafeterias
  FOR INSERT WITH CHECK (
    institution_id = get_user_institution_id() AND (
      user_has_role('admin', 'registry') OR
      user_has_role('superadmin', 'pos')
    )
  );

CREATE POLICY "cafeterias_update" ON cafeterias
  FOR UPDATE USING (
    institution_id = get_user_institution_id() AND (
      user_has_role('admin', 'registry') OR
      user_has_role('superadmin', 'pos')
    )
  );

-- =====================================================
-- SMART CARDS POLICIES
-- =====================================================

-- Users can see their own cards + staff can see cards in their institution
CREATE POLICY "smart_cards_select" ON smart_cards
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    ) OR
    user_id IN (
      SELECT id FROM users WHERE institution_id = get_user_institution_id()
    ) OR
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq')
  );

-- Only HQ and admins can manage smart cards
CREATE POLICY "smart_cards_insert" ON smart_cards
  FOR INSERT WITH CHECK (
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq') OR
    (user_is_admin() AND user_id IN (
      SELECT id FROM users WHERE institution_id = get_user_institution_id()
    ))
  );

-- =====================================================
-- BIOMETRIC ENROLLMENTS POLICIES
-- =====================================================

-- Users can see their own biometrics + staff can see enrollments in their institution
CREATE POLICY "biometric_enrollments_select" ON biometric_enrollments
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    ) OR
    user_id IN (
      SELECT id FROM users WHERE institution_id = get_user_institution_id()
    ) OR
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq')
  );

-- Staff can enroll biometrics for users in their institution
CREATE POLICY "biometric_enrollments_insert" ON biometric_enrollments
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE institution_id = get_user_institution_id()
    ) OR
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq')
  );

-- =====================================================
-- ATTENDANCE RECORDS POLICIES
-- =====================================================

-- Users can see attendance records in their institution
CREATE POLICY "attendance_records_select" ON attendance_records
  FOR SELECT USING (
    institution_id = get_user_institution_id() OR
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq') OR
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Staff can insert attendance records for their institution
CREATE POLICY "attendance_records_insert" ON attendance_records
  FOR INSERT WITH CHECK (
    institution_id = get_user_institution_id()
  );

-- =====================================================
-- MENU MANAGEMENT POLICIES
-- =====================================================

-- Menu categories - users can see categories for cafeterias in their institution
CREATE POLICY "menu_categories_select" ON menu_categories
  FOR SELECT USING (
    cafeteria_id IN (
      SELECT id FROM cafeterias WHERE institution_id = get_user_institution_id()
    )
  );

-- Only POS staff can manage menu categories
CREATE POLICY "menu_categories_insert" ON menu_categories
  FOR INSERT WITH CHECK (
    cafeteria_id IN (
      SELECT id FROM cafeterias WHERE institution_id = get_user_institution_id()
    ) AND (
      user_has_role('superadmin', 'pos') OR
      user_has_role('manager', 'pos')
    )
  );

-- Menu items - similar to categories
CREATE POLICY "menu_items_select" ON menu_items
  FOR SELECT USING (
    cafeteria_id IN (
      SELECT id FROM cafeterias WHERE institution_id = get_user_institution_id()
    )
  );

CREATE POLICY "menu_items_insert" ON menu_items
  FOR INSERT WITH CHECK (
    cafeteria_id IN (
      SELECT id FROM cafeterias WHERE institution_id = get_user_institution_id()
    ) AND (
      user_has_role('superadmin', 'pos') OR
      user_has_role('manager', 'pos')
    )
  );

CREATE POLICY "menu_items_update" ON menu_items
  FOR UPDATE USING (
    cafeteria_id IN (
      SELECT id FROM cafeterias WHERE institution_id = get_user_institution_id()
    ) AND (
      user_has_role('superadmin', 'pos') OR
      user_has_role('manager', 'pos')
    )
  );

-- Menu item variants
CREATE POLICY "menu_item_variants_select" ON menu_item_variants
  FOR SELECT USING (
    menu_item_id IN (
      SELECT mi.id FROM menu_items mi
      JOIN cafeterias c ON mi.cafeteria_id = c.id
      WHERE c.institution_id = get_user_institution_id()
    )
  );

CREATE POLICY "menu_item_variants_insert" ON menu_item_variants
  FOR INSERT WITH CHECK (
    menu_item_id IN (
      SELECT mi.id FROM menu_items mi
      JOIN cafeterias c ON mi.cafeteria_id = c.id
      WHERE c.institution_id = get_user_institution_id()
    ) AND (
      user_has_role('superadmin', 'pos') OR
      user_has_role('manager', 'pos')
    )
  );

-- =====================================================
-- POS TRANSACTIONS POLICIES
-- =====================================================

-- POS transactions - users can see transactions for their institution's cafeterias
CREATE POLICY "pos_transactions_select" ON pos_transactions
  FOR SELECT USING (
    cafeteria_id IN (
      SELECT id FROM cafeterias WHERE institution_id = get_user_institution_id()
    ) OR
    customer_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Only POS staff can insert transactions
CREATE POLICY "pos_transactions_insert" ON pos_transactions
  FOR INSERT WITH CHECK (
    cafeteria_id IN (
      SELECT id FROM cafeterias WHERE institution_id = get_user_institution_id()
    ) AND (
      user_has_role('superadmin', 'pos') OR
      user_has_role('manager', 'pos') OR
      user_has_role('cashier', 'pos')
    )
  );

-- Transaction items follow transaction policies
CREATE POLICY "pos_transaction_items_select" ON pos_transaction_items
  FOR SELECT USING (
    transaction_id IN (
      SELECT pt.id FROM pos_transactions pt
      JOIN cafeterias c ON pt.cafeteria_id = c.id
      WHERE c.institution_id = get_user_institution_id()
    )
  );

CREATE POLICY "pos_transaction_items_insert" ON pos_transaction_items
  FOR INSERT WITH CHECK (
    transaction_id IN (
      SELECT pt.id FROM pos_transactions pt
      JOIN cafeterias c ON pt.cafeteria_id = c.id
      WHERE c.institution_id = get_user_institution_id()
    )
  );

-- =====================================================
-- WALLET TRANSACTIONS POLICIES
-- =====================================================

-- Users can see their own wallet transactions + parents can see children's
CREATE POLICY "wallet_transactions_select" ON wallet_transactions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    ) OR
    parent_user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    ) OR
    user_id IN (
      SELECT pcr.child_id FROM parent_child_relationships pcr
      JOIN users u ON pcr.parent_id = u.id
      WHERE u.auth_user_id = auth.uid() AND pcr.status = 'active'
    ) OR
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq')
  );

-- Only SmartID PAY system can insert wallet transactions
CREATE POLICY "wallet_transactions_insert" ON wallet_transactions
  FOR INSERT WITH CHECK (
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq')
  );

-- =====================================================
-- PARENT-CHILD RELATIONSHIPS POLICIES
-- =====================================================

-- Parents can see their relationships + children can see theirs
CREATE POLICY "parent_child_relationships_select" ON parent_child_relationships
  FOR SELECT USING (
    parent_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    ) OR
    child_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    ) OR
    child_id IN (
      SELECT id FROM users WHERE institution_id = get_user_institution_id()
    )
  );

-- Parents can create relationships with students
CREATE POLICY "parent_child_relationships_insert" ON parent_child_relationships
  FOR INSERT WITH CHECK (
    parent_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid() AND smartid_pay_role = 'parent'
    ) OR
    (user_is_admin() AND child_id IN (
      SELECT id FROM users WHERE institution_id = get_user_institution_id()
    ))
  );

-- =====================================================
-- CASH MANAGEMENT POLICIES
-- =====================================================

-- Cash drawer sessions - only POS staff in same cafeteria can see
CREATE POLICY "cash_drawer_sessions_select" ON cash_drawer_sessions
  FOR SELECT USING (
    cafeteria_id IN (
      SELECT id FROM cafeterias WHERE institution_id = get_user_institution_id()
    ) AND (
      user_has_role('superadmin', 'pos') OR
      user_has_role('manager', 'pos') OR
      user_has_role('cashier', 'pos')
    )
  );

CREATE POLICY "cash_drawer_sessions_insert" ON cash_drawer_sessions
  FOR INSERT WITH CHECK (
    cafeteria_id IN (
      SELECT id FROM cafeterias WHERE institution_id = get_user_institution_id()
    ) AND (
      user_has_role('superadmin', 'pos') OR
      user_has_role('manager', 'pos') OR
      user_has_role('cashier', 'pos')
    )
  );

-- Cash movements follow session policies
CREATE POLICY "cash_movements_select" ON cash_movements
  FOR SELECT USING (
    session_id IN (
      SELECT cds.id FROM cash_drawer_sessions cds
      JOIN cafeterias c ON cds.cafeteria_id = c.id
      WHERE c.institution_id = get_user_institution_id()
    )
  );

CREATE POLICY "cash_movements_insert" ON cash_movements
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT cds.id FROM cash_drawer_sessions cds
      JOIN cafeterias c ON cds.cafeteria_id = c.id
      WHERE c.institution_id = get_user_institution_id()
    )
  );

-- =====================================================
-- DEVICES POLICIES
-- =====================================================

-- Users can see devices in their institution
CREATE POLICY "devices_select" ON devices
  FOR SELECT USING (
    institution_id = get_user_institution_id() OR
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq')
  );

-- Only admins can manage devices
CREATE POLICY "devices_insert" ON devices
  FOR INSERT WITH CHECK (
    institution_id = get_user_institution_id() AND user_is_admin()
  );

CREATE POLICY "devices_update" ON devices
  FOR UPDATE USING (
    institution_id = get_user_institution_id() AND user_is_admin()
  );

-- =====================================================
-- REPORTS POLICIES
-- =====================================================

-- Daily sales summary - POS staff can see reports for their cafeterias
CREATE POLICY "daily_sales_summary_select" ON daily_sales_summary
  FOR SELECT USING (
    cafeteria_id IN (
      SELECT id FROM cafeterias WHERE institution_id = get_user_institution_id()
    ) AND (
      user_has_role('superadmin', 'pos') OR
      user_has_role('manager', 'pos')
    )
  );

CREATE POLICY "daily_sales_summary_insert" ON daily_sales_summary
  FOR INSERT WITH CHECK (
    cafeteria_id IN (
      SELECT id FROM cafeterias WHERE institution_id = get_user_institution_id()
    ) AND (
      user_has_role('superadmin', 'pos') OR
      user_has_role('manager', 'pos')
    )
  );

-- =====================================================
-- SYSTEM LOGS POLICIES
-- =====================================================

-- System logs - users can see logs for their institution
CREATE POLICY "system_logs_select" ON system_logs
  FOR SELECT USING (
    institution_id = get_user_institution_id() OR
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq') OR
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- System can insert logs
CREATE POLICY "system_logs_insert" ON system_logs
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- SYNC LOGS POLICIES
-- =====================================================

-- Only HQ users can see sync logs
CREATE POLICY "sync_logs_select" ON sync_logs
  FOR SELECT USING (
    user_has_role('hq_superadmin', 'hq') OR
    user_has_role('hq_admin', 'hq') OR
    user_has_role('hq_support', 'hq')
  );

-- System can insert sync logs
CREATE POLICY "sync_logs_insert" ON sync_logs
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- USER SESSIONS POLICIES
-- =====================================================

-- Users can only see their own sessions
CREATE POLICY "user_sessions_select" ON user_sessions
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    ) OR
    user_has_role('hq_superadmin', 'hq')
  );

-- Users can insert their own sessions
CREATE POLICY "user_sessions_insert" ON user_sessions
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Users can update their own sessions
CREATE POLICY "user_sessions_update" ON user_sessions
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );
