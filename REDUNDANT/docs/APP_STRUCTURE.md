# NyxOps V2 - Application Structure

## Project Overview
A comprehensive case and project tracker built with React, Vite, Supabase, and Tailwind CSS.

## Root Directory Structure

```
NyxOps V2 - UIUX/
├── .env                                    # Environment variables (local)
├── .env.example                           # Environment variables template
├── .eslintrc.cjs                          # ESLint configuration
├── .gitignore                             # Git ignore rules
├── index.html                             # Main HTML template
├── package.json                           # Project dependencies and scripts
├── package-lock.json                      # Locked dependency versions
├── postcss.config.js                      # PostCSS configuration
├── tailwind.config.js                     # Tailwind CSS configuration
├── vite.config.js                         # Vite build configuration
├── run-migration.js                       # Database migration runner
├── deploy.ps1                             # PowerShell deployment script
├── deploy.sh                              # Bash deployment script
├── QUICK_FIX_SQL.sql                      # Quick database fixes
└── README.md                              # Project documentation
```

## Documentation Files

```
docs/
├── ADVISORY_IMPLEMENTATION_SUMMARY.md     # Advisory issues implementation summary
├── ADVISORY_ISSUES_IMPLEMENTATION.md      # Advisory issues implementation details
├── ADVISORY_ISSUES_V15_COMPLETE.md        # V15 advisory issues completion status
├── ADVISORY_ISSUES_V15_IMPLEMENTATION_PLAN.md # V15 implementation plan
├── CHANGED_FILES.md                       # File change tracking
├── COLOR_INVENTORY.md                     # Color scheme inventory
├── COLOR_PALETTE_IMPLEMENTATION_SUMMARY.md # Color implementation summary
├── CUSTOMIZATION_GUIDE.md                # Application customization guide
├── DATABASE_FIX_INSTRUCTIONS.md          # Database repair instructions
├── DEPLOYMENT_GUIDE.md                   # Deployment instructions
├── DEPLOYMENT_QA_PLAN.md                 # Quality assurance plan
├── MY_DESK_COMPLETE_SUMMARY.md           # My Desk feature summary
├── MY_DESK_DOCUMENTATION.md              # My Desk feature documentation
├── MY_DESK_IMPLEMENTATION_PLAN.md        # My Desk implementation plan
├── MY_DESK_SETUP_GUIDE.md                # My Desk setup instructions
├── New Plan_08Sept.md                    # September 8th planning document
├── SUPABASE_SETUP.md                     # Supabase configuration guide
├── TEST_PLAN.md                          # Testing strategy and plans
└── USAGE_NOTES.md                        # Application usage guidelines
```

## Configuration Directories

```
.github/
└── copilot-instructions.md               # GitHub Copilot workspace instructions

.vscode/
└── tasks.json                            # VS Code task configurations

dist/                                      # Build output directory (generated)
node_modules/                              # Dependencies (generated)
```

## Source Code Structure

```
src/
├── main.jsx                               # Application entry point
├── App.jsx                                # Main application component
├── App.jsx.backup                         # Application backup
├── index.css                              # Global styles
├── supabaseClient.js                      # Supabase client configuration
├── components/                            # Reusable components
├── config/                                # Application configuration
├── constants/                             # Application constants
├── hooks/                                 # Custom React hooks
├── modals/                                # Modal components
├── styles/                                # Additional stylesheets
├── utils/                                 # Utility functions
└── views/                                 # Page/view components
```

### Components Directory

```
src/components/
├── AdvisoryIssueCard.jsx                 # Advisory issue card component
├── AdvisoryIssueRow.jsx                  # Advisory issue table row
├── AdvisoryIssueTable.jsx                # Advisory issues table
├── BulkActionsBar.jsx                    # Bulk actions toolbar
├── CaseCard.jsx                          # Case display card
├── ErrorDrawer.jsx                       # Error notification drawer
├── ErrorInline.jsx                       # Inline error display
├── MarkdownEditor.jsx                    # Markdown text editor
├── MarkdownPreview.jsx                   # Markdown preview component
├── MarkdownToolbar.jsx                   # Markdown formatting toolbar
├── MarkdownToolbarFixed.jsx              # Fixed markdown toolbar
├── MarkdownToolbarV15.jsx                # V15 markdown toolbar
├── MarkdownToolbar_Clean.jsx             # Clean markdown toolbar
├── MorningChecklistSection.jsx           # Morning checklist component
├── NotesTimeline.jsx                     # Notes timeline display
├── PinAuthModal.jsx                      # PIN authentication modal
├── QuickCaptureSection.jsx               # Quick note capture
├── QuoteBar.jsx                          # Inspirational quote display
├── ScratchpadSection.jsx                 # Scratchpad area
├── SidebarErrorPill.jsx                  # Sidebar error indicator
├── SimpleLineChart.jsx                   # Simple chart component
├── SimpleNotesTimeline.jsx               # Simplified notes timeline
├── TaskCard.jsx                          # Task display card
├── TaskLimitWarning.jsx                  # Task limit warning
├── TaskListSection.jsx                   # Task list component
└── TrashBinModal.jsx                     # Trash/delete confirmation modal
```

### Modal Components

