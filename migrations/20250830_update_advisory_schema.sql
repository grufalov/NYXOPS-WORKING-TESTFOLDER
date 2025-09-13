-- Migration: Update Advisory Issues schema for visual alignment with Cases
-- Created: August 30, 2025
-- Purpose: Rename fields and add new fields to match Cases page design

-- Add new columns
alter table public.advisory_issues add column if not exists business_stakeholder text;
alter table public.advisory_issues add column if not exists recruiter text;
alter table public.advisory_issues add column if not exists background text;
alter table public.advisory_issues add column if not exists next_steps text;

-- Migrate data from old columns to new columns (if data exists)
update public.advisory_issues set business_stakeholder = owner where owner is not null;
update public.advisory_issues set background = trigger_event where trigger_event is not null;

-- Drop old columns (optional - uncomment if you want to clean up)
-- alter table public.advisory_issues drop column if exists owner;
-- alter table public.advisory_issues drop column if exists trigger_event;

-- Note: We keep the old columns for backward compatibility during transition
-- You can drop them later once you confirm the migration worked properly
