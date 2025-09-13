-- My Desk Tables Migration
-- Date: 2025-09-10
-- Description: Creates tables for My Desk functionality including checklist, tasks, notes, quick capture, and settings

-- Create my_desk_checklist table
CREATE TABLE IF NOT EXISTS my_desk_checklist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    item_text TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    date_created DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create my_desk_tasks table
CREATE TABLE IF NOT EXISTS my_desk_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    tags TEXT[],
    is_completed BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create my_desk_notes table
CREATE TABLE IF NOT EXISTS my_desk_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT DEFAULT '',
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create my_desk_quick_capture table
CREATE TABLE IF NOT EXISTS my_desk_quick_capture (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create my_desk_settings table
CREATE TABLE IF NOT EXISTS my_desk_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    pin_hash TEXT,
    last_checklist_reset DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on all my_desk tables
ALTER TABLE my_desk_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_desk_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_desk_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_desk_quick_capture ENABLE ROW LEVEL SECURITY;
ALTER TABLE my_desk_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for my_desk_checklist
CREATE POLICY "Users can view own checklist items" ON my_desk_checklist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checklist items" ON my_desk_checklist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklist items" ON my_desk_checklist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklist items" ON my_desk_checklist FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for my_desk_tasks
CREATE POLICY "Users can view own tasks" ON my_desk_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON my_desk_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON my_desk_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON my_desk_tasks FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for my_desk_notes
CREATE POLICY "Users can view own notes" ON my_desk_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON my_desk_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON my_desk_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON my_desk_notes FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for my_desk_quick_capture
CREATE POLICY "Users can view own quick capture items" ON my_desk_quick_capture FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quick capture items" ON my_desk_quick_capture FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quick capture items" ON my_desk_quick_capture FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quick capture items" ON my_desk_quick_capture FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for my_desk_settings
CREATE POLICY "Users can view own settings" ON my_desk_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON my_desk_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON my_desk_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON my_desk_settings FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_my_desk_checklist_user_id ON my_desk_checklist(user_id);
CREATE INDEX IF NOT EXISTS idx_my_desk_checklist_date_created ON my_desk_checklist(date_created);
CREATE INDEX IF NOT EXISTS idx_my_desk_checklist_user_date ON my_desk_checklist(user_id, date_created);

CREATE INDEX IF NOT EXISTS idx_my_desk_tasks_user_id ON my_desk_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_my_desk_tasks_created_at ON my_desk_tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_my_desk_tasks_user_deleted ON my_desk_tasks(user_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_my_desk_tasks_user_completed ON my_desk_tasks(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_my_desk_tasks_priority ON my_desk_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_my_desk_tasks_tags ON my_desk_tasks USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_my_desk_notes_user_id ON my_desk_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_my_desk_notes_last_activity ON my_desk_notes(last_activity);

CREATE INDEX IF NOT EXISTS idx_my_desk_quick_capture_user_id ON my_desk_quick_capture(user_id);
CREATE INDEX IF NOT EXISTS idx_my_desk_quick_capture_created_at ON my_desk_quick_capture(created_at);
CREATE INDEX IF NOT EXISTS idx_my_desk_quick_capture_processed ON my_desk_quick_capture(is_processed);

CREATE INDEX IF NOT EXISTS idx_my_desk_settings_user_id ON my_desk_settings(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at timestamps
CREATE TRIGGER update_my_desk_checklist_updated_at BEFORE UPDATE ON my_desk_checklist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_my_desk_tasks_updated_at BEFORE UPDATE ON my_desk_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_my_desk_notes_updated_at BEFORE UPDATE ON my_desk_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_my_desk_settings_updated_at BEFORE UPDATE ON my_desk_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically cleanup old deleted tasks (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_deleted_tasks()
RETURNS void AS $$
BEGIN
    DELETE FROM my_desk_tasks 
    WHERE is_deleted = true 
    AND deleted_at < (now() - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;

-- Note: To schedule automatic cleanup, you would set up a cron job or use pg_cron extension
-- For manual cleanup, run: SELECT cleanup_old_deleted_tasks();

-- Create function to get user's active task count
CREATE OR REPLACE FUNCTION get_user_active_task_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM my_desk_tasks
        WHERE user_id = user_uuid
        AND is_completed = false
        AND is_deleted = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has reached task limit
CREATE OR REPLACE FUNCTION check_user_task_limit(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    active_count INTEGER;
    result JSON;
BEGIN
    SELECT get_user_active_task_count(user_uuid) INTO active_count;
    
    result := json_build_object(
        'count', active_count,
        'warning', active_count >= 400,
        'limit_reached', active_count >= 500
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
