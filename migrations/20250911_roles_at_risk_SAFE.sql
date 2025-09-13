-- SAFE MIGRATION: Run this in the Supabase SQL Editor
-- This version updates data first, then applies constraints

-- Step 1: Add new columns (safe to run)
ALTER TABLE roles_at_risk 
ADD COLUMN IF NOT EXISTS roma_id TEXT,
ADD COLUMN IF NOT EXISTS role_type TEXT,
ADD COLUMN IF NOT EXISTS client TEXT,
ADD COLUMN IF NOT EXISTS risk_reasons TEXT[];

-- Step 2: Update existing data to match new requirements
UPDATE roles_at_risk 
SET 
    status = CASE 
        WHEN status IN ('monitoring', 'escalated', 'open') THEN 'Open'
        WHEN status IN ('resolved', 'closed') THEN 'Closed'
        WHEN LOWER(status) = 'open' THEN 'Open'
        WHEN LOWER(status) = 'closed' THEN 'Closed'
        ELSE 'Open'
    END
WHERE status NOT IN ('Open', 'Closed');

-- Step 3: Add default values for new columns
UPDATE roles_at_risk 
SET 
    role_type = COALESCE(role_type, 'External'),
    risk_reasons = COALESCE(risk_reasons, ARRAY['Other'])
WHERE role_type IS NULL OR risk_reasons IS NULL;

-- Step 4: Rename columns (safe after data update)
DO $$
BEGIN
    -- Check if req_id column exists before renaming
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'roles_at_risk' AND column_name = 'req_id') THEN
        ALTER TABLE roles_at_risk RENAME COLUMN req_id TO job_rec_id;
    END IF;
    
    -- Check if open_date column exists before renaming
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'roles_at_risk' AND column_name = 'open_date') THEN
        ALTER TABLE roles_at_risk RENAME COLUMN open_date TO date_created;
    END IF;
END $$;

-- Step 5: Now safe to add constraints
ALTER TABLE roles_at_risk DROP CONSTRAINT IF EXISTS roles_at_risk_status_check;
ALTER TABLE roles_at_risk ADD CONSTRAINT roles_at_risk_status_check 
CHECK (status IN ('Open', 'Closed'));

-- Add role_type constraint
ALTER TABLE roles_at_risk DROP CONSTRAINT IF EXISTS roles_at_risk_role_type_check;
ALTER TABLE roles_at_risk ADD CONSTRAINT roles_at_risk_role_type_check 
CHECK (role_type IN ('Internal', 'External'));

-- Remove old constraints
ALTER TABLE roles_at_risk DROP CONSTRAINT IF EXISTS roles_at_risk_risk_level_check;

-- Step 6: Add unique constraint for job_rec_id per user
ALTER TABLE roles_at_risk DROP CONSTRAINT IF EXISTS unique_job_rec_id_per_user;
ALTER TABLE roles_at_risk ADD CONSTRAINT unique_job_rec_id_per_user UNIQUE (job_rec_id, user_id);

-- Step 7: Set default values
ALTER TABLE roles_at_risk ALTER COLUMN status SET DEFAULT 'Open';
ALTER TABLE roles_at_risk ALTER COLUMN role_type SET DEFAULT 'External';

-- Step 8: Create indexes
CREATE INDEX IF NOT EXISTS idx_roles_at_risk_job_rec_id ON roles_at_risk(job_rec_id);
CREATE INDEX IF NOT EXISTS idx_roles_at_risk_roma_id ON roles_at_risk(roma_id);
CREATE INDEX IF NOT EXISTS idx_roles_at_risk_role_type ON roles_at_risk(role_type);
CREATE INDEX IF NOT EXISTS idx_roles_at_risk_client ON roles_at_risk(client);

-- Step 9: Create validation function and trigger
CREATE OR REPLACE FUNCTION validate_risk_reasons()
RETURNS TRIGGER AS $$
DECLARE
    valid_reasons TEXT[] := ARRAY['No candidates', 'Approval blocked', 'Salary range issue', 'Other', 'Aging role'];
    reason TEXT;
BEGIN
    IF NEW.risk_reasons IS NOT NULL THEN
        FOREACH reason IN ARRAY NEW.risk_reasons
        LOOP
            IF NOT reason = ANY(valid_reasons) THEN
                RAISE EXCEPTION 'Invalid risk reason: %. Valid reasons are: %', reason, array_to_string(valid_reasons, ', ');
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS validate_risk_reasons_trigger ON roles_at_risk;
CREATE TRIGGER validate_risk_reasons_trigger
    BEFORE INSERT OR UPDATE ON roles_at_risk
    FOR EACH ROW
    EXECUTE FUNCTION validate_risk_reasons();
