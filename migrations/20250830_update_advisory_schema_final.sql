-- Final Advisory Issues Schema Update
-- This migration ensures all field names align between Advisory Issues and Cases pages
-- Run this after the main advisory issues migration

-- Add new fields to advisory_issues table if they don't exist
DO $$
BEGIN
    -- Add business_stakeholder column (rename from owner)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'advisory_issues' AND column_name = 'business_stakeholder') THEN
        ALTER TABLE advisory_issues ADD COLUMN business_stakeholder TEXT;
        
        -- Copy data from owner column if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'advisory_issues' AND column_name = 'owner') THEN
            UPDATE advisory_issues SET business_stakeholder = owner WHERE owner IS NOT NULL;
        END IF;
    END IF;
    
    -- Add recruiter column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'advisory_issues' AND column_name = 'recruiter') THEN
        ALTER TABLE advisory_issues ADD COLUMN recruiter TEXT;
    END IF;
    
    -- Add background column (rename from trigger_event)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'advisory_issues' AND column_name = 'background') THEN
        ALTER TABLE advisory_issues ADD COLUMN background TEXT;
        
        -- Copy data from trigger_event column if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'advisory_issues' AND column_name = 'trigger_event') THEN
            UPDATE advisory_issues SET background = trigger_event WHERE trigger_event IS NOT NULL;
        END IF;
    END IF;
    
    -- Add next_steps column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'advisory_issues' AND column_name = 'next_steps') THEN
        ALTER TABLE advisory_issues ADD COLUMN next_steps TEXT;
    END IF;
END
$$;

-- Create index on new fields for better performance
CREATE INDEX IF NOT EXISTS idx_advisory_issues_business_stakeholder ON advisory_issues(business_stakeholder);
CREATE INDEX IF NOT EXISTS idx_advisory_issues_recruiter ON advisory_issues(recruiter);

-- Update RLS policies to include new fields
DROP POLICY IF EXISTS "advisory_issues_select_policy" ON advisory_issues;
CREATE POLICY "advisory_issues_select_policy" ON advisory_issues
    FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "advisory_issues_insert_policy" ON advisory_issues;
CREATE POLICY "advisory_issues_insert_policy" ON advisory_issues
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "advisory_issues_update_policy" ON advisory_issues;
CREATE POLICY "advisory_issues_update_policy" ON advisory_issues
    FOR UPDATE USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "advisory_issues_delete_policy" ON advisory_issues;
CREATE POLICY "advisory_issues_delete_policy" ON advisory_issues
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Add helpful comment
COMMENT ON TABLE advisory_issues IS 'Advisory and emerging issues tracking with aligned field names for Cases integration';
COMMENT ON COLUMN advisory_issues.business_stakeholder IS 'Business stakeholder (aligned with Cases page)';
COMMENT ON COLUMN advisory_issues.recruiter IS 'Recruiter involved (new field)';
COMMENT ON COLUMN advisory_issues.background IS 'Background context (renamed from trigger_event)';
COMMENT ON COLUMN advisory_issues.next_steps IS 'Planned next steps (new field)';
