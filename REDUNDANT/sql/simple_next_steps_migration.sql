-- Simple migration to convert next_steps from JSONB to TEXT
-- Since all your projects have empty next_steps arrays, this is straightforward

-- Step 1: Create backup (optional)
CREATE TABLE IF NOT EXISTS projects_next_steps_backup AS 
SELECT id, next_steps FROM projects;

-- Step 2: Set all empty arrays to NULL
UPDATE projects 
SET next_steps = NULL 
WHERE next_steps = '[]'::jsonb;

-- Step 3: Change column type from JSONB to TEXT
ALTER TABLE projects 
ALTER COLUMN next_steps TYPE TEXT 
USING NULL;

-- Step 4: Update column default for new projects
ALTER TABLE projects 
ALTER COLUMN next_steps SET DEFAULT NULL;

-- Verification - check the conversion worked
SELECT 
    id, 
    title, 
    pg_typeof(next_steps) as next_steps_type,
    next_steps
FROM projects 
LIMIT 5;