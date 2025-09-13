-- Idempotent migration to ensure required columns exist
-- Run this in Supabase SQL editor if any columns are missing

alter table public.advisory_issues
  add column if not exists practice text,
  add column if not exists recruiter text,
  add column if not exists background text;
