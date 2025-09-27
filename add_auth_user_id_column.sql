-- Migration: Add auth_user_id column to users table
-- This links web-admin-created users to their Supabase Auth accounts

-- Step 1: Add auth_user_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'auth_user_id'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        
        -- Add index for performance
        CREATE INDEX IF NOT EXISTS idx_users_auth_user_id 
        ON public.users(auth_user_id);
        
        RAISE NOTICE 'Added auth_user_id column to users table';
    ELSE
        RAISE NOTICE 'auth_user_id column already exists';
    END IF;
END $$;

-- Step 2: Link existing users to their auth accounts by email
-- This will match users created by web admin to users who have registered
UPDATE public.users 
SET auth_user_id = auth.users.id
FROM auth.users 
WHERE public.users.email = auth.users.email 
AND public.users.auth_user_id IS NULL
AND public.users.status = 'active';

-- Step 3: Show results
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.primary_role,
    CASE 
        WHEN u.auth_user_id IS NOT NULL THEN '✅ Linked to auth'
        ELSE '❌ Not linked'
    END as auth_status,
    u.auth_user_id
FROM public.users u
WHERE u.status = 'active'
ORDER BY u.full_name;

-- Step 4: Show auth users that don't have matching user records
SELECT 
    'Auth user without user record' as status,
    au.email,
    au.id as auth_user_id,
    au.created_at
FROM auth.users au
LEFT JOIN public.users u ON u.auth_user_id = au.id
WHERE u.id IS NULL
AND au.email_confirmed_at IS NOT NULL;
