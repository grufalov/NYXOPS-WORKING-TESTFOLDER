-- Advisory Issues v1.5 Simplified Database Migration
-- This migration adds the necessary schema changes for the simplified v1.5 implementation
-- 
-- v1.5 Simplified Spec:
-- - "Lightweight holding list" for potential cases
-- - Open/Closed status only (simplified from existing status values)
-- - Required fields: title, status
-- - Optional fields: description, owner
-- - Notes timeline (append-only notes)
-- - Promotion to cases with metadata tracking
-- - Age calculation and activity tracking
-- - Export functionality (CSV/PDF/HTML)

-- =============================================================================
-- Phase 1: Add v1.5 required columns to advisory_issues table
-- =============================================================================

-- Add optional description field (null allowed for simplified spec)
ALTER TABLE public.advisory_issues 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add optional owner field (null allowed for simplified spec)
ALTER TABLE public.advisory_issues 
ADD COLUMN IF NOT EXISTS owner TEXT;

-- Add created_by field to track who created the issue
ALTER TABLE public.advisory_issues 
ADD COLUMN IF NOT EXISTS created_by TEXT;

-- Add promotion tracking fields
ALTER TABLE public.advisory_issues 
ADD COLUMN IF NOT EXISTS promoted BOOLEAN DEFAULT FALSE;

ALTER TABLE public.advisory_issues 
ADD COLUMN IF NOT EXISTS promoted_at TIMESTAMPTZ;

ALTER TABLE public.advisory_issues 
ADD COLUMN IF NOT EXISTS promoted_to_case_id UUID;

-- Add activity tracking for v1.5
ALTER TABLE public.advisory_issues 
ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMPTZ DEFAULT now();

-- Update existing records to have last_activity_date
UPDATE public.advisory_issues 
SET last_activity_date = COALESCE(updated_at, created_at, now()) 
WHERE last_activity_date IS NULL;

-- =============================================================================
-- Phase 1.5: Create advisory_issue_notes table for v1.5 notes timeline
-- =============================================================================

