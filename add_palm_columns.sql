-- Quick fix: Add essential palm biometric columns to users table
-- Run this in your Supabase SQL editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS palm_id VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS palm_enrolled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_palm_scan TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS palm_scan_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS palm_status VARCHAR DEFAULT 'pending' CHECK (palm_status IN ('active', 'pending', 'inactive', 'expired'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS palm_quality INTEGER CHECK (palm_quality >= 0 AND palm_quality <= 100);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_palm_id ON users(palm_id);
CREATE INDEX IF NOT EXISTS idx_users_palm_status ON users(palm_status);

-- Update any NULL palm_scan_count to 0
UPDATE users SET palm_scan_count = 0 WHERE palm_scan_count IS NULL;
