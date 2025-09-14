import { useNotifications } from "../hooks/useNotifications.js";

/**
 * Wrap ANY async op that returns { data, error } (e.g. Supabase).
 * Example:
 *   const { withToast } = useToastify();
 *   const data = await withToast("Case", () => supabase.from("cases").insert([{...}]).select());
 *
 * Behavior:
 * - On success: compact success toast (top-right) "Saved".
 * - On error: sticky danger toast (bottom-right).
 * - Re-throws error so existing error handling still works.
 */
export function useToastify() {
  const { notifySuccess, notifyDanger } = useNotifications();

  async function withToast(
    label,
    op,
    {
      successTitle = "Saved",
      successDescription,           // default: `${label} saved`
      successId = "autosave",
      successTimeoutMs = 2200,

      errorTitle = "Error",
      errorDescription,             // default: `${label} failed`
      errorId,                      // default: `${label.toLowerCase()}-error`
      stickyError = true,
    } = {}
  ) {
    try {
      const res = await op(); // expected shape { data, error }
      const { data, error } = res || {};
      if (error) throw error;

      notifySuccess(successDescription ?? `${label} saved`, {
        id: successId,
        title: successTitle,
        timeoutMs: successTimeoutMs,
      });

      return data;
    } catch (err) {
      const msg =
        typeof err?.message === "string" && err.message.trim().length
          ? err.message
          : `${label} failed`;
      notifyDanger(errorDescription ?? msg, {
        id: errorId ?? `${String(label).toLowerCase()}-error`,
        title: errorTitle,
        sticky: stickyError,
      });
      throw err;
    }
  }

  return { withToast };
}
