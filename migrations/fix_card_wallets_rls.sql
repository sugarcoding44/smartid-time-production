-- Fix RLS policies for card_wallets table to allow wallet creation on enrollment

-- Drop existing policies that might be blocking wallet creation
DROP POLICY IF EXISTS "Users can only access their own wallets" ON card_wallets;
DROP POLICY IF EXISTS "Users can manage wallets from their institution" ON card_wallets;

-- Create more permissive RLS policy for card_wallets
CREATE POLICY "Allow wallet operations for same institution" ON card_wallets
    FOR ALL USING (
        -- Allow access if the wallet belongs to an enrollment from user's institution
        enrollment_id IN (
            SELECT ce.id 
            FROM card_enrollments ce
            WHERE ce.institution_id IN (
                SELECT u.institution_id 
                FROM users u 
                WHERE u.auth_user_id = auth.uid() OR u.id = auth.uid()
            )
        )
    )
    WITH CHECK (
        -- Allow insertion if the enrollment belongs to user's institution
        enrollment_id IN (
            SELECT ce.id 
            FROM card_enrollments ce
            WHERE ce.institution_id IN (
                SELECT u.institution_id 
                FROM users u 
                WHERE u.auth_user_id = auth.uid() OR u.id = auth.uid()
            )
        )
    );

-- Ensure RLS is enabled on card_wallets
ALTER TABLE card_wallets ENABLE ROW LEVEL SECURITY;

-- Also create a policy to allow the trigger function to create wallets
-- This is needed because triggers run with definer rights, not invoker rights
CREATE POLICY "Allow system to create wallets" ON card_wallets
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions for the trigger function
GRANT INSERT ON card_wallets TO postgres;
GRANT SELECT ON card_enrollments TO postgres;
GRANT SELECT ON users TO postgres;
