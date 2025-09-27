-- =====================================================
-- SmartID HUB Premium Features - Advanced Attendance & Leave Management
-- =====================================================
-- This migration adds premium attendance features including:
-- - Custom work groups with flexible schedules
-- - Holiday management
-- - Advanced leave management system
-- - Leave quotas and approval workflows
-- =====================================================

-- =====================================================
-- 1. WORK GROUPS (Custom user groups with schedules)
-- =====================================================
CREATE TABLE work_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL, -- Custom name set by admin (e.g., "Morning Teachers", "Admin Staff")
  description TEXT,
  
  -- Working hours configuration
  default_start_time TIME NOT NULL DEFAULT '08:00:00',
  default_end_time TIME NOT NULL DEFAULT '17:00:00',
  break_start_time TIME,
  break_end_time TIME,
  break_duration_minutes INTEGER DEFAULT 60,
  
  -- Working days (1=Monday, 7=Sunday)
  working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- Default Mon-Fri
  
  -- Attendance rules
  late_threshold_minutes INTEGER DEFAULT 15, -- Late if arrive after this many minutes
  early_leave_threshold_minutes INTEGER DEFAULT 30, -- Early leave if leave before this many minutes
  minimum_working_hours DECIMAL(4,2) DEFAULT 8.0, -- Minimum hours per day
  
  -- Overtime rules
  overtime_threshold_hours DECIMAL(4,2) DEFAULT 8.0,
  overtime_rate_multiplier DECIMAL(3,2) DEFAULT 1.5,
  
  -- Status and audit
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(institution_id, name)
);

-- =====================================================
-- 2. USER WORK GROUP ASSIGNMENTS
-- =====================================================
CREATE TABLE user_work_group_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  work_group_id UUID REFERENCES work_groups(id) ON DELETE CASCADE,
  
  -- Override work group settings for specific users if needed
  custom_start_time TIME,
  custom_end_time TIME,
  custom_working_days INTEGER[],
  custom_minimum_hours DECIMAL(4,2),
  
  -- Assignment period
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE, -- NULL means indefinite
  
  is_active BOOLEAN DEFAULT true,
  assigned_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, work_group_id, effective_from)
);

-- =====================================================
-- 3. INSTITUTION HOLIDAYS
-- =====================================================
CREATE TABLE institution_holidays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  
  name VARCHAR NOT NULL, -- e.g., "Chinese New Year", "Hari Raya", "School Sports Day"
  description TEXT,
  holiday_date DATE NOT NULL,
  holiday_type VARCHAR DEFAULT 'public' CHECK (holiday_type IN ('public', 'school', 'custom')),
  
  -- Multi-day holidays
  end_date DATE, -- For holidays spanning multiple days
  
  -- Affected groups (if NULL, applies to all)
  affected_work_groups UUID[], -- Array of work group IDs, NULL means all groups
  
  -- Holiday rules
  is_working_day BOOLEAN DEFAULT false, -- If true, some people still work
  is_paid BOOLEAN DEFAULT true, -- If false, affects salary calculation
  
  -- Recurring holidays (for annual events)
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR, -- 'yearly', 'monthly', etc.
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(institution_id, holiday_date, name)
);

-- =====================================================
-- 4. LEAVE TYPES (Customizable by institution)
-- =====================================================
CREATE TABLE leave_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
  
  name VARCHAR NOT NULL, -- e.g., "Annual Leave", "Sick Leave", "Maternity Leave"
  code VARCHAR NOT NULL, -- Short code like "AL", "SL", "ML"
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for calendar display
  
  -- Leave rules
  is_paid BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT true,
  requires_medical_certificate BOOLEAN DEFAULT false,
  max_consecutive_days INTEGER, -- Maximum consecutive days allowed
  min_advance_notice_days INTEGER DEFAULT 1, -- How many days in advance to apply
  
  -- Quota rules (per year)
  has_annual_quota BOOLEAN DEFAULT true,
  default_quota_days DECIMAL(4,1) DEFAULT 14.0, -- Default annual quota
  quota_calculation_method VARCHAR DEFAULT 'yearly' CHECK (quota_calculation_method IN ('yearly', 'monthly', 'service_based')),
  
  -- Carry forward rules
  allow_carry_forward BOOLEAN DEFAULT false,
  max_carry_forward_days DECIMAL(4,1) DEFAULT 5.0,
  carry_forward_expiry_months INTEGER DEFAULT 3, -- Carried leave expires after N months
  
  -- Proration (for new employees)
  is_prorated BOOLEAN DEFAULT true, -- Prorate quota based on join date
  
  -- System leaves (cannot be deleted)
  is_system_default BOOLEAN DEFAULT false,
  
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(institution_id, code)
);

