## UI Libraries Rollout

This change safely introduces new UI libraries behind flags and a `/lab` probe page, without touching existing pages.

### What Changed
- Feature flags: `src/config/flags.js` now includes
  - `NEW_UI_LIB` (switch UI wrappers to shadcn-style components)
  - `NEW_TABLE` (enable TanStack Table on `/lab`)
  - `NEW_FORMS` (enable React Hook Form + Zod validated form on `/lab`)
  - `NEW_EDITOR` (enable Quill editor on `/lab`)
- Adapters/wrappers in `src/ui/`:
  - `primitives/` wrappers for `Button`, `Card`, `Input`, `Dialog` now delegate to shadcn-style components when `NEW_UI_LIB=true`.
  - `table.jsx` switches between a fallback HTML table and TanStack Table based on `NEW_TABLE`.
  - `form/TextField.jsx` wraps our `Input` with react-hook-form’s `Controller` for validated forms (guarded by `NEW_FORMS`).
  - `editor/QuillEditor.jsx` provides a minimal rich text editor using Quill (guarded by `NEW_EDITOR`).
- Probe page `/lab`: `src/views/Lab.jsx` showcases Button, Card, Input, Dialog, Table probe, Validated Form probe, and Editor probe.

All new components use existing CSS tokens to preserve visuals: `--app-bg`, `--surface-bg`, `--card-bg`, `--hover-bg`, `--text`, `--accent`.

### How to Toggle
Set flags in `.env.local` (Vite reads `VITE_*` environment variables):

```dotenv
# Switch wrappers to shadcn-style components
VITE_NEW_UI_LIB=true

# Enable TanStack Table on /lab
VITE_NEW_TABLE=true

# Enable React Hook Form + Zod demo on /lab
VITE_NEW_FORMS=true

# Enable Quill editor demo on /lab
VITE_NEW_EDITOR=true
```

### Verification Steps
1) Start dev and open both the lab and the main app
   - `npm run dev`
   - Visit `http://localhost:5173/lab` and `http://localhost:5173/`
2) Toggle each flag true/false in `.env.local` and confirm isolation
   - `NEW_UI_LIB`: `/lab` UI wrappers swap between legacy and shadcn-style, no changes to main app pages
   - `NEW_TABLE`: `/lab` table switches between fallback HTML and TanStack Table
   - `NEW_FORMS`: `/lab` shows the validated form demo only when enabled
   - `NEW_EDITOR`: `/lab` shows the Quill editor only when enabled
3) Build should succeed
   - `npm run build`

### Rollback
- Quick rollback to previous commit:
  - `git reset --hard HEAD~1`
- Or simply disable all feature flags in `.env.local`:
  - `VITE_NEW_UI_LIB=false`
  - `VITE_NEW_TABLE=false`
  - `VITE_NEW_FORMS=false`
  - `VITE_NEW_EDITOR=false`

### Diff Scope
- Code changes limited to:
  - `src/ui/*`
  - `src/views/Lab.jsx`
  - `src/config/flags.js`
  - `package.json` (scripts/deps related to probes)
