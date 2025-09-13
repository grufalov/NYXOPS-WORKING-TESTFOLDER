import * as React from 'react';

type DivProps = React.HTMLAttributes<HTMLDivElement>;
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

// Lightweight dialog shim without external deps; replace with Radix when enabled
export function Dialog({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function DialogTrigger({ children, ...props }: ButtonProps & { asChild?: boolean }) {
  return <button {...props}>{children}</button>;
}

export function DialogContent({ className = '', ...props }: DivProps) {
  const cls = [
    'fixed inset-0 z-50 flex items-center justify-center',
    'bg-black/40',
  ].join(' ');
  return (
    <div className={cls} role="dialog" aria-modal="true">
      <div className={['w-[90vw] max-w-md rounded-lg border border-[var(--surface-bg)] bg-[var(--card-bg)] p-4 text-[var(--text)] shadow-xl', className].join(' ').trim()} {...props} />
    </div>
  );
}

export function DialogHeader({ className = '', ...props }: DivProps) {
  return <div className={['mb-2', className].join(' ').trim()} {...props} />;
}

export function DialogTitle({ className = '', ...props }: DivProps) {
  return <div className={['text-lg font-semibold', className].join(' ').trim()} {...props} />;
}

export function DialogDescription({ className = '', ...props }: DivProps) {
  return <div className={['text-sm text-[var(--text-muted)]', className].join(' ').trim()} {...props} />;
}

export function DialogFooter({ className = '', ...props }: DivProps) {
  return <div className={['mt-4 flex justify-end gap-2', className].join(' ').trim()} {...props} />;
}
