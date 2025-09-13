-- migrations/20250826_add_handover_flags.sql
-- Add non-destructive flags to support completed and soft-delete behavior.
-- IMPORTANT: take a DB export/snapshot before applying to production.

ALTER TABLE handovers ADD COLUMN IF NOT EXISTS completed boolean DEFAULT false;
ALTER TABLE handovers ADD COLUMN IF NOT EXISTS deleted boolean DEFAULT false;

-- Rollback (to be run only if you explicitly want to remove columns):
-- ALTER TABLE handovers DROP COLUMN IF EXISTS completed;
-- ALTER TABLE handovers DROP COLUMN IF EXISTS deleted;
