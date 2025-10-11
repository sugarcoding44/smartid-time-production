-- Add institution_id column to smartid_cards table for multi-tenancy
ALTER TABLE smartid_cards 
ADD COLUMN institution_id UUID REFERENCES institutions(id);

-- Create index for better performance on institution queries
CREATE INDEX IF NOT EXISTS idx_smartid_cards_institution_id ON smartid_cards(institution_id);

-- Update existing records to have the same institution_id (if any exist)
-- You may need to adjust this based on your current data
-- UPDATE smartid_cards SET institution_id = (SELECT id FROM institutions LIMIT 1) WHERE institution_id IS NULL;

-- Add RLS policy to ensure users can only see cards from their institution
DROP POLICY IF EXISTS "Users can only see cards from their institution" ON smartid_cards;

CREATE POLICY "Users can only see cards from their institution" ON smartid_cards
    FOR ALL USING (
        institution_id IN (
            SELECT institution_id FROM users 
            WHERE users.auth_user_id = auth.uid() 
            OR users.id = auth.uid()
        )
    );

-- Enable RLS on smartid_cards table
ALTER TABLE smartid_cards ENABLE ROW LEVEL SECURITY;