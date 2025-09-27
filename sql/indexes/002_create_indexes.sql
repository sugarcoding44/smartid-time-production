-- =====================================================
-- Database Indexes for SmartID Ecosystem
-- =====================================================
-- These indexes improve query performance across all tables
-- =====================================================

-- INSTITUTIONS
CREATE INDEX idx_institutions_status ON institutions(status);
CREATE INDEX idx_institutions_type ON institutions(type);
CREATE INDEX idx_institutions_smartid_hq_id ON institutions(smartid_hq_institution_id);

-- USERS
CREATE INDEX idx_users_institution_id ON users(institution_id);
CREATE INDEX idx_users_ic_number ON users(ic_number);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_primary_system ON users(primary_system);
CREATE INDEX idx_users_primary_role ON users(primary_role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_smartid_hq_user_id ON users(smartid_hq_user_id);
CREATE INDEX idx_users_hub_role ON users(smartid_hub_role) WHERE smartid_hub_role IS NOT NULL;
CREATE INDEX idx_users_hq_role ON users(smartid_hq_role) WHERE smartid_hq_role IS NOT NULL;
CREATE INDEX idx_users_pos_role ON users(smartid_pos_role) WHERE smartid_pos_role IS NOT NULL;
CREATE INDEX idx_users_pay_role ON users(smartid_pay_role) WHERE smartid_pay_role IS NOT NULL;
CREATE INDEX idx_users_pos_employee_code ON users(pos_employee_code) WHERE pos_employee_code IS NOT NULL;
CREATE INDEX idx_users_full_name ON users(full_name);

-- CAFETERIAS
CREATE INDEX idx_cafeterias_institution_id ON cafeterias(institution_id);
CREATE INDEX idx_cafeterias_status ON cafeterias(status);

-- SMART CARDS
CREATE INDEX idx_smart_cards_user_id ON smart_cards(user_id);
CREATE INDEX idx_smart_cards_card_number ON smart_cards(card_number);
CREATE INDEX idx_smart_cards_nfc_id ON smart_cards(nfc_id);
CREATE INDEX idx_smart_cards_status ON smart_cards(status);
CREATE INDEX idx_smart_cards_smartid_hq_card_id ON smart_cards(smartid_hq_card_id);
CREATE INDEX idx_smart_cards_balance ON smart_cards(balance);

-- BIOMETRIC ENROLLMENTS
CREATE INDEX idx_biometric_enrollments_user_id ON biometric_enrollments(user_id);
CREATE INDEX idx_biometric_enrollments_type ON biometric_enrollments(biometric_type);
CREATE INDEX idx_biometric_enrollments_status ON biometric_enrollments(status);
CREATE INDEX idx_biometric_enrollments_device_id ON biometric_enrollments(device_id);
CREATE INDEX idx_biometric_enrollments_smartid_hq_id ON biometric_enrollments(smartid_hq_biometric_id);

-- ATTENDANCE RECORDS
CREATE INDEX idx_attendance_records_user_id ON attendance_records(user_id);
CREATE INDEX idx_attendance_records_institution_id ON attendance_records(institution_id);
CREATE INDEX idx_attendance_records_date ON attendance_records(date);
CREATE INDEX idx_attendance_records_user_date ON attendance_records(user_id, date);
CREATE INDEX idx_attendance_records_status ON attendance_records(status);
CREATE INDEX idx_attendance_records_device_id ON attendance_records(device_id);
CREATE INDEX idx_attendance_records_verification_method ON attendance_records(verification_method);

-- MENU CATEGORIES
CREATE INDEX idx_menu_categories_cafeteria_id ON menu_categories(cafeteria_id);
CREATE INDEX idx_menu_categories_is_active ON menu_categories(is_active);
CREATE INDEX idx_menu_categories_display_order ON menu_categories(display_order);

-- MENU ITEMS
CREATE INDEX idx_menu_items_cafeteria_id ON menu_items(cafeteria_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_sku ON menu_items(sku);
CREATE INDEX idx_menu_items_barcode ON menu_items(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_menu_items_is_active ON menu_items(is_active);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX idx_menu_items_display_order ON menu_items(display_order);
CREATE INDEX idx_menu_items_price ON menu_items(price);

-- MENU ITEM VARIANTS
CREATE INDEX idx_menu_item_variants_menu_item_id ON menu_item_variants(menu_item_id);
CREATE INDEX idx_menu_item_variants_variant_type ON menu_item_variants(variant_type);
CREATE INDEX idx_menu_item_variants_is_active ON menu_item_variants(is_active);

-- POS TRANSACTIONS
CREATE INDEX idx_pos_transactions_cafeteria_id ON pos_transactions(cafeteria_id);
CREATE INDEX idx_pos_transactions_customer_id ON pos_transactions(customer_id);
CREATE INDEX idx_pos_transactions_card_id ON pos_transactions(card_id);
CREATE INDEX idx_pos_transactions_staff_id ON pos_transactions(staff_id);
CREATE INDEX idx_pos_transactions_transaction_number ON pos_transactions(transaction_number);
CREATE INDEX idx_pos_transactions_date ON pos_transactions(transaction_date);
CREATE INDEX idx_pos_transactions_cafeteria_date ON pos_transactions(cafeteria_id, transaction_date);
CREATE INDEX idx_pos_transactions_payment_method ON pos_transactions(payment_method);
CREATE INDEX idx_pos_transactions_payment_status ON pos_transactions(payment_status);
CREATE INDEX idx_pos_transactions_transaction_type ON pos_transactions(transaction_type);
CREATE INDEX idx_pos_transactions_pos_device_id ON pos_transactions(pos_device_id);

-- POS TRANSACTION ITEMS
CREATE INDEX idx_pos_transaction_items_transaction_id ON pos_transaction_items(transaction_id);
CREATE INDEX idx_pos_transaction_items_menu_item_id ON pos_transaction_items(menu_item_id);
CREATE INDEX idx_pos_transaction_items_status ON pos_transaction_items(status);

-- WALLET TRANSACTIONS
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_card_id ON wallet_transactions(card_id);
CREATE INDEX idx_wallet_transactions_parent_user_id ON wallet_transactions(parent_user_id);
CREATE INDEX idx_wallet_transactions_smartid_pay_id ON wallet_transactions(smartid_pay_transaction_id);
CREATE INDEX idx_wallet_transactions_billplz_id ON wallet_transactions(billplz_transaction_id) WHERE billplz_transaction_id IS NOT NULL;
CREATE INDEX idx_wallet_transactions_transaction_type ON wallet_transactions(transaction_type);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX idx_wallet_transactions_date ON wallet_transactions(transaction_date);
CREATE INDEX idx_wallet_transactions_user_date ON wallet_transactions(user_id, transaction_date);

-- PARENT CHILD RELATIONSHIPS
CREATE INDEX idx_parent_child_relationships_parent_id ON parent_child_relationships(parent_id);
CREATE INDEX idx_parent_child_relationships_child_id ON parent_child_relationships(child_id);
CREATE INDEX idx_parent_child_relationships_status ON parent_child_relationships(status);
CREATE INDEX idx_parent_child_relationships_relationship_type ON parent_child_relationships(relationship_type);

-- CASH DRAWER SESSIONS
CREATE INDEX idx_cash_drawer_sessions_cafeteria_id ON cash_drawer_sessions(cafeteria_id);
CREATE INDEX idx_cash_drawer_sessions_staff_id ON cash_drawer_sessions(staff_id);
CREATE INDEX idx_cash_drawer_sessions_session_number ON cash_drawer_sessions(session_number);
CREATE INDEX idx_cash_drawer_sessions_status ON cash_drawer_sessions(status);
CREATE INDEX idx_cash_drawer_sessions_opening_time ON cash_drawer_sessions(opening_time);
CREATE INDEX idx_cash_drawer_sessions_closing_time ON cash_drawer_sessions(closing_time) WHERE closing_time IS NOT NULL;

-- CASH MOVEMENTS
CREATE INDEX idx_cash_movements_session_id ON cash_movements(session_id);
CREATE INDEX idx_cash_movements_staff_id ON cash_movements(staff_id);
CREATE INDEX idx_cash_movements_movement_type ON cash_movements(movement_type);
CREATE INDEX idx_cash_movements_authorized_by ON cash_movements(authorized_by) WHERE authorized_by IS NOT NULL;
CREATE INDEX idx_cash_movements_created_at ON cash_movements(created_at);

-- DEVICES
CREATE INDEX idx_devices_institution_id ON devices(institution_id);
CREATE INDEX idx_devices_device_id ON devices(device_id);
CREATE INDEX idx_devices_device_type ON devices(device_type);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_devices_location ON devices(location);
CREATE INDEX idx_devices_last_heartbeat ON devices(last_heartbeat);

-- DAILY SALES SUMMARY
CREATE INDEX idx_daily_sales_summary_cafeteria_id ON daily_sales_summary(cafeteria_id);
CREATE INDEX idx_daily_sales_summary_business_date ON daily_sales_summary(business_date);
CREATE INDEX idx_daily_sales_summary_cafeteria_date ON daily_sales_summary(cafeteria_id, business_date);
CREATE INDEX idx_daily_sales_summary_is_finalized ON daily_sales_summary(is_finalized);

-- SYNC LOGS
CREATE INDEX idx_sync_logs_system ON sync_logs(system);
CREATE INDEX idx_sync_logs_sync_type ON sync_logs(sync_type);
CREATE INDEX idx_sync_logs_entity_id ON sync_logs(entity_id);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);
CREATE INDEX idx_sync_logs_created_at ON sync_logs(created_at);
CREATE INDEX idx_sync_logs_next_retry_at ON sync_logs(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- SYSTEM LOGS
CREATE INDEX idx_system_logs_institution_id ON system_logs(institution_id);
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_device_id ON system_logs(device_id);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_system_logs_entity_type ON system_logs(entity_type);
CREATE INDEX idx_system_logs_entity_id ON system_logs(entity_id);
CREATE INDEX idx_system_logs_status ON system_logs(status);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
CREATE INDEX idx_system_logs_institution_created_at ON system_logs(institution_id, created_at);

-- USER SESSIONS
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_system ON user_sessions(system);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity);

-- COMPOSITE INDEXES FOR COMMON QUERIES
CREATE INDEX idx_users_institution_role ON users(institution_id, primary_system, primary_role) WHERE institution_id IS NOT NULL;
CREATE INDEX idx_pos_transactions_staff_date_status ON pos_transactions(staff_id, transaction_date, payment_status);
CREATE INDEX idx_attendance_records_institution_date_status ON attendance_records(institution_id, date, status);
CREATE INDEX idx_wallet_transactions_user_type_date ON wallet_transactions(user_id, transaction_type, transaction_date);
CREATE INDEX idx_menu_items_cafeteria_active_available ON menu_items(cafeteria_id, is_active, is_available);

-- GIN INDEXES FOR JSONB COLUMNS (for faster JSON queries)
CREATE INDEX idx_institutions_settings_gin ON institutions USING GIN (settings);
CREATE INDEX idx_users_emergency_contact_gin ON users USING GIN (emergency_contact);
CREATE INDEX idx_users_parent_contact_gin ON users USING GIN (parent_contact);
CREATE INDEX idx_smart_cards_card_data_gin ON smart_cards USING GIN (card_data);
CREATE INDEX idx_menu_items_nutritional_info_gin ON menu_items USING GIN (nutritional_info);
CREATE INDEX idx_pos_transaction_items_variants_gin ON pos_transaction_items USING GIN (variants);
CREATE INDEX idx_devices_settings_gin ON devices USING GIN (settings);
CREATE INDEX idx_daily_sales_summary_top_items_gin ON daily_sales_summary USING GIN (top_items);
CREATE INDEX idx_sync_logs_request_data_gin ON sync_logs USING GIN (request_data);
CREATE INDEX idx_sync_logs_response_data_gin ON sync_logs USING GIN (response_data);
CREATE INDEX idx_system_logs_details_gin ON system_logs USING GIN (details);
CREATE INDEX idx_user_sessions_device_info_gin ON user_sessions USING GIN (device_info);

-- PARTIAL INDEXES FOR BETTER PERFORMANCE ON FILTERED QUERIES
CREATE INDEX idx_users_active_hub ON users(institution_id, smartid_hub_role) WHERE status = 'active' AND smartid_hub_role IS NOT NULL;
CREATE INDEX idx_users_active_pos ON users(institution_id, smartid_pos_role) WHERE status = 'active' AND smartid_pos_role IS NOT NULL;
CREATE INDEX idx_smart_cards_active ON smart_cards(user_id, card_number) WHERE status = 'active';
CREATE INDEX idx_biometric_enrollments_active ON biometric_enrollments(user_id, biometric_type) WHERE status = 'active';
CREATE INDEX idx_menu_items_available ON menu_items(cafeteria_id, category_id, display_order) WHERE is_active = true AND is_available = true;
CREATE INDEX idx_pos_transactions_completed ON pos_transactions(cafeteria_id, transaction_date, total_amount) WHERE payment_status = 'completed';
CREATE INDEX idx_cash_drawer_sessions_open ON cash_drawer_sessions(cafeteria_id, staff_id, opening_time) WHERE status = 'open';
CREATE INDEX idx_sync_logs_pending ON sync_logs(system, sync_type, created_at) WHERE status = 'pending' OR status = 'failed';

-- TEXT SEARCH INDEXES (for full-text search capabilities)
CREATE INDEX idx_institutions_name_text ON institutions USING GIN (to_tsvector('english', name));
CREATE INDEX idx_users_full_name_text ON users USING GIN (to_tsvector('english', full_name));
CREATE INDEX idx_menu_items_name_text ON menu_items USING GIN (to_tsvector('english', name));
CREATE INDEX idx_menu_items_description_text ON menu_items USING GIN (to_tsvector('english', description)) WHERE description IS NOT NULL;
