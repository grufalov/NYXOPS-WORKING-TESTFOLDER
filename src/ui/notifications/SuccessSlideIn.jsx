import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SuccessSlideIn({
  message,
  icon,
  action,
  onClose,
  reducedMotion,
  title = "Saved",
  description, // optional; falls back to message
}) {
  const desc = description ?? message;

  return (
    <AnimatePresence>
      {desc && (
        <motion.div
  initial={reducedMotion ? { opacity: 0 } : { x: 64, opacity: 0 }}
  animate={reducedMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
  exit={reducedMotion ? { opacity: 0 } : { x: 64, opacity: 0 }}
  transition={{ type: "spring", stiffness: 420, damping: 32, duration: reducedMotion ? 0.18 : 0.35 }}
  className="relative pointer-events-auto w-[280px] max-w-[86vw] rounded-xl shadow-md border overflow-hidden"
  style={{
    background: "var(--card-bg)",
    border: "1px solid rgba(34,197,94,0.40)",
    boxShadow: "var(--shadow-md)",
    color: "var(--text)",
  }}
  role="status"
  aria-live="polite"
>
  {/* tint overlay */}
  <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(34,197,94,0.14)" }} aria-hidden />
  <div className="relative flex items-start gap-2.5 p-3 pr-1.5">
    <div
      className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0"
      style={{ background: "rgba(34,197,94,0.22)", color: "rgb(34,197,94)" }}
      aria-hidden
    >
      {icon ?? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>

    <div className="relative flex-1 min-w-0">
      <div className="text-[13px] font-semibold" style={{ color: "rgb(34,197,94)" }}>
        {title ?? "Saved"}
      </div>
      <div className="text-[12px] leading-5 truncate">{(description ?? message) || "Done."}</div>
    </div>

    {action && (
      <button onClick={action.onClick} className="relative mx-1 text-[11px] font-medium hover:underline" style={{ color: "rgb(34,197,94)" }}>
        {action.label}
      </button>
    )}
    <button
      onClick={onClose}
      className="relative ml-1 inline-flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--surface-bg)]"
      aria-label="Close notification"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none">
        <path d="M6 6l8 8M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  </div>
</motion.div>

      )}
    </AnimatePresence>
  );
}
