-- Update the check constraint for employee_id to include ADM- prefix
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS employee_id_format_check;

ALTER TABLE public.users
ADD CONSTRAINT employee_id_format_check 
CHECK (
    employee_id ~ '^(ADM-|TC-|STF-|STD-|POS-)[A-Za-z0-9]+$'
);