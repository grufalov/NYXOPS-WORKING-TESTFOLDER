import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SuccessSlideIn({ message, icon, action, onClose, reducedMotion }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { x: 64, opacity: 0 }}
          animate={reducedMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { x: 64, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 32, duration: reducedMotion ? 0.2 : 0.4 }}
          className="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border border-black/10 bg-[var(--surface-bg)] text-[var(--success)] font-semibold text-sm min-w-[220px] max-w-xs"
          role="status"
          aria-live="polite"
        >
          {icon ? (
            <span className="flex-shrink-0">{icon}</span>
          ) : (
            <svg className="w-5 h-5 text-[var(--success)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          )}
          <span className="flex-1 text-[var(--text)]">{message}</span>
          {action && (
            <button onClick={action.onClick} className="ml-2 text-xs font-medium text-[var(--success)] hover:underline focus:outline-none">
              {action.label}
            </button>
          )}
          <button onClick={onClose} className="ml-2 text-xs text-gray-400 hover:text-gray-600 focus:outline-none" aria-label="Close notification">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
