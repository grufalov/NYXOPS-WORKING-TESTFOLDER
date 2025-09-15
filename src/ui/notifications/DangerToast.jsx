import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DangerToast({
  id,
  message,
  icon,
  action,
  sticky,
  onClose,
  reducedMotion,
  title = "Connection Error",
  description,
}) {
  const desc = description ?? message;

  return (
    <AnimatePresence>
      {desc && (
        <motion.div
          layout
          initial={reducedMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
          animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { y: 24, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 460,
            damping: 30,
            duration: reducedMotion ? 0.18 : 0.28,
          }}
          style={{ transformOrigin: "bottom right" }}
          className="relative pointer-events-auto w-[360px] max-w-[92vw] rounded-2xl shadow-md border overflow-hidden"
          role="status"
          aria-live="assertive"
        >
          {/* Base + tint + rail */}
          <div className="absolute inset-0" style={{ background: "var(--card-bg)" }} />
          <div className="absolute inset-0" style={{ background: "rgba(239,68,68,0.12)" }} />
          <div className="absolute left-0 top-0 h-full w-1.5" style={{ background: "rgb(239,68,68)" }} />

          <div className="relative flex items-start gap-3 p-4 pr-2" style={{ color: "var(--text)", border: "1px solid rgba(239,68,68,0.38)", boxShadow: "var(--shadow-md)" }}>
            <div
              className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0"
              style={{ background: "rgba(239,68,68,0.22)", color: "rgb(239,68,68)" }}
            >
              {icon ?? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>

            <div className="relative flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ color: "rgb(239,68,68)" }}>
                {title}
              </div>
              <div className="text-sm">{desc}</div>
            </div>

            {action && (
              <button onClick={action.onClick} className="relative mx-1 text-xs font-medium hover:underline" style={{ color: "rgb(239,68,68)" }}>
                {action.label}
              </button>
            )}
            <button
              onClick={onClose}
              className="relative ml-1 inline-flex h-8 w-8 items-center justify-center rounded-xl hover:bg-[var(--surface-bg)]"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none">
                <path d="M6 6l8 8M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
