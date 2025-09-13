# Dashboard v2 Daily Cockpit - Usage Guide

## Overview
The merged Dashboard serves as your daily cockpit, providing a comprehensive view of morning checklist, tasks, KPIs, and quick notes in a structured 5-column layout.

## Layout Structure

### Desktop Layout (XL screens)
```
┌─────────────────────────────────────────┐
│              Quote Bar                  │ 
├─────────────────┬───────────────────────┤
│ Morning         │ Task List Full        │ 
│ Checklist       │ (Search, Tabs,        │
│ (2 columns)     │  Pagination)          │
│                 │ (3 columns)           │
├─────────────────┼───────────────────────┤  
│ KPI Stack:      │ Quick Notes           │ 
│ • Open Cases    │ (Autosave)            │
│ • Projects      │ (3 columns)           │
│ • Roles at Risk │                       │
│ (2 columns)     │                       │
└─────────────────┴───────────────────────┘
```

### Mobile Layout (Stacked)
1. Quote Bar
2. Morning Checklist
3. Task List Full  
4. KPI Cards (3 individual cards)
5. Quick Notes

## Component Usage Guide

### 1. Morning Checklist Card

#### Daily Reset Feature
- **Automatic Reset**: Checklist automatically resets each day
- **Last Completed**: System tracks when you last worked on checklist
- **Fresh Start**: Each morning shows unchecked items for new day

#### Getting Started (New Users)
The system automatically seeds 14 default checklist items:
- Email inbox review
- Calendar review for today
- Priority task identification
- Team meeting prep
- Client follow-ups check
- Document review queue
- System status checks
- Training/learning time
- Strategic planning review
- Administrative tasks
- Personal development
- Health/break reminders
- End-of-day preparation
- Tomorrow's priorities setup

#### Using the Checklist
- **Check Items**: Click checkbox to mark items complete
- **Reorder Items**: Use ↑/↓ arrows to prioritize your workflow
- **Progress Tracking**: Header shows completion ratio (X/14)
- **Sticky Header**: Header remains visible when scrolling

### 2. Task List Full Card

#### Tab Navigation
- **All**: View all tasks regardless of status
- **Active**: Filter to show only incomplete tasks  
- **Completed**: View completed tasks
- **Counters**: Each tab shows item count in real-time

#### Search Functionality
- **Debounced Search**: Type in search box - results appear after 300ms
- **Clear Search**: Click X button to clear search and show all tasks
- **Real-time Filtering**: Search filters current tab's tasks

#### Task Management
- **Add New Task**: Press `Alt+N` to quickly add a new task
- **Inline Editing**: Click task title to edit directly
- **Save/Cancel**: `Ctrl+S` to save, `Esc` to cancel editing
- **Task Priorities**: Assign Low, Medium, High, or Urgent priority levels
- **Completion**: Check tasks to mark complete and move to Completed tab

#### Bulk Actions
- **Select Multiple**: Use checkboxes to select multiple tasks
- **Bulk Complete**: Complete multiple tasks at once with bulk action button
- **Visual Feedback**: Selected tasks highlighted for easy identification

#### Pagination
- **10 Items per Page**: Tasks are paginated for performance
- **Navigation**: Use Previous/Next buttons to navigate pages
- **Page Indicators**: Current page and total pages displayed

### 3. KPI Cards Stack

#### Clickable Navigation
Each KPI card serves as navigation shortcut:
- **Open Cases**: Click to go directly to Cases tab
- **Active Projects**: Click to go directly to Projects tab  
- **Roles at Risk**: Click to go directly to Roles at Risk tab

#### Understanding KPI States
- **Loading**: Shows skeleton animation while loading data
- **Zero State**: Shows "All clear" when count is 0
- **Error State**: Shows error message with retry button
- **Normal State**: Shows count with "Click to view" hint

#### Visual Feedback
- **Hover Effects**: Cards scale slightly and shadow increases on hover
- **Accessibility**: Cards are keyboard navigable with Tab key
- **Focus States**: Clear focus indicators for keyboard navigation

### 4. Quick Notes Card

#### Autosave Feature
- **Automatic Saving**: Notes save automatically 600ms after you stop typing
- **Save Indicator**: Visual indicator shows when notes are being saved
- **Force Save**: Press `Ctrl+S` to immediately save current changes

#### Note Management
- **Character Counter**: Real-time character count displayed
- **Persistent Storage**: Notes are tied to your user account
- **Error Recovery**: If save fails, you can retry manually
- **Daily Notes**: Notes are categorized as 'daily' type for organization

## Keyboard Shortcuts

### Task List Shortcuts
- `Alt+N`: Add new task quickly
- `Ctrl+S`: Save current task edit
- `Esc`: Cancel current task edit

### Quick Notes Shortcuts  
- `Ctrl+S`: Force save notes immediately

### Navigation Shortcuts
- `Tab`: Navigate between interactive elements
- `Enter/Space`: Activate focused KPI cards

## Data Management

### Daily Workflow
1. **Morning**: Review checklist, set priorities with reordering
2. **Task Planning**: Add tasks for the day, set priorities
3. **Progress Tracking**: Check off completed checklist items and tasks
4. **Note Taking**: Capture thoughts and reminders in Quick Notes
5. **KPI Monitoring**: Check case/project/role counts via KPI cards

### Data Persistence
- **Checklist**: Resets daily but tracks completion progress
- **Tasks**: Persist across sessions with full CRUD capabilities
- **Notes**: Autosaved and persistent across sessions
- **KPIs**: Real-time data from your Cases, Projects, and Roles at Risk

### Search and Organization
- **Task Search**: Find tasks quickly by title/description
- **Priority Levels**: Organize tasks by importance (Low → Urgent)
- **Completion Tracking**: Visual separation of active vs completed work
- **Reordering**: Customize checklist to match your workflow

## Troubleshooting

### Common Issues
- **Loading Problems**: Check internet connection, retry if KPIs show errors
- **Save Issues**: Notes/tasks not saving? Check connection and try force save
- **Search Not Working**: Clear search and try again, ensure 300ms typing delay
- **Layout Issues**: Refresh page if layout appears broken

### Error Recovery
- **Retry Buttons**: All error states provide retry functionality
- **Manual Save**: Use Ctrl+S if autosave fails
- **Page Refresh**: Refresh page to reset component states if needed

## Tips for Daily Use

### Workflow Optimization
1. **Start with Checklist**: Begin each day by reviewing and reordering checklist
2. **Batch Similar Tasks**: Group similar tasks together for efficient completion  
3. **Use Priorities**: Assign proper priority levels to focus on important work
4. **Quick Capture**: Use Quick Notes for immediate thought capture
5. **Regular KPI Checks**: Click KPI cards to quickly navigate to detailed views

### Productivity Features
- **Visual Progress**: Use completion counters to track daily progress
- **Search Efficiency**: Use task search to quickly find specific items
- **Bulk Operations**: Use bulk complete for efficient task management
- **Navigation Speed**: Use KPI cards as quick navigation shortcuts

---
**Quick Start**: The Dashboard automatically loads your data and seeds checklist items for new users. Simply start checking items off and adding tasks to begin your daily workflow!
