-- =====================================================
-- Premium Attendance & Leave Management Functions
-- =====================================================
-- These functions support advanced attendance tracking and leave management
-- for SmartID HUB Premium subscribers
-- =====================================================

-- =====================================================
-- WORK GROUP MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to get user's current work group settings
CREATE OR REPLACE FUNCTION get_user_work_schedule(
  user_id_param UUID,
  check_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  work_group_id UUID,
  work_group_name VARCHAR,
  start_time TIME,
  end_time TIME,
  working_days INTEGER[],
  minimum_hours DECIMAL,
  late_threshold_minutes INTEGER,
  early_leave_threshold_minutes INTEGER,
  is_working_day BOOLEAN
) AS $$
DECLARE
  user_assignment RECORD;
  group_settings RECORD;
BEGIN
  -- Get user's current work group assignment
  SELECT * INTO user_assignment
  FROM user_work_group_assignments uwga
  WHERE uwga.user_id = user_id_param
    AND uwga.is_active = true
    AND uwga.effective_from <= check_date
    AND (uwga.effective_to IS NULL OR uwga.effective_to >= check_date)
  ORDER BY uwga.effective_from DESC
  LIMIT 1;
  
  IF user_assignment.id IS NULL THEN
    -- No work group assigned, return default schedule
    RETURN QUERY
    SELECT 
      NULL::UUID,
      'Default'::VARCHAR,
      '08:00:00'::TIME,
      '17:00:00'::TIME,
      ARRAY[1,2,3,4,5]::INTEGER[],
      8.0::DECIMAL,
      15::INTEGER,
      30::INTEGER,
      EXTRACT(dow FROM check_date)::INTEGER BETWEEN 1 AND 5;
    RETURN;
  END IF;
  
  -- Get work group settings
  SELECT * INTO group_settings
  FROM work_groups wg
  WHERE wg.id = user_assignment.work_group_id;
  
  RETURN QUERY
  SELECT 
    group_settings.id,
    group_settings.name,
    COALESCE(user_assignment.custom_start_time, group_settings.default_start_time),
    COALESCE(user_assignment.custom_end_time, group_settings.default_end_time),
    COALESCE(user_assignment.custom_working_days, group_settings.working_days),
    COALESCE(user_assignment.custom_minimum_hours, group_settings.minimum_working_hours),
    group_settings.late_threshold_minutes,
    group_settings.early_leave_threshold_minutes,
    EXTRACT(dow FROM check_date)::INTEGER = ANY(COALESCE(user_assignment.custom_working_days, group_settings.working_days));
END;
$$ LANGUAGE plpgsql;

-- Function to check if a date is a holiday for specific user/institution
CREATE OR REPLACE FUNCTION is_holiday(
  institution_id_param UUID,
  check_date DATE,
  work_group_id_param UUID DEFAULT NULL
)
RETURNS TABLE (
  is_holiday_day BOOLEAN,
  holiday_name VARCHAR,
  holiday_type VARCHAR,
  is_working_day BOOLEAN
) AS $$
DECLARE
  holiday_record RECORD;
BEGIN
  SELECT * INTO holiday_record
  FROM institution_holidays ih
  WHERE ih.institution_id = institution_id_param
    AND ih.holiday_date <= check_date
    AND (ih.end_date IS NULL OR ih.end_date >= check_date)
    AND (
      ih.affected_work_groups IS NULL OR 
      work_group_id_param = ANY(ih.affected_work_groups)
    )
  LIMIT 1;
  
  IF holiday_record.id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      true,
      holiday_record.name,
      holiday_record.holiday_type,
      holiday_record.is_working_day;
  ELSE
    RETURN QUERY
    SELECT 
      false,
      NULL::VARCHAR,
      NULL::VARCHAR,
      false;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ENHANCED ATTENDANCE FUNCTIONS
-- =====================================================

-- Enhanced attendance recording with work group rules
CREATE OR REPLACE FUNCTION record_premium_attendance(
  user_id_param UUID,
  verification_method_param VARCHAR,
  device_id_param VARCHAR DEFAULT NULL,
  location_param VARCHAR DEFAULT NULL,
  force_override BOOLEAN DEFAULT false
)
RETURNS TABLE (
  attendance_id UUID,
  status VARCHAR,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  message TEXT,
  working_hours DECIMAL,
  overtime_hours DECIMAL,
  is_late BOOLEAN,
  is_early_leave BOOLEAN
) AS $$
DECLARE
  existing_record attendance_records%ROWTYPE;
  new_record attendance_records%ROWTYPE;
  user_institution_id UUID;
  work_schedule RECORD;
  holiday_info RECORD;
  current_time TIMESTAMP WITH TIME ZONE := NOW();
  current_date_only DATE := CURRENT_DATE;
  calculated_status VARCHAR;
  calculated_hours DECIMAL := 0.0;
  calculated_overtime DECIMAL := 0.0;
  is_late_flag BOOLEAN := false;
  is_early_flag BOOLEAN := false;
  message_text TEXT;
