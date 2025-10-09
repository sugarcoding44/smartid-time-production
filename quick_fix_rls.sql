-- QUICK FIX: Disable RLS temporarily to stop infinite recursion
-- Run this first to get your app working immediately

-- Disable RLS on users table temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Alternative: Drop all policies (use this if disabling doesn't work)
-- DROP POLICY IF EXISTS "Users can view own profile" ON users;
-- DROP POLICY IF EXISTS "Users can update own profile" ON users;
-- DROP POLICY IF EXISTS "Admin users can view all users" ON users;
-- DROP POLICY IF EXISTS "Superadmin full access" ON users;
-- DROP POLICY IF EXISTS "Institution admin access" ON users;

-- You can re-enable later with proper policies:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;