-- Bank Accounts for withdrawals
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_type VARCHAR(20) NOT NULL CHECK (owner_type IN ('user', 'merchant', 'institution')),
    owner_id UUID NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(20),
    account_number VARCHAR(50) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(20) DEFAULT 'savings' CHECK (account_type IN ('savings', 'current')),
    branch_code VARCHAR(20),
    swift_code VARCHAR(20),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    daily_withdrawal_limit DECIMAL(10,2),
    monthly_withdrawal_limit DECIMAL(10,2),
    total_withdrawn DECIMAL(15,2) DEFAULT 0,
    withdrawal_count INTEGER DEFAULT 0,
    last_withdrawal_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Withdrawal Requests
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(50) UNIQUE NOT NULL,
    requester_type VARCHAR(20) NOT NULL CHECK (requester_type IN ('user', 'merchant', 'institution')),
    requester_id UUID NOT NULL,
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed', 'failed')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Withdrawal Transactions
CREATE TABLE IF NOT EXISTS withdrawal_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    withdrawal_request_id UUID NOT NULL REFERENCES withdrawal_requests(id),
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id),
    amount DECIMAL(10,2) NOT NULL,
    fee_amount DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payment_gateway VARCHAR(20) CHECK (payment_gateway IN ('billplz', 'stripe', 'manual')),
    payment_reference VARCHAR(100),
    gateway_response JSONB,
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wallet Transactions (for SmartID PAY)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    card_id UUID NOT NULL REFERENCES smartid_cards(id),
    user_id UUID NOT NULL REFERENCES users(id),
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('topup', 'payment', 'refund', 'withdrawal', 'adjustment')),
    amount DECIMAL(10,2) NOT NULL,
    fee_amount DECIMAL(10,2) DEFAULT 0,
    running_balance DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
    reference_type VARCHAR(20),
    reference_id UUID,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Merchant Settlement Periods
CREATE TABLE IF NOT EXISTS merchant_settlement_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    total_transactions INTEGER DEFAULT 0,
    total_sales DECIMAL(10,2) DEFAULT 0,
    total_fees DECIMAL(10,2) DEFAULT 0,
    net_settlement_amount DECIMAL(10,2) DEFAULT 0,
    processed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Settlement Transactions
CREATE TABLE IF NOT EXISTS settlement_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    settlement_period_id UUID NOT NULL REFERENCES merchant_settlement_periods(id),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    withdrawal_transaction_id UUID REFERENCES withdrawal_transactions(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_bank_accounts_owner ON bank_accounts(owner_type, owner_id);
CREATE INDEX idx_withdrawal_requests_requester ON withdrawal_requests(requester_type, requester_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_withdrawal_transactions_request ON withdrawal_transactions(withdrawal_request_id);
CREATE INDEX idx_wallet_transactions_card ON wallet_transactions(card_id);
CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX idx_merchant_settlements_merchant ON merchant_settlement_periods(merchant_id);
CREATE INDEX idx_settlement_transactions_period ON settlement_transactions(settlement_period_id);

-- Functions for withdrawal validation
CREATE OR REPLACE FUNCTION check_withdrawal_limits(
    p_bank_account_id UUID,
    p_amount DECIMAL
) RETURNS BOOLEAN AS $$
DECLARE
    v_daily_total DECIMAL;
    v_monthly_total DECIMAL;
    v_daily_limit DECIMAL;
    v_monthly_limit DECIMAL;
BEGIN
    -- Get the limits
    SELECT daily_withdrawal_limit, monthly_withdrawal_limit
    INTO v_daily_limit, v_monthly_limit
    FROM bank_accounts
    WHERE id = p_bank_account_id;
    
    -- Get today's total
    SELECT COALESCE(SUM(amount), 0)
    INTO v_daily_total
    FROM withdrawal_transactions
    WHERE bank_account_id = p_bank_account_id
    AND DATE(created_at) = CURRENT_DATE
    AND status NOT IN ('failed', 'cancelled');
    
    -- Get this month's total
    SELECT COALESCE(SUM(amount), 0)
    INTO v_monthly_total
    FROM withdrawal_transactions
    WHERE bank_account_id = p_bank_account_id
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    AND status NOT IN ('failed', 'cancelled');
    
    -- Check limits
    RETURN (v_daily_limit IS NULL OR v_daily_total + p_amount <= v_daily_limit)
        AND (v_monthly_limit IS NULL OR v_monthly_total + p_amount <= v_monthly_limit);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE OR REPLACE FUNCTION update_bank_account_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE bank_accounts
        SET 
            total_withdrawn = COALESCE(total_withdrawn, 0) + NEW.amount,
            withdrawal_count = COALESCE(withdrawal_count, 0) + 1,
            last_withdrawal_at = NEW.completed_at
        WHERE id = NEW.bank_account_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_bank_account_stats
    AFTER UPDATE OF status ON withdrawal_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_bank_account_stats();