import React from 'react';
import { flag } from '../../config/flags.js';
import { ShButton } from '../shadcn/button.jsx';

export const Button = React.forwardRef(function Button(
  { className = '', variant = 'default', size = 'md', ...props },
  ref
) {
  if (flag('NEW_UI_LIB')) {
    const mappedVariant = variant === 'primary' ? 'default' : variant; // primary->default
    return <ShButton ref={ref} variant={mappedVariant} size={size} className={className} {...props} />;
  }
  const base = 'inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)]';
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-9 px-4 text-sm',
    lg: 'h-10 px-6 text-base',
  };
  const variants = {
    default: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]',
    outline: 'border border-[var(--surface-bg)] bg-[var(--card-bg)] text-[var(--text)] hover:bg-[var(--hover-bg)]',
    ghost: 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--hover-bg)]',
  };
  const cls = [base, sizes[size] || sizes.md, variants[variant] || variants.default, className]
    .join(' ')
    .trim();
  return <button ref={ref} className={cls} {...props} />;
});
