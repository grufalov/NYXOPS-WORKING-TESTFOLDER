-- Migration: 20250912_projects_next_steps_enhancement.sql
-- Description: Enhance projects table for Next Steps callout and improved tracking

-- Add/Update columns for projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS next_steps JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS stakeholders TEXT,
ADD COLUMN IF NOT EXISTS period_from DATE,
ADD COLUMN IF NOT EXISTS period_to DATE,
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS checklists JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS notes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for better performance on pinned projects
CREATE INDEX IF NOT EXISTS idx_projects_pinned ON projects(pinned) WHERE pinned = true;

-- Create index for updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_projects_updated_at ON projects;
CREATE TRIGGER trigger_update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_projects_updated_at();

-- Ensure only one project can be pinned at a time
CREATE OR REPLACE FUNCTION ensure_single_pinned_project()
RETURNS TRIGGER AS $$
BEGIN
    -- If this project is being pinned, unpin all others
    IF NEW.pinned = true AND (OLD.pinned IS NULL OR OLD.pinned = false) THEN
        UPDATE projects 
        SET pinned = false 
        WHERE id != NEW.id AND pinned = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ensure_single_pinned_project ON projects;
CREATE TRIGGER trigger_ensure_single_pinned_project
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_pinned_project();

-- Sample data structure for next_steps
COMMENT ON COLUMN projects.next_steps IS 'JSON array of steps: [{"id": "uuid", "title": "Task", "done": false, "due": "2025-09-15", "created_at": "timestamp"}]';

-- Sample data structure for checklists  
COMMENT ON COLUMN projects.checklists IS 'JSON array of checklist groups: [{"id": "uuid", "title": "Group", "items": [{"id": "uuid", "title": "Item", "done": false}]}]';

-- Sample data structure for notes
COMMENT ON COLUMN projects.notes IS 'JSON array of notes: [{"id": "uuid", "text": "Note content", "created_at": "timestamp"}]';
