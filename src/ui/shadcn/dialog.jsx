import React from 'react';
import * as RDialog from '@radix-ui/react-dialog';

export function ShDialog(props) {
  return <RDialog.Root {...props} />;
}
export function ShDialogTrigger(props) {
  return <RDialog.Trigger asChild {...props} />;
}
export function ShDialogContent({ className = '', children, ...props }) {
  return (
    <RDialog.Portal>
      <RDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
      <RDialog.Content
        className={[
          'fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2',
          'rounded-lg border border-[var(--surface-bg)] bg-[var(--card-bg)] p-4 text-[var(--text)] shadow-xl',
          className,
        ].join(' ').trim()}
        {...props}
      >
        {children}
      </RDialog.Content>
    </RDialog.Portal>
  );
}
export function ShDialogHeader({ className = '', ...props }) {
  return <div className={['mb-2', className].join(' ').trim()} {...props} />;
}
export function ShDialogTitle({ className = '', ...props }) {
  return <RDialog.Title className={['text-lg font-semibold', className].join(' ').trim()} {...props} />;
}
export function ShDialogDescription({ className = '', ...props }) {
  return <RDialog.Description className={['text-sm text-[var(--text-muted)]', className].join(' ').trim()} {...props} />;
}
export function ShDialogFooter({ className = '', ...props }) {
  return <div className={['mt-4 flex justify-end gap-2', className].join(' ').trim()} {...props} />;
}
