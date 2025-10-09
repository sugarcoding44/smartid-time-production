-- Create user_setup_tokens table for email-based user registration
-- This table stores temporary tokens for password setup links sent via email

CREATE TABLE IF NOT EXISTS public.user_setup_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_setup_tokens_token ON public.user_setup_tokens(token);
CREATE INDEX IF NOT EXISTS idx_user_setup_tokens_user_id ON public.user_setup_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_setup_tokens_expires_at ON public.user_setup_tokens(expires_at);

-- Add updated_at trigger
CREATE TRIGGER update_user_setup_tokens_updated_at
    BEFORE UPDATE ON public.user_setup_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.user_setup_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can access their own setup tokens"
    ON public.user_setup_tokens
    FOR ALL
    USING (user_id IN (
        SELECT id FROM public.users
        WHERE auth_user_id = auth.uid()
    ));

-- Service role can manage all setup tokens (for admin operations)
CREATE POLICY "Service role can manage all setup tokens"
    ON public.user_setup_tokens
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);