-- Migration: Projects Comprehensive Fix
-- Date: 2025-09-12
-- Description: Ensure all Projects fields exist with proper constraints and indexes

-- UP Migration
BEGIN;

-- Ensure projects table exists with all required columns
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    background TEXT, -- Alternative field name for description
    summary TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'completed')),
    stakeholders TEXT, -- Comma-separated list for chip display
    period_from DATE,
    period_to DATE,
    pinned BOOLEAN DEFAULT FALSE,
    next_steps JSONB DEFAULT '[]'::jsonb,
    checklists JSONB DEFAULT '[]'::jsonb, -- For Project Goals
    notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- For "Updated" display
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add description if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'description') THEN
        ALTER TABLE projects ADD COLUMN description TEXT;
    END IF;
    
    -- Add background if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'background') THEN
        ALTER TABLE projects ADD COLUMN background TEXT;
    END IF;
    
    -- Add stakeholders if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'stakeholders') THEN
        ALTER TABLE projects ADD COLUMN stakeholders TEXT;
    END IF;
    
    -- Add period_from if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'period_from') THEN
        ALTER TABLE projects ADD COLUMN period_from DATE;
    END IF;
    
    -- Add period_to if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'period_to') THEN
        ALTER TABLE projects ADD COLUMN period_to DATE;
    END IF;
    
    -- Add pinned if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'pinned') THEN
        ALTER TABLE projects ADD COLUMN pinned BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Add next_steps if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'next_steps') THEN
        ALTER TABLE projects ADD COLUMN next_steps JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add checklists if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'checklists') THEN
        ALTER TABLE projects ADD COLUMN checklists JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add notes if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'notes') THEN
        ALTER TABLE projects ADD COLUMN notes JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Add last_updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'last_updated_at') THEN
        ALTER TABLE projects ADD COLUMN last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add constraints
ALTER TABLE projects 
    ADD CONSTRAINT IF NOT EXISTS check_period_order 
    CHECK (period_from IS NULL OR period_to IS NULL OR period_from <= period_to);

-- Ensure only one project can be pinned at a time
CREATE OR REPLACE FUNCTION enforce_single_pinned_project()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.pinned = TRUE THEN
        -- Unpin all other projects
        UPDATE projects SET pinned = FALSE WHERE id != NEW.id AND pinned = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for single pinned project
DROP TRIGGER IF EXISTS trigger_single_pinned_project ON projects;
CREATE TRIGGER trigger_single_pinned_project
    BEFORE UPDATE OF pinned ON projects
    FOR EACH ROW
    EXECUTE FUNCTION enforce_single_pinned_project();

-- Auto-update updated_at and last_updated_at on changes
CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating timestamps
DROP TRIGGER IF EXISTS trigger_update_projects_updated_at ON projects;
CREATE TRIGGER trigger_update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_projects_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_pinned ON projects(pinned) WHERE pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_last_updated_at ON projects(last_updated_at DESC);

COMMIT;

-- DOWN Migration (for rollback)
-- Note: This only removes what we added, preserving existing data
-- 
-- BEGIN;
-- 
-- -- Drop triggers
-- DROP TRIGGER IF EXISTS trigger_single_pinned_project ON projects;
-- DROP TRIGGER IF EXISTS trigger_update_projects_updated_at ON projects;
-- 
-- -- Drop functions
-- DROP FUNCTION IF EXISTS enforce_single_pinned_project();
-- DROP FUNCTION IF EXISTS update_projects_updated_at();
-- 
-- -- Drop indexes
-- DROP INDEX IF EXISTS idx_projects_status;
-- DROP INDEX IF EXISTS idx_projects_pinned;
-- DROP INDEX IF EXISTS idx_projects_updated_at;
-- DROP INDEX IF EXISTS idx_projects_last_updated_at;
-- 
-- -- Remove constraints
-- ALTER TABLE projects DROP CONSTRAINT IF EXISTS check_period_order;
-- 
-- COMMIT;