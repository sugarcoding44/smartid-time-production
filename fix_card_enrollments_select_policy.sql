-- Fix the SELECT policy for card_enrollments table
-- The issue: current policy only checks auth_user_id, but should also check id column

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "card_enrollments_select" ON card_enrollments;

-- Create a better SELECT policy that checks both auth_user_id AND id
CREATE POLICY "card_enrollments_select"
ON card_enrollments
FOR SELECT
TO public
USING (
    institution_id IN (
        SELECT institution_id 
        FROM users 
        WHERE auth_user_id = auth.uid() 
           OR id = auth.uid()
    )
);

-- Verify the new policy
SELECT 
    policyname,
    cmd,
    qual::text as using_clause
FROM pg_policies 
WHERE tablename = 'card_enrollments' AND cmd = 'SELECT';