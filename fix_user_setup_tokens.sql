-- Fix the user_setup_tokens table setup
-- Run this in your Supabase SQL Editor

-- First, drop the problematic trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_user_setup_tokens_updated_at ON public.user_setup_tokens;

-- The table already exists, so we don't need to recreate it
-- But we need to add the proper trigger using the existing function

-- Add the correct trigger using the existing update_updated_at_column function
CREATE TRIGGER update_user_setup_tokens_updated_at
    BEFORE UPDATE ON public.user_setup_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_setup_tokens_user_id_fkey'
    ) THEN
        ALTER TABLE public.user_setup_tokens 
        ADD CONSTRAINT user_setup_tokens_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_setup_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for users to access their own setup tokens
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_setup_tokens' 
        AND policyname = 'Users can access their own setup tokens'
    ) THEN
        CREATE POLICY "Users can access their own setup tokens"
            ON public.user_setup_tokens
            FOR ALL
            USING (user_id IN (
                SELECT id FROM public.users
                WHERE auth_user_id = auth.uid()
            ));
    END IF;
END $$;

-- Policy for service role to manage all setup tokens (for admin operations)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_setup_tokens' 
        AND policyname = 'Service role can manage all setup tokens'
    ) THEN
        CREATE POLICY "Service role can manage all setup tokens"
            ON public.user_setup_tokens
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- Clean up any expired tokens (optional housekeeping)
DELETE FROM public.user_setup_tokens 
WHERE expires_at < NOW() AND used_at IS NULL;