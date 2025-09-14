// src/startup/watchdog.ts
export function startWatchdog() {
  // Disable in dev and on lab/roles routes
  const path = window.location.pathname;
  const isDev = import.meta?.env?.DEV === true || import.meta?.env?.MODE === "development";
  if (isDev) return;
  if (path.startsWith("/lab") || path.startsWith("/roles") || path.startsWith("/roles-at-risk")) return;

  const timeoutMs = 4000;
  const timer = setTimeout(() => {
    if (!window.__NYXOPS_READY__) {
      // In production you can show a toast or log — here we just log once.
      console.warn("Startup timeout: The app did not mount in time.");
    }
  }, timeoutMs);

  window.addEventListener("nyx:ready", () => clearTimeout(timer), { once: true });
}