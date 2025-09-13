-- Simple script to create just the advisory_issue_notes table
-- Run this first if the main migration is failing

-- Drop the table if it exists (to recreate with correct schema)
DROP TABLE IF EXISTS public.advisory_issue_notes CASCADE;

-- Create notes table for the v1.5 notes timeline feature
CREATE TABLE public.advisory_issue_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  advisory_issue_id UUID NOT NULL REFERENCES public.advisory_issues(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_advisory_issue_notes_issue_id ON public.advisory_issue_notes(advisory_issue_id);
CREATE INDEX IF NOT EXISTS idx_advisory_issue_notes_created_at ON public.advisory_issue_notes(created_at DESC);

-- Enable RLS
ALTER TABLE public.advisory_issue_notes ENABLE ROW LEVEL SECURITY;

-- Simple RLS policy - allow all authenticated users to do everything
CREATE POLICY "Enable all for authenticated users" ON public.advisory_issue_notes
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Verify the table was created
SELECT 'Notes table created successfully' AS status;
