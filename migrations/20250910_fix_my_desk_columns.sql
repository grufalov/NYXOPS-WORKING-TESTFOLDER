-- My Desk Tables Missing Columns Migration
-- Date: 2025-09-10
-- Description: Adds missing columns for Dashboard v2 My Desk functionality

-- Add missing columns to my_desk_checklist table
ALTER TABLE my_desk_checklist 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_done_on DATE;

-- Update existing data to match new column names
UPDATE my_desk_checklist SET completed = is_completed WHERE completed IS NULL;
UPDATE my_desk_checklist SET order_index = sort_order WHERE order_index IS NULL;

-- Add missing columns to my_desk_tasks table  
ALTER TABLE my_desk_tasks
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent'));

-- Update existing data to match new column names
UPDATE my_desk_tasks SET completed = is_completed WHERE completed IS NULL;
UPDATE my_desk_tasks SET priority_level = priority WHERE priority_level IS NULL;

-- Add missing columns to my_desk_notes table
ALTER TABLE my_desk_notes
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'daily',
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;

-- Create index for better performance on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_my_desk_checklist_user_order ON my_desk_checklist(user_id, order_index);
CREATE INDEX IF NOT EXISTS idx_my_desk_tasks_user_completed ON my_desk_tasks(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_my_desk_tasks_user_due_date ON my_desk_tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_my_desk_notes_user_type ON my_desk_notes(user_id, type);

-- Create triggers for updated_at columns if they don't exist
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all my_desk tables
DROP TRIGGER IF EXISTS set_timestamp_my_desk_checklist ON my_desk_checklist;
CREATE TRIGGER set_timestamp_my_desk_checklist
    BEFORE UPDATE ON my_desk_checklist
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_my_desk_tasks ON my_desk_tasks;
CREATE TRIGGER set_timestamp_my_desk_tasks
    BEFORE UPDATE ON my_desk_tasks
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_my_desk_notes ON my_desk_notes;
CREATE TRIGGER set_timestamp_my_desk_notes
    BEFORE UPDATE ON my_desk_notes
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();

-- Enable Row Level Security (RLS) on all my_desk tables
ALTER TABLE my_desk_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_desk_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_desk_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_desk_quick_capture ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for my_desk_checklist
CREATE POLICY "Users can view their own checklist items" ON my_desk_checklist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checklist items" ON my_desk_checklist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklist items" ON my_desk_checklist
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklist items" ON my_desk_checklist
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for my_desk_tasks
CREATE POLICY "Users can view their own tasks" ON my_desk_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON my_desk_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON my_desk_tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON my_desk_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for my_desk_notes
CREATE POLICY "Users can view their own notes" ON my_desk_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON my_desk_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON my_desk_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON my_desk_notes
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for my_desk_quick_capture
CREATE POLICY "Users can view their own quick capture items" ON my_desk_quick_capture
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quick capture items" ON my_desk_quick_capture
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quick capture items" ON my_desk_quick_capture
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quick capture items" ON my_desk_quick_capture
    FOR DELETE USING (auth.uid() = user_id);