BEGIN
  -- Get user's institution
  SELECT institution_id INTO user_institution_id
  FROM users WHERE id = user_id_param;
  
  -- Get user's work schedule for today
  SELECT * INTO work_schedule
  FROM get_user_work_schedule(user_id_param, current_date_only)
  LIMIT 1;
  
  -- Check if today is a holiday
  SELECT * INTO holiday_info
  FROM is_holiday(user_institution_id, current_date_only, work_schedule.work_group_id)
  LIMIT 1;
  
  -- Check for existing record today
  SELECT * INTO existing_record
  FROM attendance_records
  WHERE user_id = user_id_param 
    AND date = current_date_only;
  
  IF existing_record.id IS NOT NULL THEN
    -- Handle check-out
    IF existing_record.check_out_time IS NULL THEN
      -- Calculate working hours
      calculated_hours := EXTRACT(EPOCH FROM (current_time - existing_record.check_in_time)) / 3600.0;
      
      -- Subtract break time if applicable
      IF existing_record.break_start_time IS NOT NULL AND existing_record.break_end_time IS NOT NULL THEN
        calculated_hours := calculated_hours - (existing_record.break_duration_minutes / 60.0);
      END IF;
      
      -- Check for early leave
      IF work_schedule.is_working_day AND NOT holiday_info.is_holiday_day THEN
        IF current_time < (current_date_only + work_schedule.end_time - (work_schedule.early_leave_threshold_minutes || ' minutes')::INTERVAL) THEN
          is_early_flag := true;
        END IF;
        
        -- Calculate overtime
        IF calculated_hours > work_schedule.minimum_hours THEN
          calculated_overtime := calculated_hours - work_schedule.minimum_hours;
        END IF;
      END IF;
      
      UPDATE attendance_records
      SET 
        check_out_time = current_time,
        actual_working_hours = calculated_hours,
        overtime_hours = calculated_overtime,
        updated_at = current_time
      WHERE id = existing_record.id
      RETURNING * INTO new_record;
      
      message_text := CASE 
        WHEN is_early_flag THEN 'Early check-out recorded'
        WHEN calculated_overtime > 0 THEN 'Check-out recorded with overtime: ' || calculated_overtime::TEXT || ' hours'
        ELSE 'Check-out recorded successfully'
      END;
      
      RETURN QUERY
      SELECT 
        new_record.id,
        new_record.status,
        new_record.check_in_time,
        new_record.check_out_time,
        message_text,
        calculated_hours,
        calculated_overtime,
        false, -- not applicable for check-out
        is_early_flag;
    ELSE
      -- Already checked out
      RETURN QUERY
      SELECT 
        existing_record.id,
        existing_record.status,
        existing_record.check_in_time,
        existing_record.check_out_time,
        'Already checked out for today'::TEXT,
        COALESCE(existing_record.actual_working_hours, 0.0),
        COALESCE(existing_record.overtime_hours, 0.0),
        false,
        false;
    END IF;
  ELSE
    -- Handle check-in
    calculated_status := 'present';
    
    -- Check if it's a holiday
    IF holiday_info.is_holiday_day THEN
      calculated_status := 'present'; -- Present on holiday
    ELSIF work_schedule.is_working_day THEN
      -- Check for late arrival
      IF current_time > (current_date_only + work_schedule.start_time + (work_schedule.late_threshold_minutes || ' minutes')::INTERVAL) THEN
        calculated_status := 'late';
        is_late_flag := true;
      END IF;
    ELSE
      -- Working on non-working day (overtime/special work)
      calculated_status := 'present';
    END IF;
    
    INSERT INTO attendance_records (
      user_id,
      institution_id,
      work_group_id,
      check_in_time,
      date,
      status,
      verification_method,
      device_id,
      location,
      scheduled_start_time,
      scheduled_end_time,
      is_holiday,
      holiday_id,
      attendance_type,
      auto_calculated
    ) VALUES (
      user_id_param,
      user_institution_id,
      work_schedule.work_group_id,
      current_time,
      current_date_only,
      calculated_status,
      verification_method_param,
      device_id_param,
      location_param,
      work_schedule.start_time,
      work_schedule.end_time,
      COALESCE(holiday_info.is_holiday_day, false),
      NULL, -- holiday_id to be implemented
      CASE 
        WHEN holiday_info.is_holiday_day THEN 'holiday'
        WHEN NOT work_schedule.is_working_day THEN 'overtime'
        ELSE 'normal'
      END,
      NOT force_override
    )
    RETURNING * INTO new_record;
    
    message_text := CASE 
      WHEN holiday_info.is_holiday_day THEN 'Check-in recorded on holiday: ' || holiday_info.holiday_name
      WHEN is_late_flag THEN 'Late check-in recorded'
      WHEN NOT work_schedule.is_working_day THEN 'Check-in recorded on non-working day'
      ELSE 'Check-in recorded successfully'
    END;
    
    RETURN QUERY
    SELECT 
      new_record.id,
      new_record.status,
      new_record.check_in_time,
      NULL::TIMESTAMP WITH TIME ZONE, -- no check-out yet
      message_text,
      0.0::DECIMAL, -- no hours calculated yet
      0.0::DECIMAL, -- no overtime yet
      is_late_flag,
      false; -- no early leave on check-in
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- LEAVE MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to generate leave application number
CREATE OR REPLACE FUNCTION generate_leave_application_number(institution_id_param UUID)
RETURNS VARCHAR AS $$
DECLARE
  institution_code VARCHAR;
  year_code VARCHAR;
  sequence_num INTEGER;
  application_num VARCHAR;
