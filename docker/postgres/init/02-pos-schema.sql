-- POS Transactions
CREATE TABLE IF NOT EXISTS pos_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    cashier_id UUID NOT NULL REFERENCES users(id),
    customer_id UUID REFERENCES users(id),
    card_id UUID REFERENCES smartid_cards(id),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    service_charge DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20),
    payment_status VARCHAR(20) DEFAULT 'pending',
    order_type VARCHAR(20) DEFAULT 'dine_in',
    order_status VARCHAR(20) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Methods and Gateways

-- Payment Method Types
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(20) CHECK (category IN ('cash', 'card', 'ewallet', 'bank_transfer', 'smartid')),
    icon_url TEXT,
    requires_verification BOOLEAN DEFAULT false,
    is_online BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Merchant Payment Methods
CREATE TABLE IF NOT EXISTS merchant_payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
    is_enabled BOOLEAN DEFAULT true,
    display_name VARCHAR(100),
    instructions TEXT,
    fee_percentage DECIMAL(5,2) DEFAULT 0,
    fee_fixed DECIMAL(10,2) DEFAULT 0,
    min_amount DECIMAL(10,2),
    max_amount DECIMAL(10,2),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (merchant_id, payment_method_id)
);

-- Payment Gateways
CREATE TABLE IF NOT EXISTS payment_gateways (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    gateway_type VARCHAR(50) CHECK (gateway_type IN ('card', 'qr', 'bank', 'ewallet')),
    is_active BOOLEAN DEFAULT true,
    settings_schema JSONB, -- Required settings schema
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Merchant Payment Gateway Settings
CREATE TABLE IF NOT EXISTS merchant_payment_gateways (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    gateway_id UUID NOT NULL REFERENCES payment_gateways(id),
    is_enabled BOOLEAN DEFAULT true,
    credentials JSONB,
    settings JSONB DEFAULT '{}',
    test_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (merchant_id, gateway_id)
);

-- Payment Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pos_transaction_id UUID NOT NULL REFERENCES pos_transactions(id),
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
    gateway_id UUID REFERENCES payment_gateways(id),
    amount DECIMAL(10,2) NOT NULL,
    fee_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    gateway_reference VARCHAR(100),
    gateway_response JSONB,
    error_message TEXT,
    refund_reference VARCHAR(100),
    refunded_at TIMESTAMP WITH TIME ZONE,
    refunded_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default payment methods
INSERT INTO payment_methods (code, name, category, requires_verification, is_online) VALUES
('cash', 'Cash', 'cash', false, false),
('debit_card', 'Debit Card', 'card', true, true),
('credit_card', 'Credit Card', 'card', true, true),
('duitnow_qr', 'DuitNow QR', 'ewallet', true, true),
('fpx', 'FPX Online Banking', 'bank_transfer', true, true),
('smartid_card', 'SmartID Card', 'smartid', true, false),
('smartid_palm', 'SmartID Palm', 'smartid', true, false)
ON CONFLICT (code) DO NOTHING;

-- Insert default payment gateways
INSERT INTO payment_gateways (code, name, gateway_type, settings_schema) VALUES
('stripe', 'Stripe', 'card', '{
    "required": ["api_key", "webhook_secret"],
    "properties": {
        "api_key": {"type": "string"},
        "webhook_secret": {"type": "string"}
    }
}'),
('duitnow', 'DuitNow', 'qr', '{
    "required": ["merchant_id", "api_key"],
    "properties": {
        "merchant_id": {"type": "string"},
        "api_key": {"type": "string"}
    }
}'),
('fpx', 'FPX', 'bank', '{
    "required": ["merchant_id", "api_key"],
    "properties": {
        "merchant_id": {"type": "string"},
        "api_key": {"type": "string"}
    }
}')
ON CONFLICT (code) DO NOTHING;

-- Indexes
CREATE INDEX idx_merchant_payment_methods ON merchant_payment_methods(merchant_id);
CREATE INDEX idx_merchant_payment_gateways ON merchant_payment_gateways(merchant_id);
CREATE INDEX idx_payment_transactions_pos ON payment_transactions(pos_transaction_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);

-- POS Settings Management

-- Global POS Settings
CREATE TABLE IF NOT EXISTS pos_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    category VARCHAR(50) NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (merchant_id, category, setting_key)
);

