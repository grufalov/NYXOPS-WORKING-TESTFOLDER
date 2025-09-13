-- Add covering period fields to handovers table
-- Migration: 20250912_add_handover_period_fields.sql

-- Add covering start and end date fields to track handover periods
ALTER TABLE handovers ADD COLUMN IF NOT EXISTS covering_start DATE;
ALTER TABLE handovers ADD COLUMN IF NOT EXISTS covering_end DATE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_handovers_covering_start ON handovers(covering_start);
CREATE INDEX IF NOT EXISTS idx_handovers_covering_end ON handovers(covering_end);

-- Optional: Add comment to document the purpose
COMMENT ON COLUMN handovers.covering_start IS 'Start date of the period this handover covers';
COMMENT ON COLUMN handovers.covering_end IS 'End date of the period this handover covers';
