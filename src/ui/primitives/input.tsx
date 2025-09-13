import * as React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    const cls = [
      'h-9 px-3 rounded-md',
      'bg-[var(--app-bg)] text-[var(--text)]',
      'border border-[var(--surface-bg)]',
      'placeholder:text-[var(--text-muted)]',
      'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent',
      className,
    ].join(' ').trim();
    return <input ref={ref} className={cls} {...props} />;
  }
);

Input.displayName = 'Input';
