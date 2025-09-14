<<<<<<< HEAD
// Feature flags for introducing new UI libraries safely
// Usage: override via Vite env vars e.g. VITE_NEW_UI_LIB=true

export const FLAGS = {
  NEW_UI_LIB: true,
  NEW_TABLE: true,
  NEW_EDITOR: true,
  NEW_DIALOG: true,
  NEW_FORMS: true,
};

export function flag(name) {
  const envKey = `VITE_${name}`;
  const raw = import.meta.env?.[envKey];
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return !!FLAGS[name];
=======
// Central feature flag helper with optional per-page overrides
// Usage: flag('NEW_UI_LIB')

/**
 * Returns a boolean for the requested flag name.
 * Order of precedence:
 * - window.__FLAG_OVERRIDES__[name] when defined as a boolean (page-scoped)
 * - import.meta.env.VITE_<NAME> from Vite env
 * - default: false
 * @param {string} name
 * @returns {boolean}
 */
export function flag(name) {
  try {
    const w = (globalThis?.window) || undefined;
    const local = w && w.__FLAG_OVERRIDES__;
    if (local && typeof local[name] === 'boolean') return local[name];
  } catch (_) {}

  const env = (import.meta && import.meta.env) ? import.meta.env : {};
  const viteVal = env?.[`VITE_${name}`];
  if (typeof viteVal === 'string') return viteVal === 'true';
  if (typeof viteVal === 'boolean') return viteVal;
  return false;
}

/**
 * Convenience helper to read raw env string/boolean for diagnostics.
 * @param {string} name
 */
export function rawFlagEnv(name) {
  const env = (import.meta && import.meta.env) ? import.meta.env : {};
  return env?.[`VITE_${name}`];
>>>>>>> origin/feature/ui-quick-notes
}