BEGIN
  -- Get institution code
  SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z]', '', 'g'), 3))
  INTO institution_code
  FROM institutions 
  WHERE id = institution_id_param;
  
  -- Get year code
  year_code := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Get next sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(application_number FROM '\d+$') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM leave_applications la
  JOIN users u ON la.user_id = u.id
  WHERE u.institution_id = institution_id_param 
    AND EXTRACT(YEAR FROM la.applied_date) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Format: LA-[INSTITUTION][YEAR][SEQUENCE] (e.g., LA-SKT2024001)
  application_num := 'LA-' || institution_code || year_code || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN application_num;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate working days between dates (excluding weekends and holidays)
CREATE OR REPLACE FUNCTION calculate_leave_working_days(
  institution_id_param UUID,
  work_group_id_param UUID,
  start_date_param DATE,
  end_date_param DATE,
  half_day_start BOOLEAN DEFAULT false,
  half_day_end BOOLEAN DEFAULT false
)
RETURNS DECIMAL AS $$
DECLARE
  working_days DECIMAL := 0.0;
  current_date_loop DATE := start_date_param;
  work_schedule RECORD;
  holiday_info RECORD;
BEGIN
  WHILE current_date_loop <= end_date_param LOOP
    -- Get work schedule for this date (using a dummy user_id or work group directly)
    SELECT working_days as group_working_days
    INTO work_schedule
    FROM work_groups
    WHERE id = work_group_id_param;
    
    -- Check if it's a working day based on work group schedule
    IF EXTRACT(dow FROM current_date_loop)::INTEGER = ANY(work_schedule.group_working_days) THEN
      -- Check if it's a holiday
      SELECT * INTO holiday_info
      FROM is_holiday(institution_id_param, current_date_loop, work_group_id_param)
      LIMIT 1;
      
      IF NOT COALESCE(holiday_info.is_holiday_day, false) THEN
        -- It's a working day
        IF current_date_loop = start_date_param AND half_day_start THEN
          working_days := working_days + 0.5;
        ELSIF current_date_loop = end_date_param AND half_day_end THEN
          working_days := working_days + 0.5;
        ELSE
          working_days := working_days + 1.0;
        END IF;
      END IF;
    END IF;
    
    current_date_loop := current_date_loop + 1;
  END LOOP;
  
  RETURN working_days;
END;
$$ LANGUAGE plpgsql;

-- Function to check leave quota availability
CREATE OR REPLACE FUNCTION check_leave_quota_availability(
  user_id_param UUID,
  leave_type_id_param UUID,
  requested_days DECIMAL,
  quota_year_param INTEGER DEFAULT NULL
)
RETURNS TABLE (
  has_sufficient_quota BOOLEAN,
  available_days DECIMAL,
  allocated_days DECIMAL,
  used_days DECIMAL,
  pending_days DECIMAL,
  message TEXT
) AS $$
DECLARE
  quota_year_to_check INTEGER;
  quota_record RECORD;
