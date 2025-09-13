# App Audit

## Overview
- React + Vite SPA using a tabbed UI (no React Router). Views are switched by `activeTab` in `src/App.jsx` and persisted in `localStorage`.
- Supabase provides auth, database, and storage. Feature flags live in `src/config/features.js`.

## Framework + Build Tooling
- Framework: React 18
- Build tool: Vite (`vite.config.js` with `@vitejs/plugin-react`)
- HTML entry: `index.html` → `src/main.jsx`

## Language & Styling
- Language: JavaScript (ESM + JSX)
- Styling: Tailwind CSS (`tailwind.config.js`), global styles in `src/index.css`
- Design tokens: `src/styles/tokens.css`; additional styles `src/styles/theme-map.css`, `src/styles/decorations.css`, `src/styles/print.css`
- UI kit: `lucide-react` icons; custom component library within `src/components`

## Dependencies Snapshot
- @supabase/supabase-js: Supabase client for db/auth/storage
- lucide-react: Icons
- jszip: Export ZIPs with attachments
- jspdf, jspdf-autotable: PDF export
- xlsx: Spreadsheet import/export
- markdown-it: Markdown rendering
- react-quill: Rich text editor

## Scripts (package.json)
- dev: `vite`
- dev:5173: `vite --port 5173 --strictPort`
- restart:5173: `kill-port 5173 && npm run dev:5173`
- build: `vite build`
- preview: `vite preview`
- lint: `eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0`

## Routing Map
- No React Router. Tabs in `src/App.jsx` act as routes:
  - `/` → Dashboard (`src/views/Dashboard.jsx`) [lazy: false]
  - `/cases` → Cases (`src/views/CasesView.jsx`) [lazy: false]
  - `/advisory` → Advisory (`src/views/AdvisoryIssuesView.jsx`) [lazy: false]
  - `/projects` → Projects (`src/views/ProjectsView.jsx`) [lazy: false]
  - `/handovers` → Handovers (`src/views/HandoversView.jsx`) [lazy: false]
  - `/roles-at-risk` → Roles at Risk (`src/views/RolesAtRiskView.jsx`) [lazy: false]
  - `/my-desk` → My Desk (`src/views/MyDeskView.jsx`) [lazy: false]
- Layout wrappers: none; App component renders sidebar + content.
- Loaders/actions: Supabase queries are executed inside each view component.

## Pages Inventory
- Dashboard (`src/views/Dashboard.jsx`)
  - Components: `views/dashboard/QuickNotesCardEnhanced.jsx`, `views/dashboard/MorningChecklistCard.jsx`, `views/dashboard/TaskListFull.jsx`, `components/decors/BackgroundDoodles.jsx`, `components/ErrorInline.jsx`, `components/QuoteBar.jsx`
  - Data sources: Supabase counts (cases, projects, roles_at_risk), local errorBus
  - Forms/modals: none
  - URL params/filters: none
- Cases (`src/views/CasesView.jsx`)
  - Components: `components/CaseCard.jsx`, `modals/NextStepsModal.jsx`, `modals/AddCaseModal.jsx`, `components/decors/BackgroundDoodles.jsx`
  - Data sources: Supabase `cases`
  - Forms/modals: AddCaseModal, NextStepsModal
  - Filters: status, practice, search, sort
- Advisory (`src/views/AdvisoryIssuesView.jsx`)
  - Components: `components/SimpleNotesTimeline.jsx`, `modals/AddAdvisoryIssueModal.jsx`, `modals/EditAdvisoryIssueModal.jsx`, `modals/PromoteModal.jsx`, `components/CardPresenter.jsx`
  - Data sources: Supabase `advisory_issues`
  - Forms/modals: Add/Edit Advisory Issue, Promote
  - Filters: status, search, view mode
- Projects (`src/views/ProjectsView.jsx`)
  - Components: `modals/NextStepsModal.jsx`, `components/decors/BackgroundDoodles.jsx`
  - Data sources: Supabase `projects`
  - Forms/modals: NextStepsModal, project add/edit flows
  - Filters: status, practice, search, sort
