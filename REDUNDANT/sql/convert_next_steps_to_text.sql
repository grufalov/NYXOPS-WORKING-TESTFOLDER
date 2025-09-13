-- Migration to convert next_steps column from JSONB to TEXT
-- This will enable the new modal-based Next Steps functionality
-- Run this in Supabase SQL Editor after backing up your data

-- Step 1: Create a backup of existing next_steps data
CREATE TABLE IF NOT EXISTS projects_next_steps_backup AS 
SELECT id, next_steps FROM projects WHERE next_steps IS NOT NULL;

-- Step 2: Convert existing JSONB array next_steps to TEXT format
-- Since your projects currently have empty arrays [], we'll skip this step
-- and just handle the column type conversion

-- UPDATE projects 
-- SET next_steps = (
--   SELECT string_agg(
--     CASE 
--       WHEN (step->>'done')::boolean THEN '✓ ' || (step->>'title')
--       ELSE '○ ' || (step->>'title')
--     END, 
--     E'\n' 
--     ORDER BY ordinality
--   )
--   FROM jsonb_array_elements(next_steps) WITH ORDINALITY AS step
-- )::text
-- WHERE jsonb_typeof(next_steps) = 'array' 
--   AND jsonb_array_length(next_steps) > 0;

-- Since all your projects have empty arrays, we can skip the conversion step

-- Step 3: Set empty arrays to NULL
UPDATE projects 
SET next_steps = NULL 
WHERE next_steps = '[]'::jsonb;

-- Step 4: Change column type from JSONB to TEXT
ALTER TABLE projects 
ALTER COLUMN next_steps TYPE TEXT 
USING CASE 
  WHEN next_steps IS NULL THEN NULL
  WHEN jsonb_typeof(next_steps) = 'array' THEN 
    CASE 
      WHEN jsonb_array_length(next_steps) = 0 THEN NULL
      ELSE next_steps::text
    END
  ELSE next_steps::text
END;

-- Step 5: Update column default
ALTER TABLE projects 
ALTER COLUMN next_steps SET DEFAULT NULL;

-- Verification query - run this to check the conversion
SELECT 
    id, 
    title, 
    pg_typeof(next_steps) as next_steps_type,
    next_steps,
    length(next_steps) as text_length
FROM projects 
WHERE next_steps IS NOT NULL
LIMIT 5;