-- Add institution_id to user_work_group_assignments table
-- This helps with data scoping and security

-- Add the column
ALTER TABLE public.user_work_group_assignments 
ADD COLUMN institution_id uuid;

-- Add foreign key constraint
ALTER TABLE public.user_work_group_assignments 
ADD CONSTRAINT user_work_group_assignments_institution_id_fkey 
FOREIGN KEY (institution_id) REFERENCES institutions (id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_work_group_assignments_institution_id 
ON public.user_work_group_assignments USING btree (institution_id) 
TABLESPACE pg_default;

-- Update existing records to have the correct institution_id based on work_group
UPDATE public.user_work_group_assignments 
SET institution_id = wg.institution_id
FROM public.work_groups wg
WHERE user_work_group_assignments.work_group_id = wg.id
AND user_work_group_assignments.institution_id IS NULL;

-- Make the column NOT NULL after updating existing records
ALTER TABLE public.user_work_group_assignments 
ALTER COLUMN institution_id SET NOT NULL;

COMMENT ON COLUMN public.user_work_group_assignments.institution_id IS 'Institution ID for data scoping and security';