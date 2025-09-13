-- Migration: Add Advisory & Emerging Issues support
-- Created: August 30, 2025
-- Purpose: Add lightweight staging area for items that aren't full Cases yet

-- Advisory Issues table
create table if not exists public.advisory_issues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  type text not null default 'advisory' check (type in ('advisory', 'emerging')),
  status text not null default 'open' check (status in ('open', 'monitoring', 'ready_to_escalate', 'escalated', 'closed')),
  business_stakeholder text, -- renamed from owner
  recruiter text, -- new field
  practice text,
  candidate_role text,
  background text, -- renamed from trigger_event
  next_steps text, -- new field like in cases
  promoted_case_id uuid references public.cases(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Advisory Issue Notes table (similar to case notes)
create table if not exists public.advisory_issue_notes (
  id uuid primary key default gen_random_uuid(),
  advisory_issue_id uuid not null references public.advisory_issues(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  user_name text
);

-- Advisory Issue Activity Log table (for traceability)
create table if not exists public.advisory_issue_activity (
  id uuid primary key default gen_random_uuid(),
  advisory_issue_id uuid not null references public.advisory_issues(id) on delete cascade,
  action text not null, -- 'created', 'updated', 'status_changed', 'type_changed', 'promoted', 'note_added'
  details jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id),
  user_name text
);

-- Add indexes for performance
create index if not exists idx_advisory_issues_user_id on public.advisory_issues(user_id);
create index if not exists idx_advisory_issues_status on public.advisory_issues(status);
create index if not exists idx_advisory_issues_type on public.advisory_issues(type);
create index if not exists idx_advisory_issues_created_at on public.advisory_issues(created_at desc);
create index if not exists idx_advisory_issue_notes_issue_id on public.advisory_issue_notes(advisory_issue_id);
create index if not exists idx_advisory_issue_activity_issue_id on public.advisory_issue_activity(advisory_issue_id);

-- Enable RLS
alter table public.advisory_issues enable row level security;
alter table public.advisory_issue_notes enable row level security;
alter table public.advisory_issue_activity enable row level security;

-- RLS Policies for advisory_issues
create policy "Users can view own advisory issues"
on public.advisory_issues
for select using (auth.uid() = user_id);

create policy "Users can insert own advisory issues"
on public.advisory_issues
for insert with check (auth.uid() = user_id);

create policy "Users can update own advisory issues"
on public.advisory_issues
for update using (auth.uid() = user_id);

create policy "Users can delete own advisory issues"
on public.advisory_issues
for delete using (auth.uid() = user_id);

-- RLS Policies for advisory_issue_notes
create policy "Users can view notes for own advisory issues"
on public.advisory_issue_notes
for select using (
  exists (
    select 1 from public.advisory_issues
    where advisory_issues.id = advisory_issue_notes.advisory_issue_id
      and advisory_issues.user_id = auth.uid()
  )
);

create policy "Users can insert notes for own advisory issues"
on public.advisory_issue_notes
for insert with check (
  exists (
    select 1 from public.advisory_issues
    where advisory_issues.id = advisory_issue_notes.advisory_issue_id
      and advisory_issues.user_id = auth.uid()
  )
);

create policy "Users can update notes for own advisory issues"
on public.advisory_issue_notes
for update using (
  exists (
    select 1 from public.advisory_issues
    where advisory_issues.id = advisory_issue_notes.advisory_issue_id
      and advisory_issues.user_id = auth.uid()
  )
);

create policy "Users can delete notes for own advisory issues"
on public.advisory_issue_notes
for delete using (
  exists (
    select 1 from public.advisory_issues
    where advisory_issues.id = advisory_issue_notes.advisory_issue_id
      and advisory_issues.user_id = auth.uid()
  )
);

-- RLS Policies for advisory_issue_activity
create policy "Users can view activity for own advisory issues"
on public.advisory_issue_activity
for select using (
  exists (
    select 1 from public.advisory_issues
    where advisory_issues.id = advisory_issue_activity.advisory_issue_id
      and advisory_issues.user_id = auth.uid()
  )
);

create policy "Users can insert activity for own advisory issues"
on public.advisory_issue_activity
for insert with check (
  exists (
    select 1 from public.advisory_issues
    where advisory_issues.id = advisory_issue_activity.advisory_issue_id
      and advisory_issues.user_id = auth.uid()
  )
);

-- Add origin tracking to cases table for traceability
alter table public.cases add column if not exists origin_advisory_issue_id uuid references public.advisory_issues(id);
create index if not exists idx_cases_origin_advisory_issue on public.cases(origin_advisory_issue_id);