-- POS Printer Settings
CREATE TABLE IF NOT EXISTS pos_printer_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    printer_name VARCHAR(100) NOT NULL,
    printer_type VARCHAR(50) CHECK (printer_type IN ('receipt', 'kitchen', 'label')),
    connection_type VARCHAR(50) CHECK (connection_type IN ('usb', 'network', 'bluetooth')),
    ip_address VARCHAR(50),
    port INTEGER,
    paper_size VARCHAR(20),
    dpi INTEGER,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Receipt Templates
CREATE TABLE IF NOT EXISTS pos_receipt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    name VARCHAR(100) NOT NULL,
    template_type VARCHAR(50) CHECK (template_type IN ('receipt', 'kitchen', 'label')),
    header_text TEXT,
    footer_text TEXT,
    logo_url TEXT,
    font_size INTEGER DEFAULT 12,
    paper_width INTEGER,  -- in mm
    show_logo BOOLEAN DEFAULT true,
    show_merchant_info BOOLEAN DEFAULT true,
    show_customer_info BOOLEAN DEFAULT true,
    show_tax_details BOOLEAN DEFAULT true,
    show_item_details BOOLEAN DEFAULT true,
    template_content JSONB,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tax Settings
CREATE TABLE IF NOT EXISTS pos_tax_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    tax_name VARCHAR(100) NOT NULL,
    tax_code VARCHAR(50),
    tax_rate DECIMAL(5,2) NOT NULL,
    is_compound BOOLEAN DEFAULT false,
    is_inclusive BOOLEAN DEFAULT false,
    applies_to_all_items BOOLEAN DEFAULT true,
    exempt_categories UUID[],  -- Array of category IDs that are exempt
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Discount Settings
CREATE TABLE IF NOT EXISTS pos_discount_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    name VARCHAR(100) NOT NULL,
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    applies_to VARCHAR(20) CHECK (applies_to IN ('total', 'item', 'category')),
    applicable_items UUID[],  -- Array of item IDs
    applicable_categories UUID[],  -- Array of category IDs
    requires_approval BOOLEAN DEFAULT false,
    allowed_roles VARCHAR(50)[], -- Array of role names that can apply this discount
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default POS settings
INSERT INTO pos_settings 
    (merchant_id, category, setting_key, setting_value, description, is_system) 
SELECT 
    m.id,
    'general',
    'currency',
    '"MYR"'::jsonb,
    'Default currency for the POS system',
    true
FROM merchants m
ON CONFLICT DO NOTHING;

INSERT INTO pos_settings 
    (merchant_id, category, setting_key, setting_value, description, is_system)
SELECT 
    m.id,
    'tax',
    'service_tax_rate',
    '0.06'::jsonb,
    'Default service tax rate (6%)',
    true
FROM merchants m
ON CONFLICT DO NOTHING;

INSERT INTO pos_settings 
    (merchant_id, category, setting_key, setting_value, description, is_system)
SELECT 
    m.id,
    'receipt',
    'footer_text',
    '"Thank you for your business!"'::jsonb,
    'Default receipt footer text',
    true
FROM merchants m
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX idx_pos_settings_merchant ON pos_settings(merchant_id);
CREATE INDEX idx_pos_settings_category ON pos_settings(category);
CREATE INDEX idx_pos_printer_settings_merchant ON pos_printer_settings(merchant_id);
CREATE INDEX idx_pos_receipt_templates_merchant ON pos_receipt_templates(merchant_id);
CREATE INDEX idx_pos_tax_settings_merchant ON pos_tax_settings(merchant_id);
CREATE INDEX idx_pos_discount_settings_merchant ON pos_discount_settings(merchant_id);

