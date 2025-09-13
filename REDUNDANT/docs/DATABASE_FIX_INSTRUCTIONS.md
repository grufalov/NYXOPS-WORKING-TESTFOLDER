# Fix Database Columns - Manual Steps

## Problem
The Dashboard is showing these errors:
- `column my_desk_checklist.sort_order does not exist`
- `column my_desk_tasks.due_date does not exist` 
- `column my_desk_notes.pinned does not exist`

## Solution
We need to add the missing columns to the My Desk tables.

## Steps to Fix

### Option 1: Use Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor** (left sidebar)

2. **Run This SQL Code** (copy and paste all at once):

```sql
-- Add missing columns to my_desk_checklist
ALTER TABLE my_desk_checklist ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE my_desk_checklist ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;  
ALTER TABLE my_desk_checklist ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
ALTER TABLE my_desk_checklist ADD COLUMN IF NOT EXISTS last_done_on DATE;

-- Add missing columns to my_desk_tasks
ALTER TABLE my_desk_tasks ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE my_desk_tasks ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
ALTER TABLE my_desk_tasks ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'medium';

-- Add missing columns to my_desk_notes  
ALTER TABLE my_desk_notes ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'daily';
ALTER TABLE my_desk_notes ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;

-- Copy existing data to new columns (if needed)
UPDATE my_desk_checklist SET completed = is_completed WHERE completed IS NULL;
UPDATE my_desk_tasks SET completed = is_completed WHERE completed IS NULL;
```

3. **Click "Run"** to execute the SQL

4. **Refresh your Dashboard** - the errors should be gone!

### Option 2: Run Individual Commands

If you prefer to run commands one by one, execute these in order:

```sql
-- 1. Fix checklist table
ALTER TABLE my_desk_checklist ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
```

```sql
-- 2. Fix tasks table  
ALTER TABLE my_desk_tasks ADD COLUMN IF NOT EXISTS due_date DATE;
```

```sql
-- 3. Fix notes table
ALTER TABLE my_desk_notes ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT false;
```

## Verification

After running the SQL, you should see:
- ✅ Morning Checklist loads without errors
- ✅ Task List loads without errors  
- ✅ Quick Notes loads without errors
- ✅ All Dashboard components functional

## What These Columns Do

- **`sort_order`/`order_index`**: Allow reordering checklist items with up/down arrows
- **`due_date`**: Enable due date functionality for tasks  
- **`completed`**: Boolean flag for completion status (cleaner than is_completed)
- **`last_done_on`**: Track when checklist was last completed (for daily reset)
- **`pinned`**: Allow pinning important notes
- **`type`**: Categorize notes (daily, project, etc.)
- **`priority_level`**: Enhanced priority system (low, medium, high, urgent)

## After the Fix

Once you run the migration:
1. Refresh the Dashboard page
2. The red error messages should disappear
3. You can start using all the new Dashboard features:
   - ✅ Morning checklist with reordering
   - ✅ Task management with due dates
   - ✅ Quick notes with autosave
   - ✅ KPI navigation

---
**Quick Copy**: The complete SQL code is also available in `QUICK_FIX_SQL.sql` file for easy copying.
