-- Refactor roles_at_risk table for smart table implementation
-- Add new columns and update constraints

-- Add new columns
ALTER TABLE roles_at_risk 
ADD COLUMN IF NOT EXISTS roma_id TEXT,
ADD COLUMN IF NOT EXISTS role_type TEXT CHECK (role_type IN ('Internal', 'External')),
ADD COLUMN IF NOT EXISTS client TEXT,
ADD COLUMN IF NOT EXISTS risk_reasons TEXT[]; -- Array of risk reasons

-- Update existing columns
-- Change req_id to job_rec_id for clarity and make it unique
ALTER TABLE roles_at_risk RENAME COLUMN req_id TO job_rec_id;
ALTER TABLE roles_at_risk ADD CONSTRAINT unique_job_rec_id_per_user UNIQUE (job_rec_id, user_id);

-- Update existing data to match new schema FIRST (before adding constraints)
UPDATE roles_at_risk 
SET 
    status = CASE 
        WHEN status IN ('monitoring', 'escalated') THEN 'Open'
        WHEN status = 'resolved' THEN 'Closed'
        ELSE 'Open'
    END
WHERE status NOT IN ('Open', 'Closed');

-- Now update status constraints to match new requirements
ALTER TABLE roles_at_risk DROP CONSTRAINT IF EXISTS roles_at_risk_status_check;
ALTER TABLE roles_at_risk ADD CONSTRAINT roles_at_risk_status_check 
CHECK (status IN ('Open', 'Closed'));

-- Remove old risk_level constraints and use risk_reasons array instead
ALTER TABLE roles_at_risk DROP CONSTRAINT IF EXISTS roles_at_risk_risk_level_check;

-- Update default values
ALTER TABLE roles_at_risk ALTER COLUMN status SET DEFAULT 'Open';

-- Rename open_date to date_created for clarity and make it read-only in UI
ALTER TABLE roles_at_risk RENAME COLUMN open_date TO date_created;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_roles_at_risk_job_rec_id ON roles_at_risk(job_rec_id);
CREATE INDEX IF NOT EXISTS idx_roles_at_risk_roma_id ON roles_at_risk(roma_id);
CREATE INDEX IF NOT EXISTS idx_roles_at_risk_role_type ON roles_at_risk(role_type);
CREATE INDEX IF NOT EXISTS idx_roles_at_risk_client ON roles_at_risk(client);

-- Create function to validate risk_reasons
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

-- Create trigger for risk_reasons validation
DROP TRIGGER IF EXISTS validate_risk_reasons_trigger ON roles_at_risk;
CREATE TRIGGER validate_risk_reasons_trigger
    BEFORE INSERT OR UPDATE ON roles_at_risk
    FOR EACH ROW
    EXECUTE FUNCTION validate_risk_reasons();

-- Add default values for new columns
UPDATE roles_at_risk 
SET 
    role_type = 'External', -- Default value
    risk_reasons = ARRAY['Other'] -- Default risk reason
WHERE role_type IS NULL OR risk_reasons IS NULL;