-- =====================================================
-- 5. USER LEAVE QUOTAS (Individual quotas per user per year)
-- =====================================================
CREATE TABLE user_leave_quotas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
  
  -- Quota period (typically yearly)
  quota_year INTEGER NOT NULL,
  allocated_days DECIMAL(4,1) NOT NULL, -- Total allocated for the year
  used_days DECIMAL(4,1) DEFAULT 0.0, -- Days already used
  pending_days DECIMAL(4,1) DEFAULT 0.0, -- Days in pending applications
  available_days DECIMAL(4,1) GENERATED ALWAYS AS (allocated_days - used_days - pending_days) STORED,
  
  -- Carry forward from previous year
  carried_forward_days DECIMAL(4,1) DEFAULT 0.0,
  carry_forward_expiry_date DATE,
  
  -- Override default settings for specific users
  custom_max_consecutive_days INTEGER,
  custom_advance_notice_days INTEGER,
  
  -- Audit fields
  last_updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, leave_type_id, quota_year)
);

-- =====================================================
-- 6. LEAVE APPLICATIONS
-- =====================================================
CREATE TABLE leave_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_number VARCHAR UNIQUE NOT NULL, -- Auto-generated: LA2024001, etc.
  
  -- Applicant details
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(id) ON DELETE RESTRICT,
  
  -- Leave period
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days DECIMAL(4,1) NOT NULL, -- Calculated based on working days
  half_day_start BOOLEAN DEFAULT false, -- Half day on start date
  half_day_end BOOLEAN DEFAULT false, -- Half day on end date
  
  -- Application details
  reason TEXT NOT NULL,
  emergency_contact JSONB, -- Contact person during leave
  handover_notes TEXT,
  medical_certificate_url TEXT, -- If required
  supporting_documents_urls TEXT[], -- Additional documents
  
  -- Approval workflow
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'withdrawn')),
  current_approver_id UUID REFERENCES users(id),
  approval_level INTEGER DEFAULT 1, -- For multi-level approval
  
  -- Dates
  applied_date DATE DEFAULT CURRENT_DATE,
  approved_date DATE,
  rejected_date DATE,
  
  -- Comments and feedback
  approval_comments TEXT,
  rejection_reason TEXT,
  hr_notes TEXT, -- Internal HR notes
  
  -- System fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. LEAVE APPROVAL WORKFLOW
-- =====================================================
CREATE TABLE leave_approval_workflow (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  leave_application_id UUID REFERENCES leave_applications(id) ON DELETE CASCADE,
  
  -- Workflow step
  approval_level INTEGER NOT NULL,
  approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  approver_role VARCHAR, -- 'supervisor', 'hr', 'admin', etc.
  
  -- Decision
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'delegated')),
  decision_date TIMESTAMP WITH TIME ZONE,
  comments TEXT,
  
  -- Delegation (if approver delegates to someone else)
  delegated_to_id UUID REFERENCES users(id),
  delegation_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. UPDATED ATTENDANCE RECORDS (Enhanced for premium features)
-- =====================================================
-- Add new columns to existing attendance_records table
ALTER TABLE attendance_records 
ADD COLUMN work_group_id UUID REFERENCES work_groups(id),
ADD COLUMN scheduled_start_time TIME,
ADD COLUMN scheduled_end_time TIME,
ADD COLUMN actual_working_hours DECIMAL(4,2),
ADD COLUMN overtime_hours DECIMAL(4,2) DEFAULT 0.0,
ADD COLUMN break_start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN break_end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN break_duration_minutes INTEGER DEFAULT 0,
ADD COLUMN is_holiday BOOLEAN DEFAULT false,
ADD COLUMN holiday_id UUID REFERENCES institution_holidays(id),
ADD COLUMN attendance_type VARCHAR DEFAULT 'normal' CHECK (attendance_type IN ('normal', 'overtime', 'holiday', 'leave')),
ADD COLUMN auto_calculated BOOLEAN DEFAULT true, -- If calculated by system or manually entered
ADD COLUMN manager_override BOOLEAN DEFAULT false, -- If manager manually adjusted
ADD COLUMN override_reason TEXT,
ADD COLUMN override_by UUID REFERENCES users(id);