```
src/modals/
├── AddAdvisoryIssueModal.jsx             # Add new advisory issue
├── AddAdvisoryIssueModalV15.jsx          # V15 add advisory issue
├── AddCaseModal.jsx                      # Add new case
├── AddHandoverModal.jsx                  # Add new handover
├── AddProjectModal.jsx                   # Add new project
├── AddRoleModal.jsx                      # Add new role
├── AttachmentsModal.jsx                  # File attachments modal
├── EditAdvisoryIssueModal.jsx            # Edit advisory issue
├── EditCaseModal.jsx                     # Edit case details
├── EditHandoverModal.jsx                 # Edit handover details
├── EditTaskModal.jsx                     # Edit task details
├── NextStepsModal.jsx                    # Next steps planning
├── NotesModal.jsx                        # Notes management
├── PromoteModal.jsx                      # Promote to case modal
├── PromoteToCaseModalV15.jsx             # V15 promote to case
├── TaskNotesModal.jsx                    # Task notes editor
└── TodoModal.jsx                         # Todo item management
```

### View Components

```
src/views/
├── AdvisoryIssuesReport.jsx              # Advisory issues report view
├── AdvisoryIssuesView.jsx                # Main advisory issues view
├── AdvisoryIssuesView.backup.jsx         # Backup advisory view
├── AdvisoryIssuesViewV15.jsx             # V15 advisory issues view
├── AdvisoryIssuesViewV15New.jsx          # New V15 advisory view
├── CasesView.jsx                         # Cases management view
├── Dashboard.jsx                         # Main dashboard
├── Dashboard_backup.jsx                  # Dashboard backup
├── Dashboard_merged.jsx                  # Merged dashboard version
├── Dashboard_new.jsx                     # New dashboard version
├── HandoversView.jsx                     # Handovers management view
├── MyDeskView.jsx                        # Personal workspace view
├── ProjectsView.jsx                      # Projects management view
├── RolesAtRiskView.jsx                   # Roles at risk view
└── dashboard/                            # Dashboard sub-components
    ├── MorningChecklistCard.jsx          # Morning checklist card
    ├── QuickNotesCardEnhanced.jsx        # Enhanced quick notes card
    ├── QuickNotesCardEnhanced.jsx.backup # Quick notes backup
    ├── QuickNotesCard_enhanced.jsx       # Alternative quick notes
    ├── TaskListFull.jsx                  # Full task list view
    └── TaskListFull_simplified.jsx       # Simplified task list
```

### Utility Functions

```
src/utils/
├── advisoryExportHelpers.js              # Advisory data export utilities
├── advisoryHelpers.js                    # Advisory issue helpers
├── attachments.js                        # File attachment utilities
├── authorUtils.js                        # Author/user utilities
├── errorBus.js                           # Error handling utilities
├── exportHelpers.js                     # General export utilities
├── exportUtils.js                       # Export utility functions
├── formatDate.js                         # Date formatting utilities
├── markdownHelpers.js                   # Markdown processing helpers
├── myDeskHelpers.js                     # My Desk feature helpers
└── notesNormalize.js                    # Notes data normalization
```

### Configuration & Constants

```
src/config/
└── features.js                          # Feature flags and configuration

src/constants/
└── quotes.js                            # Inspirational quotes data

src/hooks/
└── useStableQuote.js                    # Custom hook for quote management

src/styles/
└── print.css                           # Print-specific styles
```

## Database Migrations

```
migrations/
├── 20250826_add_handover_flags.sql       # Add handover status flags
├── 20250827_add_case_attachments.sql     # Add case attachment support
├── 20250830_add_advisory_issues.sql      # Add advisory issues table
├── 20250830_create_projects_table.sql    # Create projects table
├── 20250830_create_roles_at_risk_table.sql # Create roles at risk table
├── 20250830_update_advisory_schema.sql   # Update advisory schema
├── 20250830_update_advisory_schema_final.sql # Final advisory schema
├── 20250910_advisory_issues_v15.sql      # V15 advisory issues updates
├── 20250910_create_my_desk_tables.sql    # Create My Desk tables
├── 20250910_fix_my_desk_columns.sql      # Fix My Desk column issues
├── add_next_steps_to_cases.sql           # Add next steps to cases
├── advisory_issues_v15_simplified_migration.sql # Simplified V15 migration
├── create_notes_table_only.sql           # Notes table creation
└── ensure_advisory_columns.sql           # Ensure advisory columns exist
```

## Public Assets

```
public/
├── vite.svg                              # Vite logo
└── _redirects                            # Netlify redirect rules
```

## Technology Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Icons:** Lucide React
- **State Management:** React hooks and context
- **File Processing:** JSZip for exports
- **Date Handling:** Native JavaScript Date API

## Key Features

1. **Case Management:** Track and manage legal/business cases
2. **Project Tracking:** Monitor project progress and milestones
3. **Advisory Issues:** Handle advisory issues and recommendations
4. **My Desk:** Personal productivity workspace
5. **Handovers:** Manage task and case handovers
6. **Roles at Risk:** Monitor and track at-risk roles
7. **Dashboard:** Comprehensive overview and analytics
8. **Export/Import:** Data export with attachments
9. **Dark/Light Theme:** Toggle between themes
10. **Real-time Updates:** Live data synchronization

## Development Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Last Updated
September 10, 2025
