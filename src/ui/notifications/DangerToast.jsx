import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DangerToast({ id, message, icon, action, sticky, onClose, reducedMotion }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { y: 32, opacity: 0 }}
          animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { y: 32, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 32, duration: reducedMotion ? 0.2 : 0.4 }}
          className="pointer-events-auto flex items-start gap-3 px-5 py-3 rounded-xl shadow-lg border-l-4 border-[var(--danger)] bg-[var(--surface-bg)] text-[var(--danger)] font-semibold text-sm min-w-[220px] max-w-xs relative"
          role="status"
          aria-live="assertive"
        >
          {icon ? (
            <span className="flex-shrink-0">{icon}</span>
          ) : (
            <svg className="w-5 h-5 text-[var(--danger)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          )}
          <span className="flex-1 text-[var(--text)]">{message}</span>
          {action && (
            <button onClick={action.onClick} className="ml-2 text-xs font-medium text-[var(--danger)] hover:underline focus:outline-none">
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
