-- Fix the apply_for_leave function with proper column qualification
-- This addresses the "working_days" ambiguous column reference error

CREATE OR REPLACE FUNCTION apply_for_leave(
    user_id_param uuid,
    leave_type_id_param uuid,
    start_date_param date,
    end_date_param date,
    reason_param text,
    half_day_start_param boolean DEFAULT false,
    half_day_end_param boolean DEFAULT false,
    emergency_contact_param text DEFAULT NULL,
    medical_certificate_url_param text DEFAULT NULL
)
RETURNS TABLE(
    success boolean,
    message text,
    application_id uuid,
    application_number text,
    status text,
    total_days integer
)
LANGUAGE plpgsql
AS $$
DECLARE
    application_id_var uuid;
    application_number_var text;
    total_days_var integer;
    leave_type_rec record;
    working_days_count integer;
    user_leave_balance integer;
    
BEGIN
    -- Validate user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_id_param) THEN
        RETURN QUERY SELECT false, 'User not found'::text, NULL::uuid, NULL::text, NULL::text, NULL::integer;
        RETURN;
    END IF;
    
    -- Validate leave type exists and is active
    SELECT * INTO leave_type_rec 
    FROM leave_types 
    WHERE id = leave_type_id_param AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Leave type not found or inactive'::text, NULL::uuid, NULL::text, NULL::text, NULL::integer;
        RETURN;
    END IF;
    
    -- Validate date range
    IF start_date_param > end_date_param THEN
        RETURN QUERY SELECT false, 'Start date cannot be after end date'::text, NULL::uuid, NULL::text, NULL::text, NULL::integer;
        RETURN;
    END IF;
    
    -- Calculate working days (excluding weekends for now)
    -- This is a simplified calculation - you may need to adjust based on your business rules
    SELECT COUNT(*) INTO working_days_count
    FROM generate_series(start_date_param::date, end_date_param::date, '1 day'::interval) AS day_series
    WHERE EXTRACT(DOW FROM day_series) NOT IN (0, 6); -- Exclude Sunday (0) and Saturday (6)
    
    -- Adjust for half days
    total_days_var := working_days_count;
    IF half_day_start_param THEN
        total_days_var := total_days_var - 0.5;
    END IF;
    IF half_day_end_param THEN
        total_days_var := total_days_var - 0.5;
    END IF;
    
    -- Check leave balance (if leave type requires balance checking)
    IF leave_type_rec.requires_balance THEN
        -- Get current leave balance for the user and leave type
        SELECT COALESCE(SUM(lb.balance_days), 0) INTO user_leave_balance
        FROM leave_balance_history lb
        WHERE lb.user_id = user_id_param 
          AND lb.leave_type_id = leave_type_id_param
          AND lb.effective_date <= CURRENT_DATE;
        
        IF user_leave_balance < total_days_var THEN
            RETURN QUERY SELECT false, 
                format('Insufficient leave balance. Available: %s days, Requested: %s days', user_leave_balance, total_days_var),
                NULL::uuid, NULL::text, NULL::text, NULL::integer;
            RETURN;
        END IF;
    END IF;
    
    -- Generate application number
    application_number_var := 'LA' || to_char(CURRENT_DATE, 'YYYY') || '-' || 
                             LPAD((EXTRACT(EPOCH FROM NOW()) * 1000)::bigint::text, 10, '0');
    
    -- Generate UUID for application
    application_id_var := gen_random_uuid();
    
    -- Insert leave application
    INSERT INTO leave_applications (
        id,
        user_id,
        leave_type_id,
        application_number,
        start_date,
        end_date,
        total_days,
        reason,
        status,
        half_day_start,
        half_day_end,
        emergency_contact,
        medical_certificate_url,
        applied_date,
        created_at,
        updated_at
    ) VALUES (
        application_id_var,
        user_id_param,
        leave_type_id_param,
        application_number_var,
        start_date_param,
        end_date_param,
        total_days_var,
        reason_param,
        'pending',
        half_day_start_param,
        half_day_end_param,
        emergency_contact_param,
        medical_certificate_url_param,
        CURRENT_DATE,
        NOW(),
        NOW()
    );
    
    -- Create initial approval workflow entry
    INSERT INTO leave_approval_workflow (
        id,
        leave_application_id,
        approver_level,
        status,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        application_id_var,
        1,
        'pending',
        NOW(),
        NOW()
    );
    
    -- If leave type requires balance deduction, create negative balance entry
    IF leave_type_rec.requires_balance THEN
        INSERT INTO leave_balance_history (
            id,
            user_id,
            leave_type_id,
            balance_days,
            transaction_type,
            reference_id,
            description,
            effective_date,
            created_at
        ) VALUES (
            gen_random_uuid(),
            user_id_param,
            leave_type_id_param,
            -total_days_var,
            'deduction',
            application_id_var,
            format('Leave application %s', application_number_var),
            start_date_param,
            NOW()
        );
    END IF;
    
    RETURN QUERY SELECT true, 
                       format('Leave application submitted successfully. Application ID: %s', application_number_var),
                       application_id_var,
                       application_number_var,
                       'pending'::text,
                       total_days_var;
END;
$$;