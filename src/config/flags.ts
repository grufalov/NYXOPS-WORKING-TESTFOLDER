// Feature flags for introducing new UI libraries safely
// Usage: set Vite env vars like VITE_NEW_UI_LIB=true to override defaults

type FlagKey = 'NEW_UI_LIB' | 'NEW_TABLE' | 'NEW_EDITOR' | 'NEW_DIALOG';

export const FLAGS: Record<FlagKey, boolean> = {
  NEW_UI_LIB: false,
  NEW_TABLE: false,
  NEW_EDITOR: false,
  NEW_DIALOG: false,
};

export function flag(name: FlagKey): boolean {
  const envKey = `VITE_${name}` as const;
  const raw = (import.meta as any).env?.[envKey];
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return FLAGS[name];
}
