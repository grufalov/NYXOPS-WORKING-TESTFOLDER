import React, {
  createContext,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import SuccessSlideIn from "../ui/notifications/SuccessSlideIn";
import DangerToast from "../ui/notifications/DangerToast";

export const NotificationsContext = createContext(null);

function hashMsg(msg) {
  let hash = 0;
  if (!msg) return hash;
  for (let i = 0; i < msg.length; i++) {
    const chr = msg.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}

export function NotificationsProvider({ children }) {
  // Success: one at a time
  const [success, setSuccess] = useState(null); // { id, message, opts }
  // Danger: stacked, dedup by id
  const [dangerToasts, setDangerToasts] = useState([]); // [{ id, message, opts, timestamp }]
  const dangerMap = useRef(new Map());

  // Reduced motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /** API: success (single) */
  const notifySuccess = useCallback((message, opts = {}) => {
    setSuccess({
      id: opts.id || Date.now(),
      message,
      opts: { ...opts }, // can include { title, description, icon, action, sticky, timeoutMs }
    });
  }, []);

  /** API: danger (dedup + cooldown 2s) */
  const notifyDanger = useCallback((message, opts = {}) => {
    const id = opts.id ?? hashMsg(message);
    const now = Date.now();
    const prev = dangerMap.current.get(id);
    if (prev && now - prev.timestamp < 2000) return; // cooldown

    const toast = { id, message, opts: { ...opts }, timestamp: now };
    setDangerToasts((toasts) => {
      const idx = toasts.findIndex((t) => t.id === id);
      if (idx !== -1) {
        const copy = [...toasts];
        copy[idx] = toast; // replace existing
        return copy;
      }
      // optional: cap at 4 to avoid overflow
      const next = [...toasts, toast];
      return next.length > 4 ? next.slice(next.length - 4) : next;
    });
    dangerMap.current.set(id, { timestamp: now });
  }, []);

  // Auto-dismiss success
  useEffect(() => {
    if (!success || success.opts.sticky) return;
    const t = setTimeout(() => setSuccess(null), success.opts.timeoutMs || 2500);
    return () => clearTimeout(t);
  }, [success]);

  // Auto-dismiss danger
  useEffect(() => {
    if (!dangerToasts.length) return;
    const timers = dangerToasts.map((toast) => {
      if (toast.opts.sticky) return null;
      return setTimeout(() => {
        setDangerToasts((toasts) => toasts.filter((t) => t.id !== toast.id));
        dangerMap.current.delete(toast.id);
      }, toast.opts.timeoutMs || 5000);
    });
    return () => timers.forEach((t) => t && clearTimeout(t));
  }, [dangerToasts]);

  // Manual dismiss
  const dismissSuccess = () => setSuccess(null);
  const dismissDanger = (id) => {
    setDangerToasts((toasts) => toasts.filter((t) => t.id !== id));
    dangerMap.current.delete(id);
  };

  // ARIA live (screen-reader only)
  const ariaPoliteRef = useRef(null);
  const ariaAssertiveRef = useRef(null);
  useEffect(() => {
    if (success && ariaPoliteRef.current) {
      ariaPoliteRef.current.textContent = success.opts.description ?? success.message;
    }
  }, [success]);
  useEffect(() => {
    if (dangerToasts.length && ariaAssertiveRef.current) {
      const last = dangerToasts[dangerToasts.length - 1];
      ariaAssertiveRef.current.textContent = last.opts.description ?? last.message;
    }
  }, [dangerToasts]);

  // Ensure portal root exists
  const [portalRoot, setPortalRoot] = useState(null);
  useEffect(() => {
    let node = document.getElementById("notifications-root");
    if (!node) {
      node = document.createElement("div");
      node.id = "notifications-root";
      document.body.appendChild(node);
    }
    setPortalRoot(node);
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifySuccess, notifyDanger }}>
      {children}

      {/* Visually hidden ARIA live regions */}
      <div style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <div
          ref={ariaPoliteRef}
          aria-live="polite"
          aria-atomic="true"
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
        />
        <div
          ref={ariaAssertiveRef}
          aria-live="assertive"
          aria-atomic="true"
          style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}
        />
      </div>

      {portalRoot &&
        createPortal(
          <div className="pointer-events-none fixed inset-0 z-[1000]" aria-hidden>
            <div className="absolute right-3 top-3 flex w-full max-w-[calc(100%-1.5rem)] flex-col items-end gap-2">
              {/* Success (single) */}
              <div className="pointer-events-auto">
                {success && (
                  <SuccessSlideIn
                    key={success.id}
                    message={success.message}
                    title={success.opts.title}                 
                    description={success.opts.description}     
                    icon={success.opts.icon}
                    action={success.opts.action}
                    onClose={dismissSuccess}
                    reducedMotion={reducedMotion}
                  />
                )}
              </div>

              {/* Danger stack */}
              <div className="pointer-events-auto flex w-full max-w-sm flex-col gap-2">
                {dangerToasts.map((toast) => (
                  <DangerToast
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    title={toast.opts.title}                   
                    description={toast.opts.description}       
                    icon={toast.opts.icon}
                    action={toast.opts.action}
                    sticky={toast.opts.sticky}
                    onClose={() => dismissDanger(toast.id)}
                    reducedMotion={reducedMotion}
                  />
                ))}
              </div>
            </div>
          </div>,
          portalRoot
        )}
    </NotificationsContext.Provider>
  );
}
