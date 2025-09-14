import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SuccessSlideIn({
  message,
  icon,
  action,
  onClose,
  reducedMotion,
  title = "Saved",
  description,
}) {
  const desc = description ?? message;

  return (
    <AnimatePresence>
      {desc && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { x: 56, opacity: 0 }}
          animate={reducedMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { x: 56, opacity: 0 }}
          transition={{ type: "spring", stiffness: 480, damping: 34, duration: reducedMotion ? 0.16 : 0.28 }}
          className="relative pointer-events-auto inline-flex items-start gap-2 px-3 py-2 rounded-lg shadow-md border overflow-hidden w-auto max-w-[86vw]"
          role="status"
          aria-live="polite"
          style={{ background: "var(--card-bg)", border: "1px solid rgba(34,197,94,0.40)", boxShadow: "var(--shadow-md)", color: "var(--text)" }}
        >
          {/* subtle green wash */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(34,197,94,0.14)" }} />

          <div
            className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full flex-shrink-0"
            style={{ background: "rgba(34,197,94,0.22)", color: "rgb(34,197,94)" }}
          >
            {icon ?? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          <div className="relative flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold" style={{ color: "rgb(34,197,94)" }}>
              {title}
            </div>
            <div className="text-[12px] leading-5 whitespace-nowrap">{desc}</div>
          </div>

          {action && (
            <button
              onClick={action.onClick}
              className="relative ml-1 text-[11px] font-medium hover:underline"
              style={{ color: "rgb(34,197,94)" }}
            >
              {action.label}
            </button>
          )}
          <button
            onClick={onClose}
            className="relative ml-1 inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-[var(--surface-bg)]"
            aria-label="Close notification"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none">
              <path d="M6 6l8 8M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
