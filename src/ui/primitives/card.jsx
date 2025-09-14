<<<<<<< HEAD
=======
export function CardFooter({ className = '', ...props }) {
  // No shadcn override needed; footer is always a div with spacing
  const cls = ['p-4 border-t border-[var(--surface-bg)]', className].join(' ').trim();
  return <div className={cls} {...props} />;
}
>>>>>>> origin/feature/ui-quick-notes
import React from 'react';
import { flag } from '../../config/flags.js';
import { ShCard, ShCardHeader, ShCardTitle, ShCardContent } from '../shadcn/card.jsx';

<<<<<<< HEAD
export function Card({ className = '', ...props }) {
  if (flag('NEW_UI_LIB')) {
    return <ShCard className={className} {...props} />;
=======
export function Card({ className = '', noClip = false, ...props }) {
  if (flag('NEW_UI_LIB')) {
    return <ShCard className={className} noClip={noClip} {...props} />;
>>>>>>> origin/feature/ui-quick-notes
  }
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
