import React from 'react';

<<<<<<< HEAD
export function ShCard({ className = '', ...props }) {
=======
export function ShCard({ className = '', noClip = false, ...props }) {
>>>>>>> origin/feature/ui-quick-notes
  const cls = [
    'rounded-lg border',
    'border-[var(--surface-bg)]',
    'bg-[var(--card-bg)] text-[var(--text)]',
    'shadow-sm',
<<<<<<< HEAD
=======
    noClip ? '' : 'overflow-hidden',
>>>>>>> origin/feature/ui-quick-notes
    className,
  ].join(' ').trim();
  return <div className={cls} {...props} />;
}
export function ShCardHeader({ className = '', ...props }) {
  return <div className={['p-4 border-b border-[var(--surface-bg)]', className].join(' ').trim()} {...props} />;
}
export function ShCardTitle({ className = '', ...props }) {
  return <div className={['text-base font-semibold', className].join(' ').trim()} {...props} />;
}
export function ShCardContent({ className = '', ...props }) {
  return <div className={['p-4', className].join(' ').trim()} {...props} />;
}
