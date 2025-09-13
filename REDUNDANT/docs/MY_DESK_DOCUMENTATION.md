# My Desk - Feature Documentation

## Overview
My Desk is a personal productivity workspace that provides users with daily task management, quick note-taking, and personal organization tools. It serves as a private, PIN-protected space for individual productivity within the larger project management system.

## Page Structure & Sections

### 1. Morning Checklist
**Purpose**: Daily recurring tasks that reset each day with intelligent carryover.

**Features**:
- ✅ Simple checkbox interface for daily tasks
- 🔄 Automatic daily reset at midnight with user confirmation
- 📝 Smart carryover: prompts user to move unchecked items to next day
- 📅 Date-specific tracking to prevent duplicate resets
- ➕ Add/edit/delete checklist items
- 🎯 Focus on routine daily activities

**User Experience**:
- Items appear checked/unchecked based on completion status
- Reset confirmation dialog appears on first visit after midnight
- Carryover dialog shows unchecked items from previous day
- Clean, minimal interface focused on quick daily review

### 2. Quick Capture
**Purpose**: Rapid text input for capturing thoughts, ideas, and quick notes.

**Features**:
- ⚡ Plain text input area for immediate note capture
- ⌨️ Keyboard shortcuts: Enter = new line, Ctrl+Enter = save as task
- 🔄 Auto-save functionality for preventing data loss
- 🎯 Convert captured text to formal tasks with one click
- 📝 Timestamp tracking for all entries
- 🗑️ Clear/archive processed items

**User Experience**:
- Instant focus on page load for immediate typing
- Visual feedback for save operations
- Seamless conversion to task list
- Mobile-optimized touch interface

### 3. Personal Notes (Scratchpad)
**Purpose**: Free-form note-taking with Markdown support for longer content.

**Features**:
- 📝 Full Markdown editor with live preview
- 🛠️ Toolbar with common formatting options (bold, italic, headers, lists)
- 👁️ Toggle between edit and preview modes
- 💾 Auto-save every 30 seconds
- 🕒 Last activity timestamp display
- 📱 Mobile-responsive editor

**Markdown Toolbar**:
- Bold, Italic, Strikethrough
- Headers (H1, H2, H3)
- Bulleted and numbered lists
- Links and code blocks
- Preview toggle button

**User Experience**:
- Split-screen or tabbed edit/preview interface
- Keyboard shortcuts for common formatting
- Visual indicators for unsaved changes
- Seamless mobile editing experience

### 4. Task List
**Purpose**: Comprehensive personal task management with priority and organization features.

**Features**:
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- 🎯 Priority levels: Low (green), Medium (yellow), High (red)
- 🏷️ Tag system with autocomplete from existing tags
- 📝 Lightweight description field for context
- ☑️ Completion checkboxes with visual feedback
- 📊 Bulk operations: select multiple tasks for mass actions
- 🗑️ Soft delete with 7-day trash bin recovery
- ⚠️ Task limit management: warning at 400, soft cap at 500

**Task Fields**:
- **Title**: Required, main task description
- **Priority**: Low/Medium/High with color coding
- **Tags**: Multi-select with autocomplete
- **Description**: Optional lightweight context
- **Completed**: Boolean status with date tracking

**Bulk Operations**:
- Select all/none toggles
- Bulk mark as complete/incomplete
- Bulk delete to trash
- Bulk tag assignment
- Bulk priority changes

## Privacy & Security Features

### PIN Protection
- 🔐 4-6 digit PIN required to access My Desk
- 🔒 PIN stored as bcrypt hash in database
- ⏱️ Session-based authentication (expires on app close)
- 🔄 PIN reset option via email verification
- 🚫 Rate limiting on PIN attempts (3 attempts per 15 minutes)

### Data Security
- 🛡️ Row Level Security (RLS) ensures users only see their own data
- 🔒 All database operations require authenticated user context
- 💾 Soft deletes allow data recovery within 7-day window
- 🧹 Automatic cleanup of old deleted items after 7 days

## Mobile Experience

### Responsive Design
- 📱 **Mobile View**: Condensed tabbed interface
  - Tab 1: Checklist & Quick Capture
  - Tab 2: Task List
  - Tab 3: Personal Notes
- 💻 **Desktop View**: Full 4-section grid layout
- 👆 Touch-optimized controls and spacing
- 📏 Responsive breakpoints for different screen sizes

### Mobile-Specific Features
- Swipe gestures for task completion
- Touch-friendly checkboxes and buttons
- Optimized keyboard for text input
- Streamlined navigation between sections

## Data Model & Business Rules

