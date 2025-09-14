import React, { createContext, useCallback, useContext, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import SuccessSlideIn from "../ui/notifications/SuccessSlideIn";
import DangerToast from "../ui/notifications/DangerToast";

export const NotificationsContext = createContext();

function hashMsg(msg) {
  let hash = 0, i, chr;
  if (!msg) return hash;
  for (i = 0; i < msg.length; i++) {
    chr = msg.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}

export function NotificationsProvider({ children }) {
  const [success, setSuccess] = useState(null); // { id, message, opts }
  const [dangerToasts, setDangerToasts] = useState([]); // [{ id, message, opts, timestamp }]
  const dangerMap = useRef(new Map());
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Success notification (one at a time)
  const notifySuccess = useCallback((message, opts = {}) => {
    setSuccess({
      id: opts.id || Date.now(),
      message,
      opts: { ...opts }
    });
  }, []);

  // Danger notification (deduped by id or hash)
  const notifyDanger = useCallback((message, opts = {}) => {
    const id = opts.id || hashMsg(message);
    const now = Date.now();
    // Cooldown: ignore if same id fired within 2s
    const prev = dangerMap.current.get(id);
    if (prev && now - prev.timestamp < 2000) return;
    const toast = { id, message, opts: { ...opts }, timestamp: now };
    setDangerToasts((toasts) => {
      const idx = toasts.findIndex(t => t.id === id);
      if (idx !== -1) {
        // Replace existing
        const updated = [...toasts];
        updated[idx] = toast;
        return updated;
      }
      return [...toasts, toast];
    });
    dangerMap.current.set(id, { timestamp: now });
  }, []);

  // Remove success after timeout
  useEffect(() => {
    if (!success) return;
    if (success.opts.sticky) return;
    const timeout = setTimeout(() => setSuccess(null), success.opts.timeoutMs || 2500);
    return () => clearTimeout(timeout);
  }, [success]);

  // Remove danger toast after timeout
  useEffect(() => {
    if (!dangerToasts.length) return;
    const timers = dangerToasts.map((toast) => {
      if (toast.opts.sticky) return null;
      return setTimeout(() => {
        setDangerToasts((toasts) => toasts.filter(t => t.id !== toast.id));
        dangerMap.current.delete(toast.id);
      }, toast.opts.timeoutMs || 5000);
    });
    return () => timers.forEach(t => t && clearTimeout(t));
  }, [dangerToasts]);

  // Manual dismiss
  const dismissSuccess = () => setSuccess(null);
  const dismissDanger = (id) => {
    setDangerToasts((toasts) => toasts.filter(t => t.id !== id));
    dangerMap.current.delete(id);
  };

  // ARIA live regions
  const ariaPoliteRef = useRef();
  const ariaAssertiveRef = useRef();
  useEffect(() => {
    if (success && ariaPoliteRef.current) {
      ariaPoliteRef.current.textContent = success.message;
    }
  }, [success]);
  useEffect(() => {
    if (dangerToasts.length && ariaAssertiveRef.current) {
      ariaAssertiveRef.current.textContent = dangerToasts[dangerToasts.length-1].message;
    }
  }, [dangerToasts]);

  // Portal root
  const portalRoot = typeof window !== "undefined" ? document.getElementById("notifications-root") : null;

  return (
    <NotificationsContext.Provider value={{ notifySuccess, notifyDanger }}>
      {children}
      {/* ARIA live regions */}
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <div ref={ariaPoliteRef} aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }} />
        <div ref={ariaAssertiveRef} aria-live="assertive" aria-atomic="true" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }} />
      </div>
      {portalRoot && createPortal(
        <div className="fixed z-[1000] pointer-events-none inset-0 flex flex-col items-end gap-3 px-4 py-6" style={{ top: 0, right: 0 }}>
          {/* Success banner (one at a time) */}
          {success && (
            <SuccessSlideIn
              key={success.id}
              message={success.message}
              icon={success.opts.icon}
              action={success.opts.action}
              onClose={dismissSuccess}
              reducedMotion={reducedMotion}
            />
          )}
          {/* Danger toasts (stacked, deduped) */}
          <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
            {dangerToasts.map(toast => (
              <DangerToast
                key={toast.id}
                id={toast.id}
                message={toast.message}
                icon={toast.opts.icon}
                action={toast.opts.action}
                sticky={toast.opts.sticky}
                onClose={() => dismissDanger(toast.id)}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        </div>,
        portalRoot
      )}
    </NotificationsContext.Provider>
  );
}
