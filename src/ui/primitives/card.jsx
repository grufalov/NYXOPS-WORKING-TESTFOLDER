import React from 'react';
import { flag } from '../../config/flags.js';
import { ShCard, ShCardHeader, ShCardTitle, ShCardContent } from '../shadcn/card.jsx';

export function Card({ className = '', ...props }) {
  if (flag('NEW_UI_LIB')) {
    return <ShCard className={className} {...props} />;
  }
  const cls = [
    'rounded-lg border',
    'border-[var(--surface-bg)]',
    'bg-[var(--card-bg)] text-[var(--text)]',
    'shadow-sm',
    className,
  ]
    .join(' ')
    .trim();
  return <div className={cls} {...props} />;
}

export function CardHeader({ className = '', ...props }) {
  if (flag('NEW_UI_LIB')) {
    return <ShCardHeader className={className} {...props} />;
  }
  const cls = ['p-4 border-b border-[var(--surface-bg)]', className].join(' ').trim();
  return <div className={cls} {...props} />;
}

export function CardTitle({ className = '', ...props }) {
  if (flag('NEW_UI_LIB')) {
    return <ShCardTitle className={className} {...props} />;
  }
  const cls = ['text-base font-semibold', className].join(' ').trim();
  return <div className={cls} {...props} />;
}

export function CardContent({ className = '', ...props }) {
  if (flag('NEW_UI_LIB')) {
    return <ShCardContent className={className} {...props} />;
  }
  const cls = ['p-4', className].join(' ').trim();
  return <div className={cls} {...props} />;
}
