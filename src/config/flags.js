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
}
