-- CLEAN SLATE MIGRATION: Delete test data and rebuild schema
-- This clears all existing data and creates the new structure

-- Step 1: Clear all existing data (it's just test data)
DELETE FROM roles_at_risk;

-- Step 2: Drop all existing constraints and indexes
ALTER TABLE roles_at_risk DROP CONSTRAINT IF EXISTS roles_at_risk_status_check;
ALTER TABLE roles_at_risk DROP CONSTRAINT IF EXISTS roles_at_risk_risk_level_check;
ALTER TABLE roles_at_risk DROP CONSTRAINT IF EXISTS roles_at_risk_role_type_check;
ALTER TABLE roles_at_risk DROP CONSTRAINT IF EXISTS unique_job_rec_id_per_user;

-- Step 3: Drop and recreate columns with new structure
ALTER TABLE roles_at_risk DROP COLUMN IF EXISTS req_id;
ALTER TABLE roles_at_risk DROP COLUMN IF EXISTS open_date;
ALTER TABLE roles_at_risk DROP COLUMN IF EXISTS risk_level;

-- Step 4: Add all new columns
ALTER TABLE roles_at_risk 
ADD COLUMN IF NOT EXISTS job_rec_id TEXT,
ADD COLUMN IF NOT EXISTS roma_id TEXT,
ADD COLUMN IF NOT EXISTS practice TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS role_type TEXT DEFAULT 'External',
ADD COLUMN IF NOT EXISTS client TEXT,
ADD COLUMN IF NOT EXISTS risk_reasons TEXT[] DEFAULT ARRAY['Other'],
ADD COLUMN IF NOT EXISTS date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Step 5: Set the status column to use new values and default
ALTER TABLE roles_at_risk ALTER COLUMN status SET DEFAULT 'Open';

-- Step 6: Add all constraints (safe now since table is empty)
ALTER TABLE roles_at_risk ADD CONSTRAINT roles_at_risk_status_check 
CHECK (status IN ('Open', 'Closed'));

ALTER TABLE roles_at_risk ADD CONSTRAINT roles_at_risk_role_type_check 
CHECK (role_type IN ('Internal', 'External'));

ALTER TABLE roles_at_risk ADD CONSTRAINT unique_job_rec_id_per_user UNIQUE (job_rec_id, user_id);

-- Step 7: Create indexes
CREATE INDEX IF NOT EXISTS idx_roles_at_risk_job_rec_id ON roles_at_risk(job_rec_id);
CREATE INDEX IF NOT EXISTS idx_roles_at_risk_roma_id ON roles_at_risk(roma_id);
CREATE INDEX IF NOT EXISTS idx_roles_at_risk_role_type ON roles_at_risk(role_type);
CREATE INDEX IF NOT EXISTS idx_roles_at_risk_client ON roles_at_risk(client);
CREATE INDEX IF NOT EXISTS idx_roles_at_risk_status ON roles_at_risk(status);
CREATE INDEX IF NOT EXISTS idx_roles_at_risk_date_created ON roles_at_risk(date_created);

-- Step 8: Create validation function and trigger for risk_reasons
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

DROP TRIGGER IF EXISTS validate_risk_reasons_trigger ON roles_at_risk;
CREATE TRIGGER validate_risk_reasons_trigger
    BEFORE INSERT OR UPDATE ON roles_at_risk
    FOR EACH ROW
    EXECUTE FUNCTION validate_risk_reasons();

-- Step 9: Insert some sample data for testing
INSERT INTO roles_at_risk (
    job_rec_id, 
    roma_id, 
    practice,
    title,
    role_type, 
    client, 
    status, 
    risk_reasons, 
    user_id,
    date_created
) VALUES 
    ('JR-001', 'ROMA-001', 'Engineering', 'Senior Developer', 'External', 'TechCorp Inc', 'Open', ARRAY['No candidates'], NULL, NOW()),
    ('JR-002', 'ROMA-002', 'Delivery', 'Project Manager', 'Internal', 'Internal Dept', 'Open', ARRAY['Salary range issue'], NULL, NOW()),
    ('JR-003', 'ROMA-003', 'Data', 'Data Analyst', 'External', 'DataFlow Ltd', 'Closed', ARRAY['Other'], NULL, NOW() - INTERVAL '5 days'),
    ('JR-004', 'ROMA-004', 'Design', 'UX Designer', 'External', 'Design Studio', 'Open', ARRAY['Aging role', 'Approval blocked'], NULL, NOW() - INTERVAL '2 days');
