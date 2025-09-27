-- Create separate institution_locations table for better organization
-- This allows multiple locations per institution and better flexibility

-- 1. Create institution_locations table
CREATE TABLE IF NOT EXISTS institution_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    
    -- Location identification
    name VARCHAR NOT NULL, -- e.g., "Main Campus", "Branch Office", "Building A"
    location_type VARCHAR DEFAULT 'campus' CHECK (location_type IN ('campus', 'building', 'branch', 'office', 'facility')),
    
    -- Address information
    address TEXT NOT NULL,
    city VARCHAR,
    state VARCHAR,
    postal_code VARCHAR,
    country VARCHAR DEFAULT 'Malaysia',
    
    -- Geographic coordinates
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    
    -- Attendance settings
    attendance_radius INTEGER DEFAULT 300, -- meters
    is_attendance_enabled BOOLEAN DEFAULT true,
    requires_approval_outside_radius BOOLEAN DEFAULT true,
    
    -- Operating hours
    operating_hours JSONB DEFAULT '{"start": "08:00", "end": "17:00"}',
    working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- Mon-Fri (1=Monday, 7=Sunday)
    timezone VARCHAR DEFAULT 'Asia/Kuala_Lumpur',
    
    -- Break times
    break_times JSONB DEFAULT '{"lunch": {"start": "12:00", "end": "13:00"}}',
    
    -- Status and metadata
    is_primary BOOLEAN DEFAULT false, -- Is this the main location?
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Constraints
    UNIQUE(institution_id, name),
    CONSTRAINT valid_coordinates CHECK (
        latitude BETWEEN -90 AND 90 AND 
        longitude BETWEEN -180 AND 180
    ),
    CONSTRAINT valid_radius CHECK (attendance_radius > 0 AND attendance_radius <= 5000)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_institution_locations_institution ON institution_locations(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_locations_coordinates ON institution_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_institution_locations_active ON institution_locations(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_institution_locations_primary ON institution_locations(institution_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_institution_locations_attendance ON institution_locations(is_attendance_enabled) WHERE is_attendance_enabled = true;

-- 3. Create spatial index for location queries (if PostGIS is available)
-- CREATE INDEX IF NOT EXISTS idx_institution_locations_spatial ON institution_locations USING GIST(ST_Point(longitude, latitude));

-- 4. Add triggers for updated_at
CREATE TRIGGER update_institution_locations_updated_at 
    BEFORE UPDATE ON institution_locations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Create function to ensure only one primary location per institution
CREATE OR REPLACE FUNCTION ensure_one_primary_location()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting this location as primary, unset all other primary locations for this institution
    IF NEW.is_primary = true THEN
        UPDATE institution_locations 
        SET is_primary = false 
        WHERE institution_id = NEW.institution_id 
        AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_one_primary_location
    BEFORE INSERT OR UPDATE ON institution_locations
    FOR EACH ROW
    EXECUTE FUNCTION ensure_one_primary_location();

-- 6. Create views for common queries
CREATE OR REPLACE VIEW active_institution_locations AS
SELECT 
    il.*,
    i.name as institution_name,
    i.type as institution_type
FROM institution_locations il
JOIN institutions i ON i.id = il.institution_id
WHERE il.is_active = true;

CREATE OR REPLACE VIEW primary_institution_locations AS
SELECT 
    il.*,
    i.name as institution_name
FROM institution_locations il
JOIN institutions i ON i.id = il.institution_id
WHERE il.is_primary = true AND il.is_active = true;

-- 7. Insert sample data for existing institutions
INSERT INTO institution_locations (
    institution_id, 
    name, 
    location_type,
    address, 
    city,
    state,
    country,
    latitude, 
    longitude, 
    attendance_radius,
    is_primary,
    operating_hours,
    working_days
)
SELECT 
    i.id,
    'Main Campus' as name,
    'campus' as location_type,
    COALESCE(i.address, 'Please update with actual address') as address,
    'Kuala Lumpur' as city,
    'Federal Territory of Kuala Lumpur' as state,
    'Malaysia' as country,
    CASE 
        WHEN i.name LIKE '%Malaya%' OR i.name LIKE '%University%' THEN 3.1211
        ELSE NULL -- Will need to be updated manually
    END as latitude,
    CASE 
        WHEN i.name LIKE '%Malaya%' OR i.name LIKE '%University%' THEN 101.6536
        ELSE NULL -- Will need to be updated manually
    END as longitude,
    500 as attendance_radius,
    true as is_primary,
    '{"start": "08:00", "end": "17:00", "lunch_start": "12:00", "lunch_end": "13:00"}' as operating_hours,
    ARRAY[1,2,3,4,5] as working_days
FROM institutions i
WHERE NOT EXISTS (
    SELECT 1 FROM institution_locations il WHERE il.institution_id = i.id
);

-- 8. Show results
SELECT 'Institution locations table created successfully!' as message;

SELECT 
    i.name as institution,
    il.name as location_name,
    il.location_type,
    il.address,
    il.latitude,
    il.longitude,
    il.attendance_radius,
    il.is_primary,
    il.is_active
FROM institutions i
LEFT JOIN institution_locations il ON il.institution_id = i.id
ORDER BY i.name, il.is_primary DESC, il.name;