-- =====================================================
-- 9. LEAVE BALANCE HISTORY (Track quota changes)
-- =====================================================
CREATE TABLE leave_balance_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES leave_types(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_type VARCHAR NOT NULL CHECK (transaction_type IN ('allocation', 'usage', 'adjustment', 'carry_forward', 'expiry')),
  days_change DECIMAL(4,1) NOT NULL, -- Positive for add, negative for deduct
  balance_before DECIMAL(4,1) NOT NULL,
  balance_after DECIMAL(4,1) NOT NULL,
  
  -- Reference
  reference_type VARCHAR, -- 'leave_application', 'manual_adjustment', 'annual_allocation'
  reference_id UUID, -- ID of leave application or other reference
  
  -- Details
  description TEXT,
  processed_by UUID REFERENCES users(id),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Work Groups
CREATE INDEX idx_work_groups_institution_id ON work_groups(institution_id);
CREATE INDEX idx_work_groups_is_active ON work_groups(is_active);

-- User Work Group Assignments
CREATE INDEX idx_user_work_group_assignments_user_id ON user_work_group_assignments(user_id);
CREATE INDEX idx_user_work_group_assignments_work_group_id ON user_work_group_assignments(work_group_id);
CREATE INDEX idx_user_work_group_assignments_effective_dates ON user_work_group_assignments(effective_from, effective_to);
CREATE INDEX idx_user_work_group_assignments_active ON user_work_group_assignments(is_active) WHERE is_active = true;

-- Holidays
CREATE INDEX idx_institution_holidays_institution_id ON institution_holidays(institution_id);
CREATE INDEX idx_institution_holidays_date ON institution_holidays(holiday_date);
CREATE INDEX idx_institution_holidays_date_range ON institution_holidays(holiday_date, end_date);
CREATE INDEX idx_institution_holidays_type ON institution_holidays(holiday_type);

-- Leave Types
CREATE INDEX idx_leave_types_institution_id ON leave_types(institution_id);
CREATE INDEX idx_leave_types_is_active ON leave_types(is_active);
CREATE INDEX idx_leave_types_code ON leave_types(code);

-- User Leave Quotas
CREATE INDEX idx_user_leave_quotas_user_id ON user_leave_quotas(user_id);
CREATE INDEX idx_user_leave_quotas_leave_type_id ON user_leave_quotas(leave_type_id);
CREATE INDEX idx_user_leave_quotas_quota_year ON user_leave_quotas(quota_year);
CREATE INDEX idx_user_leave_quotas_user_year ON user_leave_quotas(user_id, quota_year);

-- Leave Applications
CREATE INDEX idx_leave_applications_user_id ON leave_applications(user_id);
CREATE INDEX idx_leave_applications_leave_type_id ON leave_applications(leave_type_id);
CREATE INDEX idx_leave_applications_status ON leave_applications(status);
CREATE INDEX idx_leave_applications_dates ON leave_applications(start_date, end_date);
CREATE INDEX idx_leave_applications_approver ON leave_applications(current_approver_id) WHERE current_approver_id IS NOT NULL;
CREATE INDEX idx_leave_applications_applied_date ON leave_applications(applied_date);

-- Leave Approval Workflow
CREATE INDEX idx_leave_approval_workflow_application_id ON leave_approval_workflow(leave_application_id);
CREATE INDEX idx_leave_approval_workflow_approver ON leave_approval_workflow(approver_id);
CREATE INDEX idx_leave_approval_workflow_status ON leave_approval_workflow(status);

-- Enhanced Attendance Records
CREATE INDEX idx_attendance_records_work_group ON attendance_records(work_group_id) WHERE work_group_id IS NOT NULL;
CREATE INDEX idx_attendance_records_is_holiday ON attendance_records(is_holiday);
CREATE INDEX idx_attendance_records_attendance_type ON attendance_records(attendance_type);
CREATE INDEX idx_attendance_records_overtime ON attendance_records(overtime_hours) WHERE overtime_hours > 0;

-- Leave Balance History
CREATE INDEX idx_leave_balance_history_user_id ON leave_balance_history(user_id);
CREATE INDEX idx_leave_balance_history_leave_type_id ON leave_balance_history(leave_type_id);
CREATE INDEX idx_leave_balance_history_transaction_type ON leave_balance_history(transaction_type);
CREATE INDEX idx_leave_balance_history_processed_at ON leave_balance_history(processed_at);
CREATE INDEX idx_leave_balance_history_reference ON leave_balance_history(reference_type, reference_id) WHERE reference_id IS NOT NULL;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE TRIGGER update_work_groups_updated_at BEFORE UPDATE ON work_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_work_group_assignments_updated_at BEFORE UPDATE ON user_work_group_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_institution_holidays_updated_at BEFORE UPDATE ON institution_holidays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_types_updated_at BEFORE UPDATE ON leave_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_leave_quotas_updated_at BEFORE UPDATE ON user_leave_quotas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_applications_updated_at BEFORE UPDATE ON leave_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
