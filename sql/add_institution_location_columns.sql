-- Add location-related columns to institutions table
-- This allows schools to set their official location during registration

-- 1. Add location columns to institutions table
ALTER TABLE institutions 
ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE institutions 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);

ALTER TABLE institutions 
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

ALTER TABLE institutions 
ADD COLUMN IF NOT EXISTS attendance_radius INTEGER DEFAULT 300; -- meters

ALTER TABLE institutions 
ADD COLUMN IF NOT EXISTS timezone VARCHAR DEFAULT 'Asia/Kuala_Lumpur';

ALTER TABLE institutions 
ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{"start": "08:00", "end": "17:00"}';

ALTER TABLE institutions 
ADD COLUMN IF NOT EXISTS working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5]; -- Mon-Fri

-- 2. Create indexes for location-based queries
CREATE INDEX IF NOT EXISTS idx_institutions_location 
ON institutions(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_institutions_address 
ON institutions USING GIN(to_tsvector('english', address));

-- 3. Add constraint to ensure if lat/lng is set, both are set
ALTER TABLE institutions 
ADD CONSTRAINT institutions_location_complete_check 
CHECK (
    (latitude IS NULL AND longitude IS NULL) OR 
    (latitude IS NOT NULL AND longitude IS NOT NULL)
);

-- 4. Create a view for institutions with complete location info
CREATE OR REPLACE VIEW institutions_with_location AS
SELECT 
    i.*,
    CASE 
        WHEN i.latitude IS NOT NULL AND i.longitude IS NOT NULL 
        THEN true 
        ELSE false 
    END as has_location,
    CASE 
        WHEN i.latitude IS NOT NULL AND i.longitude IS NOT NULL 
        THEN ST_Point(i.longitude, i.latitude) 
        ELSE NULL 
    END as location_point
FROM institutions i;

-- 5. Add sample location data for existing institutions (if any)
-- You can update these with real coordinates later

-- Example: University of Malaya
UPDATE institutions 
SET 
    address = 'University of Malaya, 50603 Kuala Lumpur, Federal Territory of Kuala Lumpur, Malaysia',
    latitude = 3.1211,
    longitude = 101.6536,
    attendance_radius = 500,
    operating_hours = '{"start": "08:00", "end": "17:00", "break_start": "12:00", "break_end": "13:00"}',
    working_days = ARRAY[1,2,3,4,5]
WHERE name LIKE '%University%' OR name LIKE '%Malaya%';

-- Example: Generic update for other institutions
UPDATE institutions 
SET 
    address = 'Please update with actual address',
    attendance_radius = 300,
    operating_hours = '{"start": "08:00", "end": "17:00", "break_start": "12:00", "break_end": "13:00"}',
    working_days = ARRAY[1,2,3,4,5]
WHERE address IS NULL;

-- 6. Show the updated institutions
SELECT 'Institutions table updated with location columns!' as message;

SELECT 
    name,
    address,
    latitude,
    longitude,
    attendance_radius,
    operating_hours,
    working_days
FROM institutions
ORDER BY name;
