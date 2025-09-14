import React from 'react';
import { flag } from '../../config/flags.js';
import { ShInput } from '../shadcn/input.jsx';

export const Input = React.forwardRef(function Input({ className = '', ...props }, ref) {
  if (flag('NEW_UI_LIB')) {
    return <ShInput ref={ref} className={className} {...props} />;
  }
  const cls = [
    'h-9 px-3 rounded-md',
    'bg-[var(--app-bg)] text-[var(--text)]',
    'border border-[var(--surface-bg)]',
    'placeholder:text-[var(--text-muted)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent',
    className,
  ]
    .join(' ')
    .trim();
  return <input ref={ref} className={cls} {...props} />;
});
