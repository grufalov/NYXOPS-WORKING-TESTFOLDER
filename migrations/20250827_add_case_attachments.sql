-- Migration: Add case attachments support
-- Created: August 27, 2025
-- Purpose: Add file attachment support for cases using Supabase Storage

create table if not exists public.case_attachments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  original_filename text not null,
  sanitized_filename text not null,
  storage_path text not null,
  mime_type text not null,
  file_size integer not null check (file_size > 0 and file_size <= 25 * 1024 * 1024),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create index if not exists idx_case_attachments_case_id on public.case_attachments(case_id);
create index if not exists idx_case_attachments_created_at on public.case_attachments(created_at desc);

alter table public.case_attachments enable row level security;

create policy "read own case attachments"
on public.case_attachments
for select using (
  exists (
    select 1 from public.cases
    where cases.id = case_attachments.case_id
      and cases.user_id = auth.uid()
  )
);

create policy "insert own case attachments"
on public.case_attachments
for insert with check (
  exists (
    select 1 from public.cases
    where cases.id = case_attachments.case_id
      and cases.user_id = auth.uid()
  )
);

create policy "delete own case attachments"
on public.case_attachments
for delete using (
  exists (
    select 1 from public.cases
    where cases.id = case_attachments.case_id
      and cases.user_id = auth.uid()
  )
);

-- Comment: Manual step required - create private bucket 'case-attachments' in Supabase Storage