-- POS Accounts Management
CREATE TABLE IF NOT EXISTS pos_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_number VARCHAR(50) UNIQUE NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    owner_id UUID NOT NULL REFERENCES users(id),
    account_type VARCHAR(20) DEFAULT 'standard' CHECK (account_type IN ('standard', 'premium', 'enterprise')),
    license_key VARCHAR(100) UNIQUE,
    license_status VARCHAR(20) DEFAULT 'active' CHECK (license_status IN ('active', 'expired', 'suspended', 'cancelled')),
    subscription_plan VARCHAR(20) DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'standard', 'premium', 'enterprise')),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'trial', 'expired', 'cancelled')),
    trial_starts_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_starts_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    max_devices INTEGER DEFAULT 1,
    max_users INTEGER DEFAULT 5,
    can_access_api BOOLEAN DEFAULT false,
    api_key VARCHAR(100),
    settings JSONB DEFAULT '{}',
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed', 'in_progress')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- POS Account Devices
CREATE TABLE IF NOT EXISTS pos_account_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pos_account_id UUID NOT NULL REFERENCES pos_accounts(id),
    device_id VARCHAR(100) NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    device_type VARCHAR(20) CHECK (device_type IN ('terminal', 'mobile', 'tablet', 'web')),
    device_model VARCHAR(100),
    device_os VARCHAR(50),
    app_version VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_active_at TIMESTAMP WITH TIME ZONE,
    location_id UUID REFERENCES institution_locations(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (pos_account_id, device_id)
);

-- POS Account Users
CREATE TABLE IF NOT EXISTS pos_account_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pos_account_id UUID NOT NULL REFERENCES pos_accounts(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(20) CHECK (role IN ('owner', 'admin', 'manager', 'cashier', 'staff')),
    permissions JSONB DEFAULT '{}',
    pin_code VARCHAR(6),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (pos_account_id, user_id)
);

-- POS Account Activity Logs
CREATE TABLE IF NOT EXISTS pos_account_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pos_account_id UUID NOT NULL REFERENCES pos_accounts(id),
    user_id UUID REFERENCES users(id),
    device_id UUID REFERENCES pos_account_devices(id),
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address INET,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_pos_accounts_merchant ON pos_accounts(merchant_id);
CREATE INDEX idx_pos_accounts_institution ON pos_accounts(institution_id);
CREATE INDEX idx_pos_accounts_owner ON pos_accounts(owner_id);
CREATE INDEX idx_pos_account_devices_account ON pos_account_devices(pos_account_id);
CREATE INDEX idx_pos_account_users_account ON pos_account_users(pos_account_id);
CREATE INDEX idx_pos_account_users_user ON pos_account_users(user_id);
CREATE INDEX idx_pos_account_activity_account ON pos_account_activity_logs(pos_account_id);

-- Functions
CREATE OR REPLACE FUNCTION check_pos_account_device_limit()
RETURNS TRIGGER AS $$
DECLARE
    current_device_count INTEGER;
    max_devices INTEGER;
BEGIN
    -- Get current device count and max allowed devices
    SELECT COUNT(*), pa.max_devices
    INTO current_device_count, max_devices
    FROM pos_account_devices pad
    JOIN pos_accounts pa ON pa.id = pad.pos_account_id
    WHERE pad.pos_account_id = NEW.pos_account_id
    AND pad.is_active = true
    GROUP BY pa.max_devices;

    -- Check if adding new device would exceed limit
    IF current_device_count >= max_devices THEN
        RAISE EXCEPTION 'Maximum device limit reached for this POS account';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_pos_device_limit
    BEFORE INSERT ON pos_account_devices
    FOR EACH ROW
    EXECUTE FUNCTION check_pos_account_device_limit();

-- SmartID POS Menu and Transaction tables

-- Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    color VARCHAR(7),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    category_id UUID REFERENCES menu_categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    preparation_time INTEGER, -- in minutes
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    stock_quantity INTEGER,
    minimum_stock INTEGER,
    sku VARCHAR(50),
    barcode VARCHAR(50),
    calories INTEGER,
    allergens JSONB,
    customization_options JSONB DEFAULT '[]',
    tags VARCHAR[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menu Item Variants
CREATE TABLE IF NOT EXISTS menu_item_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id),
    name VARCHAR(100) NOT NULL,
    price_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    stock_quantity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menu Item Add-ons
