# REDUNDANT Archive

Date: 2025-09-13

This folder holds legacy docs, helper scripts, and loose SQL that are not used by the runtime build. These were relocated from the repository root to reduce clutter. Nothing under `src/`, `public/`, or `migrations/` was moved.

## Moved Items

- Docs → `REDUNDANT/docs/` (27 files)
  - ADVISORY_IMPLEMENTATION_SUMMARY.md
  - ADVISORY_ISSUES_IMPLEMENTATION.md
  - ADVISORY_ISSUES_UPDATE_SUMMARY.md
  - ADVISORY_ISSUES_V15_COMPLETE.md
  - ADVISORY_ISSUES_V15_IMPLEMENTATION_PLAN.md
  - APP_STRUCTURE.md
  - CHANGED_FILES.md
  - COLOR_INVENTORY.md
  - COLOR_PALETTE_IMPLEMENTATION_SUMMARY.md
  - CUSTOMIZATION_GUIDE.md
  - DATABASE_FIX_INSTRUCTIONS.md
  - DECORATIONS_IMPLEMENTATION.md
  - DEPLOYMENT_GUIDE.md
  - DEPLOYMENT_QA_PLAN.md
  - FULL_DASHBOARD_STRUCTURE_INFO.md
  - HANDOVERS_FOCUSED_WORKFLOW_SUMMARY.md
  - HANDOVERS_REDESIGN_SUMMARY.md
  - MY_DESK_COMPLETE_SUMMARY.md
  - MY_DESK_DOCUMENTATION.md
  - MY_DESK_IMPLEMENTATION_PLAN.md
  - MY_DESK_SETUP_GUIDE.md
  - New Plan_08Sept.md
  - PROJECTS_DELTA_CHANGES_IMPLEMENTATION.md
  - ROLES_AT_RISK_REFACTOR_SUMMARY.md
  - SUPABASE_SETUP.md
  - TEST_PLAN.md
  - USAGE_NOTES.md

- Scripts → `REDUNDANT/scripts/` (2 files)
  - deploy.ps1
  - deploy.sh

- SQL → `REDUNDANT/sql/` (4 files)
  - check_database_schema.sql
  - convert_next_steps_to_text.sql
  - QUICK_FIX_SQL.sql
  - simple_next_steps_migration.sql

- Assets → `REDUNDANT/assets/`
  - No root-level assets were found to move.

## Kept in Place (reasons)

- README.md: primary repo documentation and linked implicitly.
- index.html: app entry; must remain at root for Vite.
- Configs (`.eslintrc.cjs`, `postcss.config.js`, `tailwind.config.js`, `vite.config.js`): required by tooling.
- Environment files (`.env`, `.env.example`): runtime/configuration.
- `package.json`, `package-lock.json`: dependency and scripts.
- `src/`, `public/`, `migrations/`: explicitly excluded from moves.
- `run-migration.js`, `run-migration-simple.js`, `run-roles-migration.js`: JavaScript helpers (not shell/PowerShell); left at root.

## Notes

- Prior to moving, a quick repo-wide search confirmed none of the moved files are imported by the application, referenced in `package.json` scripts, or linked from `README.md`.
- If you need any of these again at the root, you can move them back or reference them directly in place under `REDUNDANT/`.
