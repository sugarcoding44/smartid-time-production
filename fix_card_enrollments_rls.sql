-- Fix RLS Policies for card_enrollments table
-- Run this in Supabase SQL Editor

-- First, let's see what policies exist
SELECT 
    policyname,
    cmd,
    qual::text as using_clause,
    with_check::text as with_check_clause
FROM pg_policies 
WHERE tablename = 'card_enrollments';

-- Drop existing restrictive policies that might be blocking access
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON card_enrollments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON card_enrollments;
DROP POLICY IF EXISTS "Users can view enrollments from their institution" ON card_enrollments;

-- Create a proper SELECT policy that allows users to see enrollments from their institution
CREATE POLICY "Allow users to view enrollments from their institution"
ON card_enrollments
FOR SELECT
TO authenticated
USING (
    institution_id IN (
        SELECT institution_id 
        FROM users 
        WHERE auth_user_id = auth.uid() 
           OR id = auth.uid()
    )
);

-- Create INSERT policy for enrollment creation
CREATE POLICY "Allow users to create enrollments for their institution"
ON card_enrollments
FOR INSERT
TO authenticated
WITH CHECK (
    institution_id IN (
        SELECT institution_id 
        FROM users 
        WHERE auth_user_id = auth.uid() 
           OR id = auth.uid()
    )
);

-- Create UPDATE policy for enrollment modifications
CREATE POLICY "Allow users to update enrollments from their institution"
ON card_enrollments
FOR UPDATE
TO authenticated
USING (
    institution_id IN (
        SELECT institution_id 
        FROM users 
        WHERE auth_user_id = auth.uid() 
           OR id = auth.uid()
    )
)
WITH CHECK (
    institution_id IN (
        SELECT institution_id 
        FROM users 
        WHERE auth_user_id = auth.uid() 
           OR id = auth.uid()
    )
);

-- Verify the new policies
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'card_enrollments'
ORDER BY cmd, policyname;