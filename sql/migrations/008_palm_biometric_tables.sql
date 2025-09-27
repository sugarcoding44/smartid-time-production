-- =====================================================
-- SmartID Palm Biometric System Tables
-- =====================================================
-- Migration 008: Palm biometric tables based on SDK structure
-- Based on Palm Scanner SDK 1.3.41 analysis
-- =====================================================

-- =====================================================
-- 1. PALM TEMPLATES TABLE
-- =====================================================
-- Stores processed palm vein template data
CREATE TABLE palm_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Palm identification
  hand_type VARCHAR NOT NULL CHECK (hand_type IN ('left', 'right')),
  template_version VARCHAR DEFAULT '1.3.41',
  
  -- Template data (encrypted/hashed for security)
  template_data BYTEA NOT NULL, -- Binary template from SDK
  template_hash VARCHAR UNIQUE NOT NULL, -- SHA-256 hash for quick matching
  feature_points JSONB, -- Extracted feature points for matching
  
  -- Quality metrics
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  capture_width INTEGER,
  capture_height INTEGER,
  roi_x INTEGER, -- Region of Interest coordinates
  roi_y INTEGER,
  roi_width INTEGER,
  roi_height INTEGER,
  
  -- Enrollment info
  device_id VARCHAR,
  enrolled_by UUID REFERENCES users(id),
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Status and lifecycle
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'replaced')),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Usage tracking
  last_used TIMESTAMP WITH TIME ZONE,
  verification_count INTEGER DEFAULT 0,
  false_accept_count INTEGER DEFAULT 0,
  false_reject_count INTEGER DEFAULT 0,
  
  -- Sync with HQ
  sync_status VARCHAR DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
  synced_to_hq_at TIMESTAMP WITH TIME ZONE,
  smartid_hq_template_id VARCHAR UNIQUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, hand_type, status) DEFERRABLE INITIALLY DEFERRED
);

-- =====================================================
-- 2. PALM ENROLLMENT SESSIONS
-- =====================================================
-- Track palm enrollment sessions with multiple captures
CREATE TABLE palm_enrollment_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES palm_templates(id) ON DELETE CASCADE,
  
  -- Session info
  session_token VARCHAR UNIQUE NOT NULL,
  hand_type VARCHAR NOT NULL CHECK (hand_type IN ('left', 'right')),
  enrollment_type VARCHAR NOT NULL CHECK (enrollment_type IN ('initial', 're-enrollment')),
  
  -- Capture requirements
  required_captures INTEGER DEFAULT 3,
  completed_captures INTEGER DEFAULT 0,
  min_quality_threshold INTEGER DEFAULT 70,
  
  -- Session status
  status VARCHAR DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'cancelled', 'expired')),
  
  -- Device and user info
  device_id VARCHAR,
  enrolled_by UUID REFERENCES users(id),
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 minutes'),
  
  -- Results
  final_quality_score INTEGER,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. PALM CAPTURE IMAGES