BEGIN
  quota_year_to_check := COALESCE(quota_year_param, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER);
  
  -- Get user's quota for the leave type
  SELECT * INTO quota_record
  FROM user_leave_quotas
  WHERE user_id = user_id_param
    AND leave_type_id = leave_type_id_param
    AND quota_year = quota_year_to_check;
  
  IF quota_record.id IS NULL THEN
    -- No quota found, create one based on leave type defaults
    INSERT INTO user_leave_quotas (
      user_id,
      leave_type_id,
      quota_year,
      allocated_days
    )
    SELECT 
      user_id_param,
      leave_type_id_param,
      quota_year_to_check,
      lt.default_quota_days
    FROM leave_types lt
    WHERE lt.id = leave_type_id_param
    RETURNING * INTO quota_record;
  END IF;
  
  -- Check availability
  RETURN QUERY
  SELECT 
    quota_record.available_days >= requested_days,
    quota_record.available_days,
    quota_record.allocated_days,
    quota_record.used_days,
    quota_record.pending_days,
    CASE 
      WHEN quota_record.available_days >= requested_days THEN 'Sufficient quota available'
      ELSE 'Insufficient quota. Available: ' || quota_record.available_days::TEXT || ' days, Requested: ' || requested_days::TEXT || ' days'
    END;
END;
$$ LANGUAGE plpgsql;

-- Function to apply for leave
CREATE OR REPLACE FUNCTION apply_for_leave(
  user_id_param UUID,
  leave_type_id_param UUID,
  start_date_param DATE,
  end_date_param DATE,
  reason_param TEXT,
  half_day_start_param BOOLEAN DEFAULT false,
  half_day_end_param BOOLEAN DEFAULT false,
  emergency_contact_param JSONB DEFAULT NULL,
  medical_certificate_url_param TEXT DEFAULT NULL
)
RETURNS TABLE (
  application_id UUID,
  application_number VARCHAR,
  total_days DECIMAL,
  status VARCHAR,
  message TEXT,
  success BOOLEAN
) AS $$
DECLARE
  user_record RECORD;
  leave_type_record RECORD;
  work_schedule RECORD;
  quota_check RECORD;
  calculated_days DECIMAL;
  application_num VARCHAR;
  new_application RECORD;
