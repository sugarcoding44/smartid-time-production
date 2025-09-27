-- Execute this in your Supabase SQL Editor
-- This creates the user_setup_tokens table for email functionality

-- Create user_setup_tokens table
CREATE TABLE IF NOT EXISTS user_setup_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_setup_tokens_token ON user_setup_tokens(token);
CREATE INDEX IF NOT EXISTS idx_user_setup_tokens_user_id ON user_setup_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_setup_tokens_expires_at ON user_setup_tokens(expires_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_setup_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_setup_tokens_updated_at
  BEFORE UPDATE ON user_setup_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_user_setup_tokens_updated_at();

-- RLS (Row Level Security) policies
ALTER TABLE user_setup_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own setup tokens
CREATE POLICY "Users can access their own setup tokens"
  ON user_setup_tokens
  FOR ALL
  USING (auth.uid() = user_id);

-- Policy: Service role can manage all setup tokens (for admin operations)
CREATE POLICY "Service role can manage all setup tokens"
  ON user_setup_tokens
  FOR ALL
  TO service_role
  USING (true);

-- Add comment for documentation
COMMENT ON TABLE user_setup_tokens IS 'Stores temporary tokens for new user password setup';
COMMENT ON COLUMN user_setup_tokens.token IS 'Unique token for password setup link';
COMMENT ON COLUMN user_setup_tokens.expires_at IS 'When the token expires (typically 24 hours)';
COMMENT ON COLUMN user_setup_tokens.used_at IS 'When the token was used (null if not used yet)';
