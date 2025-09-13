# Projects Next Steps Enhancement Migration

## Overview
This migration enhances the projects table to support the refined Projects view requirements including Next Steps, improved progress tracking, and better persistence.

## SQL Migration

```sql
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
```

## Data Structure Examples

### Next Steps Format
```json
[
  {
    "id": "step_1",
    "title": "Review initial proposal",
    "done": false,
    "due": "2025-09-15",
    "created_at": "2025-09-12T10:00:00Z"
  },
  {
    "id": "step_2", 
    "title": "Schedule stakeholder meeting",
    "done": true,
    "due": null,
    "created_at": "2025-09-10T14:30:00Z"
  }
]
```

### Checklists Format
```json
[
  {
    "id": "checklist_1",
    "title": "Documentation",
    "items": [
      {"id": "item_1", "title": "Write specification", "done": true},
      {"id": "item_2", "title": "Create user guide", "done": false}
    ]
  }
]
```

### Notes Format
```json
[
  {
    "id": "note_1",
    "text": "Client prefers timeline moved to Q1 2025",
    "created_at": "2025-09-12T09:15:00Z"
  }
]
```

## Progress Calculation Logic

The progress percentage follows this hierarchy:
1. **If checklists exist**: `(completed_items / total_items) * 100`
2. **Else if next_steps exist**: `(completed_steps / total_steps) * 100`  
3. **Else**: `0%` with helper text "Add steps to start tracking progress"

## Period Formatting

- **Display**: "DD Mon YYYY – DD Mon YYYY" or "DD Mon YYYY – Present"
- **Storage**: Store actual dates in `period_from` and `period_to` columns
- **Validation**: Ensure `period_from <= period_to` when both are set

## Pin Behavior

- Only one project can be pinned at a time
- Pinning a project automatically unpins others
- Pin state persists in database and localStorage (`nx_pinned_project`)
- Pinned projects appear as focus card, others in grid

## Migration Notes

- All new columns have sensible defaults
- Existing projects will have empty arrays for JSONB fields
- Triggers ensure data consistency
- Indexes improve query performance
- Function comments document expected JSON structure