- Handovers (`src/views/HandoversView.jsx`)
  - Components: `modals/EditTaskModal.jsx`, `components/decors/BackgroundDoodles.jsx`
  - Data sources: Supabase `handovers`, links to `cases`
  - Forms/modals: EditTaskModal, add/edit notes
  - Filters: status, search, priority, assignee
- Roles at Risk (`src/views/RolesAtRiskView.jsx`)
  - Components: `components/RolesSmartTable.jsx`, `modals/RoleEditModal.jsx`, `components/PasteImportModal.jsx`
  - Data sources: Supabase `roles_at_risk`
  - Forms/modals: RoleEditModal
  - Filters: status, role_type, practice, search
- My Desk (`src/views/MyDeskView.jsx`)
  - Components: `views/dashboard/QuickNotesCardEnhanced.jsx`, `views/dashboard/TaskListFull.jsx`
  - Data sources: Supabase `notes`, `todos`
  - Forms/modals: NotesModal, TodoModal
  - Filters: none

## State Management
- Global stores: none (no Redux/Zustand/Context detected)
- Server state: direct Supabase client usage in views and `src/utils/attachments.js`
- Error handling: `src/utils/errorBus.js` with `components/ErrorDrawer.jsx`

## Design System
- Tokens/CSS vars: `src/styles/tokens.css`; light/dark variables, shadows, state palettes
- Global styles: `src/index.css`, `src/styles/theme-map.css`, `src/styles/decorations.css`, `src/styles/print.css`
- Tailwind config: `tailwind.config.js`
- Common UI components:
  - Modal(s): `src/modals/*.jsx`
  - Table: `src/components/RolesSmartTable.jsx`
  - Inputs: provided within forms/modals; no separate input kit
  - Toasts: not found; errors via `ErrorDrawer`
  - Theme toggle: `toggleTheme` in `src/App.jsx` updates `document.documentElement.classList`

## Data Layer
- Client: `@supabase/supabase-js` via `src/supabaseClient.js`
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADVISORY_V15`
- Storage buckets: `case-attachments` (used in `src/utils/attachments.js`)
- Tables referenced: `cases`, `projects`, `handovers`, `case_attachments`, `advisory_issues`, `roles_at_risk`, `notes`, `todos`
- Error/loading: inline spinners/skeletons in components; centralized error bus

## Components & Hooks
- Shared components (examples):
  - `src/components/CaseCard.jsx` – Case summary card
  - `src/components/AdvisoryIssueTable.jsx` – Advisory list/table
  - `src/components/RolesSmartTable.jsx` – Roles data table with layout persistence
  - `src/components/ErrorDrawer.jsx` – Error drawer fed by `errorBus`
  - `src/components/MarkdownEditor.jsx` – Markdown editor UI
- Custom hooks:
  - `src/hooks/useStableQuote.js` – Stable random quote provider

## Assets & Public
- Icons: `lucide-react`
- Images/SVGs: `public/vite.svg`, `src/assets/**` (e.g., `src/assets/nyxops-crescent.svg`, `src/components/decors/BackgroundDoodles.jsx`)
- Fonts: not explicitly configured
- Large/duplicate candidates: none obvious

## Tech Debt & Opportunities
- Orphan/variants present (backups/alt versions):
  - `src/views/*backup*.jsx`, `*_merged.jsx`, `*_new.jsx`, `*V15*.jsx`, `*Refactored.jsx`
  - `src/views/dashboard/QuickNotesCardEnhanced.jsx.backup`, `QuickNotesCard_enhanced.jsx`
- Consider consolidating variants and removing backups after confirming history.
- No route-level code-splitting; consider dynamic imports for heavy views.
- Feature flag ATTACHMENTS is disabled; if enabling, ensure policies and bucket are configured.

## Getting Started
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Env: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.example`). Optional: `VITE_ADVISORY_V15` for v1.5 features.