-- =====================================================
-- Store individual palm capture images during enrollment
CREATE TABLE palm_capture_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES palm_enrollment_sessions(id) ON DELETE CASCADE,
  template_id UUID REFERENCES palm_templates(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Capture sequence
  capture_sequence INTEGER NOT NULL,
  hand_type VARCHAR NOT NULL CHECK (hand_type IN ('left', 'right')),
  
  -- Image data
  raw_image BYTEA, -- Original raw image from scanner
  processed_image BYTEA, -- Processed image with enhancements
  thumbnail BYTEA, -- Small thumbnail for UI display
  
  -- Image metadata
  image_width INTEGER,
  image_height INTEGER,
  image_format VARCHAR DEFAULT 'BMP',
  file_size_bytes INTEGER,
  
  -- Capture quality
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  brightness_level INTEGER,
  contrast_level INTEGER,
  sharpness_score INTEGER,
  
  -- Processing results
  vein_pattern_detected BOOLEAN DEFAULT false,
  roi_extracted BOOLEAN DEFAULT false,
  features_extracted INTEGER DEFAULT 0,
  
  -- Capture info
  device_id VARCHAR,
  capture_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_duration_ms INTEGER,
  
  -- Status
  is_used_for_template BOOLEAN DEFAULT false,
  processing_status VARCHAR DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processed', 'failed', 'skipped')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. PALM VERIFICATION LOGS
-- =====================================================
-- Log all palm verification attempts
CREATE TABLE palm_verification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL if verification failed
  template_id UUID REFERENCES palm_templates(id) ON DELETE SET NULL,
  
  -- Verification attempt
  verification_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hand_type VARCHAR CHECK (hand_type IN ('left', 'right')),
  device_id VARCHAR,
  
  -- Verification results
  verification_result VARCHAR NOT NULL CHECK (verification_result IN ('success', 'failed', 'timeout', 'error')),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  match_threshold INTEGER DEFAULT 80,
  
  -- Template matching details
  templates_compared INTEGER DEFAULT 0,
  best_match_score INTEGER,
  processing_time_ms INTEGER,
  
  -- Context
  verification_purpose VARCHAR CHECK (verification_purpose IN ('attendance', 'pos_payment', 'access_control', 'enrollment_verification')),
  system_source VARCHAR CHECK (system_source IN ('attendance_device', 'pos_terminal', 'palm_management', 'mobile_app')),
  
  -- Additional data
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR, -- Link to application session if available
  transaction_id UUID, -- Link to POS transaction if applicable
  
  -- Error information
  error_code VARCHAR,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. PALM DEVICE CALIBRATION
-- =====================================================
-- Store device-specific calibration data
CREATE TABLE palm_device_calibration (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id VARCHAR UNIQUE NOT NULL,
  
  -- Calibration parameters
  brightness_adjustment INTEGER DEFAULT 0,
  contrast_adjustment INTEGER DEFAULT 0,
  capture_timeout_ms INTEGER DEFAULT 5000,
  quality_threshold INTEGER DEFAULT 70,
  
  -- ROI settings
  default_roi_x INTEGER,
  default_roi_y INTEGER,
  default_roi_width INTEGER,
  default_roi_height INTEGER,
  
  -- Scanner hardware info
  scanner_model VARCHAR,
  firmware_version VARCHAR,
  sdk_version VARCHAR DEFAULT '1.3.41',
  
  -- Calibration status
  last_calibrated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  calibrated_by UUID REFERENCES users(id),
  calibration_status VARCHAR DEFAULT 'active' CHECK (calibration_status IN ('active', 'needs_recalibration', 'failed')),
  
  -- Performance metrics
  average_capture_time_ms INTEGER,
  success_rate DECIMAL(5,2), -- Percentage
  false_accept_rate DECIMAL(5,4), -- Very low percentage
  false_reject_rate DECIMAL(5,2), -- Percentage
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. PALM SYSTEM CONFIG
-- =====================================================
-- System-wide palm biometric configuration
CREATE TABLE palm_system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- Global settings
  enrollment_enabled BOOLEAN DEFAULT true,
  verification_enabled BOOLEAN DEFAULT true,
  re_enrollment_enabled BOOLEAN DEFAULT true,
  
  -- Quality requirements
  min_enrollment_quality INTEGER DEFAULT 80,
  min_verification_quality INTEGER DEFAULT 70,
  required_enrollment_captures INTEGER DEFAULT 3,
  
  -- Security settings
  template_encryption_enabled BOOLEAN DEFAULT true,
  template_expiry_days INTEGER DEFAULT 365,
  max_verification_attempts INTEGER DEFAULT 3,
  lockout_duration_minutes INTEGER DEFAULT 15,
  
  -- Performance settings
  max_templates_per_user INTEGER DEFAULT 2, -- left and right hand
  template_matching_timeout_ms INTEGER DEFAULT 3000,
  concurrent_verifications_limit INTEGER DEFAULT 10,
  
  -- Sync settings
  auto_sync_to_hq BOOLEAN DEFAULT true,
  sync_interval_hours INTEGER DEFAULT 24,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(institution_id)
);

-- =====================================================
-- ADD PALM-SPECIFIC COLUMNS TO USERS TABLE
-- =====================================================
-- Add palm biometric status fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS palm_enrollment_status VARCHAR DEFAULT 'not_enrolled' 
  CHECK (palm_enrollment_status IN ('not_enrolled', 'enrolling', 'enrolled', 'needs_re_enrollment', 'disabled'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS palm_enrolled_hands VARCHAR[] DEFAULT '{}'; -- ['left', 'right']

ALTER TABLE users ADD COLUMN IF NOT EXISTS palm_last_enrollment TIMESTAMP WITH TIME ZONE;

ALTER TABLE users ADD COLUMN IF NOT EXISTS palm_enrollment_expires TIMESTAMP WITH TIME ZONE;

ALTER TABLE users ADD COLUMN IF NOT EXISTS palm_verification_failures INTEGER DEFAULT 0;

ALTER TABLE users ADD COLUMN IF NOT EXISTS palm_locked_until TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_palm_templates_updated_at BEFORE UPDATE ON palm_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_palm_enrollment_sessions_updated_at BEFORE UPDATE ON palm_enrollment_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_palm_device_calibration_updated_at BEFORE UPDATE ON palm_device_calibration FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_palm_system_config_updated_at BEFORE UPDATE ON palm_system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_palm_templates_user_hand ON palm_templates(user_id, hand_type, status);
CREATE INDEX idx_palm_templates_hash ON palm_templates(template_hash);
CREATE INDEX idx_palm_templates_quality ON palm_templates(quality_score);
CREATE INDEX idx_palm_templates_sync_status ON palm_templates(sync_status);

CREATE INDEX idx_palm_enrollment_sessions_user ON palm_enrollment_sessions(user_id, status);
CREATE INDEX idx_palm_enrollment_sessions_token ON palm_enrollment_sessions(session_token);
CREATE INDEX idx_palm_enrollment_sessions_device ON palm_enrollment_sessions(device_id, status);

CREATE INDEX idx_palm_capture_images_session ON palm_capture_images(session_id, capture_sequence);
CREATE INDEX idx_palm_capture_images_quality ON palm_capture_images(quality_score);

CREATE INDEX idx_palm_verification_logs_user ON palm_verification_logs(user_id, verification_timestamp);
CREATE INDEX idx_palm_verification_logs_device ON palm_verification_logs(device_id, verification_timestamp);
CREATE INDEX idx_palm_verification_logs_result ON palm_verification_logs(verification_result, verification_timestamp);

CREATE INDEX idx_users_palm_status ON users(palm_enrollment_status);
CREATE INDEX idx_users_palm_hands ON users USING GIN(palm_enrolled_hands);

-- =====================================================
-- SAMPLE PALM SYSTEM CONFIG
-- =====================================================
-- Insert default palm system configuration
-- This will be institution-specific in production
INSERT INTO palm_system_config (
  institution_id,
  enrollment_enabled,
  verification_enabled,
  re_enrollment_enabled,
  min_enrollment_quality,
  min_verification_quality,
  required_enrollment_captures,
  template_encryption_enabled,
  template_expiry_days,
  max_verification_attempts,
  lockout_duration_minutes,
  max_templates_per_user,
  template_matching_timeout_ms,
  concurrent_verifications_limit,
  auto_sync_to_hq,
  sync_interval_hours
)
SELECT 
  id as institution_id,
  true as enrollment_enabled,
  true as verification_enabled,
  true as re_enrollment_enabled,
  80 as min_enrollment_quality,
  70 as min_verification_quality,
  3 as required_enrollment_captures,
  true as template_encryption_enabled,
  365 as template_expiry_days,
  3 as max_verification_attempts,
  15 as lockout_duration_minutes,
  2 as max_templates_per_user,
  3000 as template_matching_timeout_ms,
  10 as concurrent_verifications_limit,
  true as auto_sync_to_hq,
  24 as sync_interval_hours
FROM institutions
ON CONFLICT (institution_id) DO NOTHING;