### Morning Checklist Rules
- Items are date-specific (tied to creation date)
- Reset occurs once per day with user confirmation
- Unchecked items from previous day trigger carryover prompt
- Maximum 20 checklist items per user (soft limit)

### Task Management Rules
- Task limit: 500 active tasks (soft cap)
- Warning displayed at 400 active tasks
- Deleted tasks move to trash bin (is_deleted = true)
- Trash bin automatically empties after 7 days
- Priority levels affect sort order and visual display

### Quick Capture Rules
- Items are timestamped for chronological tracking
- Processed items can be archived or deleted
- Maximum 100 unprocessed quick capture items
- Auto-conversion to tasks preserves original timestamp

### Personal Notes Rules
- Single notes document per user (updates existing)
- Auto-save triggers every 30 seconds when content changes
- Last activity timestamp updates on any modification
- Maximum note size: 50,000 characters

## Integration with Main Application

### Navigation Integration
- Added to main sidebar as "My Desk" with Clipboard icon
- Positioned between existing navigation items
- Shows active task count badge when tasks exist
- Maintains theme consistency (dark/light mode)

### Sidebar Badge
- Displays count of incomplete, non-deleted tasks
- Updates in real-time as tasks are created/completed
- Hidden when count is zero
- Clicking badge navigates directly to My Desk

### Data Loading Lifecycle
- Loads after user authentication
- Integrates with existing data refresh patterns
- Shares loading states and error handling
- Follows established Supabase connection patterns

## Performance Considerations

### Database Optimization
- Proper indexing on user_id, dates, and status fields
- Composite indexes for common query patterns
- Pagination for large task lists (50 items per page)
- Efficient soft delete queries excluding deleted items

### Frontend Optimization
- Lazy loading of non-critical components
- Debounced auto-save functions (500ms delay)
- Optimistic UI updates for immediate feedback
- Virtual scrolling for large task lists
- Local state management for real-time responsiveness

### Memory Management
- Cleanup of event listeners on component unmount
- Efficient re-rendering with proper dependency arrays
- Memoization of expensive calculations
- Proper cleanup of auto-save timers

## Error Handling & Edge Cases

### PIN Authentication
- Invalid PIN attempts tracked and rate limited
- Clear error messages for authentication failures
- Graceful handling of session expiration
- Fallback to app logout if PIN system fails

### Data Operations
- Network failure handling with retry logic
- Conflict resolution for concurrent edits
- Graceful degradation when offline
- Clear user feedback for all operations

### Limit Enforcement
- Soft warnings before hard limits
- Graceful handling when limits reached
- Clear messaging about why actions are blocked
- Options for resolving limit issues (delete old tasks)

## Future Enhancement Opportunities

### V2 Features (Not in Initial Release)
- 📊 Export functionality (PDF, CSV, Markdown)
- 📅 Task scheduling and reminders
- 📈 Productivity analytics and insights
- 🔗 Integration with external calendar systems
- 📱 Native mobile app with offline sync
- 🤝 Selective task sharing with team members

### Advanced Capabilities
- Voice-to-text for quick capture
- AI-powered task suggestions
- Habit tracking integration
- Custom themes and layouts
- Advanced search and filtering
- Time tracking for tasks

## Technical Specifications

### Dependencies
- React 18+ with hooks
- Tailwind CSS for styling
- Lucide React for icons
- Supabase for database and authentication
- bcrypt for PIN hashing
- Markdown parser for notes rendering

### Browser Support
- Modern browsers with ES6+ support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive Web App (PWA) ready
- Responsive design for all screen sizes

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management for modal dialogs

## Support & Maintenance

### Monitoring
- Track PIN authentication success/failure rates
- Monitor task creation and completion patterns
- Database performance metrics
- Error logging and alerting

### Maintenance Tasks
- Regular cleanup of old deleted tasks
- PIN security audit (quarterly)
- Performance optimization reviews
- User feedback collection and analysis

## User Documentation

### Getting Started
1. Navigate to "My Desk" in the sidebar
2. Set up your 4-6 digit PIN for privacy
3. Start with Morning Checklist for daily routines
4. Use Quick Capture for immediate thoughts
5. Organize tasks with priorities and tags
6. Use Scratchpad for longer notes and planning

### Best Practices
- Review and reset checklist each morning
- Use Quick Capture throughout the day
- Regularly review and prioritize tasks
- Keep task descriptions concise but clear
- Use tags consistently for better organization
- Archive or delete completed tasks regularly

### Troubleshooting
- PIN issues: Use reset option or contact support
- Data not saving: Check internet connection
- Performance issues: Clear old tasks and notes
- Mobile issues: Use dedicated mobile tabs
- Sync problems: Refresh page or re-login
