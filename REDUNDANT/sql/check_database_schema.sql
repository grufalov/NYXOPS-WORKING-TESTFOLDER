-- SQL queries to check your database schema in Supabase SQL Editor
-- Copy and paste these one by one to verify everything is set up correctly

-- 1. Check if all required columns exist in projects table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

-- 2. Check existing projects and their next_steps format
SELECT 
    id, 
    title, 
    pg_typeof(next_steps) as next_steps_type,
    next_steps,
    stakeholders,
    period_from,
    period_to,
    created_at
FROM projects 
LIMIT 5;

-- 3. Check table constraints (including the period_order constraint)
SELECT 
    constraint_name, 
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'projects';

-- 4. Count total projects
SELECT COUNT(*) as total_projects FROM projects;

-- 5. Check projects with different next_steps formats
SELECT 
    'Array format' as format_type,
    COUNT(*) as count
FROM projects 
WHERE pg_typeof(next_steps) = 'jsonb'::regtype 
  AND jsonb_typeof(next_steps) = 'array'
UNION ALL
SELECT 
    'String format' as format_type,
    COUNT(*) as count
FROM projects 
WHERE pg_typeof(next_steps) = 'text'::regtype
UNION ALL
SELECT 
    'Null/Empty' as format_type,
    COUNT(*) as count
FROM projects 
WHERE next_steps IS NULL;