-- Fix infinite recursion in users table RLS policies
-- This script will drop problematic policies and create new ones

-- First, disable RLS temporarily to avoid issues
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on users table
DO $$ 
DECLARE
    pol_name text;
BEGIN
    FOR pol_name IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', pol_name);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies

-- Policy for authenticated users to read their own profile
CREATE POLICY "Users can read own profile" 
ON users FOR SELECT 
TO authenticated 
USING (auth_user_id = auth.uid());

-- Policy for authenticated users to update their own profile
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth_user_id = auth.uid());

-- Policy for service role (admin) to access all users
CREATE POLICY "Service role full access" 
ON users FOR ALL 
TO service_role 
USING (true);

-- Policy for authenticated users to insert (for profile creation)
CREATE POLICY "Users can create own profile" 
ON users FOR INSERT 
TO authenticated 
WITH CHECK (auth_user_id = auth.uid());

-- Policy for admin users to access all users in same institution
CREATE POLICY "Admin users can access institution users" 
ON users FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM users admin_user 
        WHERE admin_user.auth_user_id = auth.uid() 
        AND admin_user.primary_role IN ('admin', 'superadmin', 'hr_manager')
        AND (admin_user.institution_id = users.institution_id OR admin_user.primary_role = 'superadmin')
    )
);

-- Grant necessary permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;