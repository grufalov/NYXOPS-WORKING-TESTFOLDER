import * as React from 'react';

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className = '', ...props }: DivProps) {
  const cls = [
    'rounded-lg border',
    'border-[var(--surface-bg)]',
    'bg-[var(--card-bg)] text-[var(--text)]',
    'shadow-sm',
    className,
  ].join(' ').trim();
  return <div className={cls} {...props} />;
}

export function CardHeader({ className = '', ...props }: DivProps) {
  const cls = ['p-4 border-b border-[var(--surface-bg)]', className].join(' ').trim();
  return <div className={cls} {...props} />;
}

export function CardTitle({ className = '', ...props }: DivProps) {
  const cls = ['text-base font-semibold', className].join(' ').trim();
  return <div className={cls} {...props} />;
}

export function CardContent({ className = '', ...props }: DivProps) {
  const cls = ['p-4', className].join(' ').trim();
  return <div className={cls} {...props} />;
}
