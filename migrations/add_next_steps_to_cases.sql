-- Migration: Add next_steps column to cases table
-- Created: August 26, 2025
-- Purpose: Add a next_steps field for each case to be displayed above notes with golden accent

-- Add next_steps column to the cases table
ALTER TABLE cases ADD COLUMN IF NOT EXISTS next_steps TEXT;

-- Add comment to document the purpose
COMMENT ON COLUMN cases.next_steps IS 'Plain text field for next steps related to the case. Displayed above notes with golden accent.';

-- No additional permissions needed as it inherits from the existing cases table RLS policies
