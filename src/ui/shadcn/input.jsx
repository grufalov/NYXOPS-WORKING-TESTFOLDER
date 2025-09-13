import React from 'react';

export const ShInput = React.forwardRef(function ShInput({ className = '', ...props }, ref) {
  const cls = [
    'h-9 px-3 rounded-md',
    'bg-[var(--app-bg)] text-[var(--text)]',
    'border border-[var(--surface-bg)]',
    'placeholder:text-[var(--text-muted)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent',
    className,
  ].join(' ').trim();
  return <input ref={ref} className={cls} {...props} />;
});
