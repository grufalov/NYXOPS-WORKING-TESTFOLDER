-- Quick Fix for Missing Columns - Execute these one by one in Supabase SQL Editor
-- Or copy to clipboard and run in database

-- 1. Fix my_desk_checklist table
ALTER TABLE my_desk_checklist ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE my_desk_checklist ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;  
ALTER TABLE my_desk_checklist ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
ALTER TABLE my_desk_checklist ADD COLUMN IF NOT EXISTS last_done_on DATE;

-- 2. Fix my_desk_tasks table
ALTER TABLE my_desk_tasks ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE my_desk_tasks ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
ALTER TABLE my_desk_tasks ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'medium';

-- 3. Fix my_desk_notes table  
ALTER TABLE my_desk_notes ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'daily';
ALTER TABLE my_desk_notes ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;

-- 4. Copy existing data to new columns
UPDATE my_desk_checklist SET completed = is_completed WHERE completed IS NULL;
UPDATE my_desk_tasks SET completed = is_completed WHERE completed IS NULL;

-- 5. Enable RLS on tables (if not already enabled)
ALTER TABLE my_desk_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_desk_tasks ENABLE ROW LEVEL SECURITY; 
ALTER TABLE my_desk_notes ENABLE ROW LEVEL SECURITY;