BEGIN
  -- Get user details
  SELECT * INTO user_record
  FROM users u
  WHERE u.id = user_id_param;
  
  IF user_record.id IS NULL THEN
    RETURN QUERY
    SELECT NULL::UUID, NULL::VARCHAR, 0.0::DECIMAL, 'error'::VARCHAR, 'User not found'::TEXT, false;
    RETURN;
  END IF;
  
  -- Get leave type details
  SELECT * INTO leave_type_record
  FROM leave_types lt
  WHERE lt.id = leave_type_id_param
    AND lt.institution_id = user_record.institution_id
    AND lt.is_active = true;
  
  IF leave_type_record.id IS NULL THEN
    RETURN QUERY
    SELECT NULL::UUID, NULL::VARCHAR, 0.0::DECIMAL, 'error'::VARCHAR, 'Leave type not found or inactive'::TEXT, false;
    RETURN;
  END IF;
  
  -- Validate dates
  IF start_date_param > end_date_param THEN
    RETURN QUERY
    SELECT NULL::UUID, NULL::VARCHAR, 0.0::DECIMAL, 'error'::VARCHAR, 'Start date cannot be after end date'::TEXT, false;
    RETURN;
  END IF;
  
  -- Check advance notice requirement
  IF start_date_param <= (CURRENT_DATE + (leave_type_record.min_advance_notice_days || ' days')::INTERVAL) THEN
    RETURN QUERY
    SELECT NULL::UUID, NULL::VARCHAR, 0.0::DECIMAL, 'error'::VARCHAR, 
           'Leave must be applied at least ' || leave_type_record.min_advance_notice_days || ' days in advance'::TEXT, false;
    RETURN;
  END IF;
  
  -- Get user's work schedule
  SELECT * INTO work_schedule
  FROM get_user_work_schedule(user_id_param, start_date_param)
  LIMIT 1;
  
  -- Calculate working days
  calculated_days := calculate_leave_working_days(
    user_record.institution_id,
    work_schedule.work_group_id,
    start_date_param,
    end_date_param,
    half_day_start_param,
    half_day_end_param
  );
  
  -- Check quota if leave type has quota
  IF leave_type_record.has_annual_quota THEN
    SELECT * INTO quota_check
    FROM check_leave_quota_availability(user_id_param, leave_type_id_param, calculated_days)
    LIMIT 1;
    
    IF NOT quota_check.has_sufficient_quota THEN
      RETURN QUERY
      SELECT NULL::UUID, NULL::VARCHAR, calculated_days, 'error'::VARCHAR, quota_check.message, false;
      RETURN;
    END IF;
  END IF;
  
  -- Check maximum consecutive days
  IF leave_type_record.max_consecutive_days IS NOT NULL 
     AND calculated_days > leave_type_record.max_consecutive_days THEN
    RETURN QUERY
    SELECT NULL::UUID, NULL::VARCHAR, calculated_days, 'error'::VARCHAR, 
           'Maximum consecutive days allowed: ' || leave_type_record.max_consecutive_days::TEXT, false;
    RETURN;
  END IF;
  
  -- Generate application number
  application_num := generate_leave_application_number(user_record.institution_id);
  
  -- Create leave application
  INSERT INTO leave_applications (
    application_number,
    user_id,
    leave_type_id,
    start_date,
    end_date,
    total_days,
    half_day_start,
    half_day_end,
    reason,
    emergency_contact,
    medical_certificate_url,
    status
  ) VALUES (
    application_num,
    user_id_param,
    leave_type_id_param,
    start_date_param,
    end_date_param,
    calculated_days,
    half_day_start_param,
    half_day_end_param,
    reason_param,
    emergency_contact_param,
    medical_certificate_url_param,
    CASE WHEN leave_type_record.requires_approval THEN 'pending' ELSE 'approved' END
  )
  RETURNING * INTO new_application;
  
  -- Update pending quota if leave type has quota
  IF leave_type_record.has_annual_quota THEN
    UPDATE user_leave_quotas
    SET 
      pending_days = pending_days + calculated_days,
      updated_at = NOW()
    WHERE user_id = user_id_param
      AND leave_type_id = leave_type_id_param
      AND quota_year = EXTRACT(YEAR FROM CURRENT_DATE);
  END IF;
  
  -- Create approval workflow if required
  IF leave_type_record.requires_approval THEN
    INSERT INTO leave_approval_workflow (
      leave_application_id,
      approval_level,
      approver_id,
      approver_role,
      status
    ) VALUES (
      new_application.id,
      1,
      NULL, -- To be determined by workflow rules
      'supervisor',
      'pending'
    );
  END IF;
  
  RETURN QUERY
  SELECT 
    new_application.id,
    new_application.application_number,
    calculated_days,
    new_application.status,
    CASE 
      WHEN leave_type_record.requires_approval THEN 'Leave application submitted for approval'
      ELSE 'Leave application approved automatically'
    END,
    true;
END;
$$ LANGUAGE plpgsql;

-- Function to initialize default leave types for an institution
CREATE OR REPLACE FUNCTION initialize_default_leave_types(institution_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Annual Leave
  INSERT INTO leave_types (
    institution_id, name, code, description, color,
    is_paid, requires_approval, has_annual_quota, default_quota_days,
    allow_carry_forward, max_carry_forward_days, is_system_default
  ) VALUES (
    institution_id_param, 'Annual Leave', 'AL', 'Yearly vacation leave', '#10B981',
    true, true, true, 14.0, true, 5.0, true
  );
  
  -- Sick Leave
  INSERT INTO leave_types (
    institution_id, name, code, description, color,
    is_paid, requires_approval, requires_medical_certificate, has_annual_quota, default_quota_days,
    max_consecutive_days, is_system_default
  ) VALUES (
    institution_id_param, 'Sick Leave', 'SL', 'Medical leave for illness', '#EF4444',
    true, true, true, true, 14.0, 3, true
  );
  
  -- Emergency Leave
  INSERT INTO leave_types (
    institution_id, name, code, description, color,
    is_paid, requires_approval, has_annual_quota, default_quota_days,
    min_advance_notice_days, is_system_default
  ) VALUES (
    institution_id_param, 'Emergency Leave', 'EL', 'Urgent personal matters', '#F59E0B',
    true, true, true, 3.0, 0, true
  );
  
  -- Maternity Leave
  INSERT INTO leave_types (
    institution_id, name, code, description, color,
    is_paid, requires_approval, requires_medical_certificate, has_annual_quota, default_quota_days,
    max_consecutive_days, min_advance_notice_days, is_system_default
  ) VALUES (
    institution_id_param, 'Maternity Leave', 'ML', 'Maternity leave for mothers', '#EC4899',
    true, true, true, true, 60.0, 90, 30, true
  );
END;
$$ LANGUAGE plpgsql;
