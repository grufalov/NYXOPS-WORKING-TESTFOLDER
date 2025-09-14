import * as React from 'react';
import { flag } from '../../config/flags';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'md', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)]';
    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-9 px-4 text-sm',
      lg: 'h-10 px-6 text-base',
    };
    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      default: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]',
      outline: 'border border-[var(--surface-bg)] bg-[var(--card-bg)] text-[var(--text)] hover:bg-[var(--hover-bg)]',
      ghost: 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--hover-bg)]',
    };

    // For now we provide a simple button. When NEW_UI_LIB is true, we could
    // later swap to shadcn styles; interface remains consistent.
    const cls = [base, sizes[size], variants[variant], className].join(' ').trim();

    return <button ref={ref} className={cls} {...props} />;
  }
);

Button.displayName = 'Button';