CREATE TABLE IF NOT EXISTS menu_item_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menu Item Add-on Groups
CREATE TABLE IF NOT EXISTS menu_addon_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id),
    name VARCHAR(100) NOT NULL,
    min_selections INTEGER DEFAULT 0,
    max_selections INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menu Item Add-on Group Items
CREATE TABLE IF NOT EXISTS menu_addon_group_items (
    addon_group_id UUID NOT NULL REFERENCES menu_addon_groups(id),
    addon_id UUID NOT NULL REFERENCES menu_item_addons(id),
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (addon_group_id, addon_id)
);

-- POS Transactions
CREATE TABLE IF NOT EXISTS pos_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    institution_id UUID NOT NULL REFERENCES institutions(id),
    cashier_id UUID NOT NULL REFERENCES users(id),
    customer_id UUID REFERENCES users(id),
    card_id UUID REFERENCES smartid_cards(id),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    service_charge DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'wallet', 'bank_transfer')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'voided')),
    payment_reference VARCHAR(100),
    order_type VARCHAR(20) DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
    order_status VARCHAR(20) DEFAULT 'pending' CHECK (order_status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transaction Items
CREATE TABLE IF NOT EXISTS pos_transaction_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES pos_transactions(id),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id),
    variant_id UUID REFERENCES menu_item_variants(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    customizations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transaction Item Add-ons
CREATE TABLE IF NOT EXISTS pos_transaction_item_addons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_item_id UUID NOT NULL REFERENCES pos_transaction_items(id),
    addon_id UUID NOT NULL REFERENCES menu_item_addons(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cash Management
CREATE TABLE IF NOT EXISTS cash_drawer_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    cashier_id UUID NOT NULL REFERENCES users(id),
    opening_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closing_time TIMESTAMP WITH TIME ZONE,
    opening_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    closing_amount DECIMAL(10,2),
    actual_amount DECIMAL(10,2),
    variance_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'verified')),
    notes TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cash Movements
CREATE TABLE IF NOT EXISTS cash_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES cash_drawer_sessions(id),
    transaction_id UUID REFERENCES pos_transactions(id),
    movement_type VARCHAR(20) CHECK (movement_type IN ('sale', 'refund', 'payout', 'deposit', 'withdrawal')),
    amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    performed_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_menu_items_merchant ON menu_items(merchant_id);
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_transactions_merchant ON pos_transactions(merchant_id);
CREATE INDEX idx_transactions_customer ON pos_transactions(customer_id);
CREATE INDEX idx_transactions_date ON pos_transactions(transaction_date);
CREATE INDEX idx_transaction_items_transaction ON pos_transaction_items(transaction_id);
CREATE INDEX idx_cash_sessions_merchant ON cash_drawer_sessions(merchant_id);
CREATE INDEX idx_cash_movements_session ON cash_movements(session_id);

-- Triggers for stock management
CREATE OR REPLACE FUNCTION update_stock_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
        -- Decrease stock for completed transactions
        UPDATE menu_items mi
        SET stock_quantity = stock_quantity - ti.quantity
        FROM pos_transaction_items ti
        WHERE ti.transaction_id = NEW.id
        AND ti.menu_item_id = mi.id
        AND mi.stock_quantity IS NOT NULL;
    ELSIF NEW.payment_status = 'refunded' AND OLD.payment_status = 'completed' THEN
        -- Increase stock for refunded transactions
        UPDATE menu_items mi
        SET stock_quantity = stock_quantity + ti.quantity
        FROM pos_transaction_items ti
        WHERE ti.transaction_id = NEW.id
        AND ti.menu_item_id = mi.id
        AND mi.stock_quantity IS NOT NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stock_on_transaction
    AFTER UPDATE OF payment_status ON pos_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_on_transaction();