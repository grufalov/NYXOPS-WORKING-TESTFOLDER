-- Migration: Advisory Issues v1.5 Upgrade
-- Created: September 10, 2025
-- Purpose: Add v1.5 required fields, triggers, and computed views

-- Phase 1: Add new v1.5 columns (additive, safe)
ALTER TABLE public.advisory_issues 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS owner TEXT,
  ADD COLUMN IF NOT EXISTS promoted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS promoted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS promoted_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMPTZ DEFAULT now();

-- Phase 2: Backfill existing data from current fields
UPDATE public.advisory_issues SET
  description = COALESCE(background, ''),
  owner = COALESCE(business_stakeholder, ''),
  promoted = (promoted_case_id IS NOT NULL),
  promoted_at = CASE WHEN promoted_case_id IS NOT NULL THEN updated_at END,
  last_activity_date = COALESCE(updated_at, created_at)
WHERE description IS NULL OR owner IS NULL OR last_activity_date IS NULL;

-- Phase 3: Create computed view for age calculation
CREATE OR REPLACE VIEW advisory_issues_v15 AS
SELECT *,
  EXTRACT(days FROM now() - created_at)::integer AS age_in_days,
  CASE 
    WHEN status IN ('open', 'monitoring', 'ready_to_escalate') THEN 'open'
    WHEN status IN ('escalated', 'closed') THEN 'closed'
    ELSE 'open'
  END AS simplified_status
FROM public.advisory_issues;

-- Phase 4: Create function to update last_activity_date
CREATE OR REPLACE FUNCTION update_advisory_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.advisory_issues 
  SET last_activity_date = now()
  WHERE id = NEW.advisory_issue_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Phase 5: Create trigger for automatic activity date updates
DROP TRIGGER IF EXISTS advisory_notes_activity_trigger ON public.advisory_issue_notes;
CREATE TRIGGER advisory_notes_activity_trigger
  AFTER INSERT ON public.advisory_issue_notes
  FOR EACH ROW EXECUTE FUNCTION update_advisory_last_activity();

-- Phase 6: Create trigger for status change activity updates
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

-- Phase 7: Add indexes for v1.5 performance
CREATE INDEX IF NOT EXISTS idx_advisory_issues_owner ON public.advisory_issues(owner);
CREATE INDEX IF NOT EXISTS idx_advisory_issues_promoted ON public.advisory_issues(promoted);
CREATE INDEX IF NOT EXISTS idx_advisory_issues_last_activity ON public.advisory_issues(last_activity_date DESC);

-- Phase 8: Create function for search highlighting (for future use)
CREATE OR REPLACE FUNCTION highlight_search_terms(content TEXT, search_term TEXT)
RETURNS TEXT AS $$
BEGIN
  IF search_term IS NULL OR search_term = '' THEN
    RETURN content;
  END IF;
  
  RETURN regexp_replace(
    content, 
    search_term, 
    '<mark>' || search_term || '</mark>', 
    'gi'
  );
END;
$$ LANGUAGE plpgsql;

-- Phase 9: Grant necessary permissions
GRANT SELECT ON advisory_issues_v15 TO authenticated;
GRANT EXECUTE ON FUNCTION update_advisory_last_activity() TO authenticated;
GRANT EXECUTE ON FUNCTION update_advisory_status_activity() TO authenticated;
GRANT EXECUTE ON FUNCTION highlight_search_terms(TEXT, TEXT) TO authenticated;

-- Migration verification queries (for testing)
-- SELECT COUNT(*) FROM advisory_issues_v15;
-- SELECT id, title, description, owner, promoted, age_in_days, simplified_status FROM advisory_issues_v15 LIMIT 5;
-- SELECT * FROM advisory_issues WHERE description IS NULL OR owner IS NULL;

-- Rollback plan (commented out):
-- To rollback this migration:
-- 1. DROP TRIGGER advisory_notes_activity_trigger ON public.advisory_issue_notes;
-- 2. DROP TRIGGER advisory_status_activity_trigger ON public.advisory_issues;
-- 3. DROP FUNCTION update_advisory_last_activity();
-- 4. DROP FUNCTION update_advisory_status_activity();
-- 5. DROP VIEW advisory_issues_v15;
-- 6. ALTER TABLE public.advisory_issues DROP COLUMN description, DROP COLUMN owner, etc.
-- Note: Only perform rollback if no v1.5 data has been created

COMMENT ON TABLE public.advisory_issues IS 'Advisory Issues with v1.5 enhancements - simplified status, promotion tracking, activity monitoring';
COMMENT ON VIEW advisory_issues_v15 IS 'Advisory Issues v1.5 view with computed age_in_days and simplified_status';