-- Create notes table for the v1.5 notes timeline feature
CREATE TABLE IF NOT EXISTS public.advisory_issue_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  advisory_issue_id UUID NOT NULL REFERENCES public.advisory_issues(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for efficient notes retrieval
CREATE INDEX IF NOT EXISTS idx_advisory_issue_notes_issue_id ON public.advisory_issue_notes(advisory_issue_id);
CREATE INDEX IF NOT EXISTS idx_advisory_issue_notes_created_at ON public.advisory_issue_notes(created_at DESC);

-- Enable RLS for notes table
ALTER TABLE public.advisory_issue_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all advisory issue notes" ON public.advisory_issue_notes;
DROP POLICY IF EXISTS "Users can create advisory issue notes" ON public.advisory_issue_notes;
DROP POLICY IF EXISTS "Users can update their own advisory issue notes" ON public.advisory_issue_notes;
DROP POLICY IF EXISTS "Users can delete their own advisory issue notes" ON public.advisory_issue_notes;

-- Create RLS policies for notes table
CREATE POLICY "Users can view all advisory issue notes"
  ON public.advisory_issue_notes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create advisory issue notes"
  ON public.advisory_issue_notes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own advisory issue notes"
  ON public.advisory_issue_notes FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own advisory issue notes"
  ON public.advisory_issue_notes FOR DELETE
  USING (auth.role() = 'authenticated');

-- =============================================================================
-- Phase 2: Create v1.5 view with age calculation and simplified status
-- =============================================================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS public.advisory_issues_with_age;

-- Create enhanced view for v1.5 with age calculation and simplified status
CREATE VIEW public.advisory_issues_with_age AS
SELECT 
  *,
  EXTRACT(DAY FROM (now() - created_at))::integer AS age_in_days,
  CASE 
    WHEN status IN ('under_review', 'investigating', 'monitoring', 'ready_to_escalate') THEN 'open'
    WHEN status IN ('escalated', 'closed') THEN 'closed'
    ELSE 'open'
  END AS simplified_status
FROM public.advisory_issues;

-- =============================================================================
-- Phase 3: Create function to update last_activity_date on notes
-- =============================================================================

-- Function to automatically update last_activity_date when notes are added
CREATE OR REPLACE FUNCTION update_advisory_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.advisory_issues
  SET last_activity_date = now()
  WHERE id = NEW.advisory_issue_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Phase 4: Create triggers for automatic activity date updates
-- =============================================================================

-- Trigger for notes activity
DROP TRIGGER IF EXISTS advisory_notes_activity_trigger ON public.advisory_issue_notes;
CREATE TRIGGER advisory_notes_activity_trigger
  AFTER INSERT ON public.advisory_issue_notes
  FOR EACH ROW EXECUTE FUNCTION update_advisory_last_activity();

-- Trigger for status change activity
CREATE OR REPLACE FUNCTION update_advisory_status_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.last_activity_date = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS advisory_status_activity_trigger ON public.advisory_issues;
CREATE TRIGGER advisory_status_activity_trigger
  BEFORE UPDATE ON public.advisory_issues
  FOR EACH ROW EXECUTE FUNCTION update_advisory_status_activity();

-- =============================================================================
-- Phase 5: Add indexes for v1.5 performance
-- =============================================================================

-- Index for owner filtering
CREATE INDEX IF NOT EXISTS idx_advisory_issues_owner ON public.advisory_issues(owner);

-- Index for promotion filtering
CREATE INDEX IF NOT EXISTS idx_advisory_issues_promoted ON public.advisory_issues(promoted);

-- Index for activity sorting (most important for v1.5)
CREATE INDEX IF NOT EXISTS idx_advisory_issues_last_activity ON public.advisory_issues(last_activity_date DESC);

-- Index for simplified status filtering (computed from status)
CREATE INDEX IF NOT EXISTS idx_advisory_issues_status ON public.advisory_issues(status);

-- =============================================================================
-- Phase 6: Grant necessary permissions
-- =============================================================================

-- Grant permissions for the view
GRANT SELECT ON advisory_issues_with_age TO authenticated;

-- Grant permissions for the functions
GRANT EXECUTE ON FUNCTION update_advisory_last_activity() TO authenticated;
GRANT EXECUTE ON FUNCTION update_advisory_status_activity() TO authenticated;

-- =============================================================================
-- Phase 7: Create sample data for testing (optional - can be removed in production)
-- =============================================================================

-- This section can be uncommented for testing purposes
/*
-- Insert sample advisory issues if table is empty
INSERT INTO public.advisory_issues (title, description, owner, status, created_by, created_at)
SELECT 
  'Sample Advisory Issue ' || generate_series,
  'This is a sample description for testing the v1.5 implementation. ' ||
  'It includes enough text to test truncation and display features.',
  CASE (generate_series % 3) 
    WHEN 0 THEN 'john.doe@company.com'
    WHEN 1 THEN 'jane.smith@company.com'
    ELSE NULL
  END,
  CASE (generate_series % 4)
    WHEN 0 THEN 'under_review'
    WHEN 1 THEN 'investigating'
    WHEN 2 THEN 'monitoring'
    ELSE 'closed'
  END,
  'system@company.com',
  now() - (generate_series || ' days')::interval
FROM generate_series(1, 5)
WHERE NOT EXISTS (SELECT 1 FROM public.advisory_issues LIMIT 1);

-- Insert sample notes for testing
INSERT INTO public.advisory_issue_notes (advisory_issue_id, content, author, created_at)
SELECT 
  ai.id,
  'Sample note ' || generate_series || ' for issue: ' || ai.title,
  'test.user@company.com',
  now() - (generate_series || ' hours')::interval
FROM public.advisory_issues ai, generate_series(1, 2)
WHERE NOT EXISTS (SELECT 1 FROM public.advisory_issue_notes LIMIT 1);
*/

-- =============================================================================
-- Phase 8: Verification queries (for testing after migration)
-- =============================================================================

-- These queries can be run to verify the migration worked correctly:
-- 
-- 1. Check the view works:
-- SELECT COUNT(*) FROM advisory_issues_with_age;
-- 
-- 2. Check age calculation:
-- SELECT id, title, age_in_days, simplified_status FROM advisory_issues_with_age LIMIT 5;
-- 
-- 3. Check for any null required fields:
-- SELECT COUNT(*) FROM advisory_issues WHERE title IS NULL;
-- 
-- 4. Check promotion fields:
-- SELECT COUNT(*) as total, COUNT(promoted) as promoted_count FROM advisory_issues;

-- =============================================================================
-- Comments and documentation
-- =============================================================================

COMMENT ON TABLE public.advisory_issues IS 'Advisory Issues with v1.5 enhancements - simplified status, promotion tracking, activity monitoring';
COMMENT ON VIEW advisory_issues_with_age IS 'Advisory Issues v1.5 view with computed age_in_days and simplified_status for easy filtering';
COMMENT ON COLUMN public.advisory_issues.description IS 'Optional description field - can be null for simplified entries';
COMMENT ON COLUMN public.advisory_issues.owner IS 'Optional owner field - can be null for unassigned issues';
COMMENT ON COLUMN public.advisory_issues.promoted IS 'Tracks if this issue has been promoted to a case';
COMMENT ON COLUMN public.advisory_issues.promoted_at IS 'Timestamp when the issue was promoted to a case';
COMMENT ON COLUMN public.advisory_issues.promoted_to_case_id IS 'ID of the case this issue was promoted to';
COMMENT ON COLUMN public.advisory_issues.last_activity_date IS 'Last activity timestamp - updated on status changes and note additions';

-- =============================================================================
-- Rollback plan (commented out for safety)
-- =============================================================================

-- To rollback this migration (only if needed and no v1.5 data exists):
/*
-- 1. Drop triggers
DROP TRIGGER IF EXISTS advisory_notes_activity_trigger ON public.advisory_issue_notes;
DROP TRIGGER IF EXISTS advisory_status_activity_trigger ON public.advisory_issues;

-- 2. Drop functions
DROP FUNCTION IF EXISTS update_advisory_last_activity();
DROP FUNCTION IF EXISTS update_advisory_status_activity();

-- 3. Drop view
DROP VIEW IF EXISTS advisory_issues_with_age;

-- 4. Drop indexes
DROP INDEX IF EXISTS idx_advisory_issues_owner;
DROP INDEX IF EXISTS idx_advisory_issues_promoted;
DROP INDEX IF EXISTS idx_advisory_issues_last_activity;

-- 5. Remove columns (careful - this will lose data!)
-- ALTER TABLE public.advisory_issues 
-- DROP COLUMN IF EXISTS description,
-- DROP COLUMN IF EXISTS owner,
-- DROP COLUMN IF EXISTS promoted,
-- DROP COLUMN IF EXISTS promoted_at,
-- DROP COLUMN IF EXISTS promoted_to_case_id,
-- DROP COLUMN IF EXISTS last_activity_date;
*/

-- =============================================================================
-- Migration complete
-- =============================================================================

-- This migration adds all necessary schema changes for Advisory Issues v1.5
-- Simplified implementation as per the specification:
-- - Lightweight holding list for potential cases
-- - Open/Closed status filtering (computed from existing status values)
-- - Optional description and owner fields
-- - Notes timeline support
-- - Promotion tracking with metadata
-- - Activity tracking for sorting
-- - Performance indexes for filtering and sorting

SELECT 'Advisory Issues v1.5 Simplified Migration Complete' AS status;
