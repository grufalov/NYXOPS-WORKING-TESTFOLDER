import React from 'react';

export function ShCard({ className = '', noClip = false, ...props }) {
  const cls = [
    'rounded-lg border',
    'border-[var(--surface-bg)]',
    'bg-[var(--card-bg)] text-[var(--text)]',
    'shadow-sm',
    noClip ? '' : 'overflow-hidden',
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
