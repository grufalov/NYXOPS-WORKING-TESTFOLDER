import React from 'react';
import * as RDialog from '@radix-ui/react-dialog';
import { flag } from '../../config/flags.js';
import {
  ShDialog,
  ShDialogTrigger,
  ShDialogContent,
  ShDialogHeader,
  ShDialogTitle,
  ShDialogDescription,
  ShDialogFooter,
} from '../shadcn/dialog.jsx';

export function Dialog(props) {
  if (flag('NEW_UI_LIB')) {
    return <ShDialog {...props} />;
  }
  return <RDialog.Root {...props} />;
}

export function DialogTrigger(props) {
  if (flag('NEW_UI_LIB')) {
    return <ShDialogTrigger {...props} />;
  }
  return <RDialog.Trigger asChild {...props} />;
}

export function DialogContent({ className = '', children, ...props }) {
  if (flag('NEW_UI_LIB')) {
    return <ShDialogContent className={className} {...props}>{children}</ShDialogContent>;
  }
  return (
    <RDialog.Portal>
      <RDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
      <RDialog.Content
        className={[
          'fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2',
          'rounded-lg border border-[var(--surface-bg)] bg-[var(--card-bg)] p-4 text-[var(--text)] shadow-xl',
          className,
        ].join(' ').trim()}
        {...props}
      >
        {children}
      </RDialog.Content>
    </RDialog.Portal>
  );
}

export function DialogHeader({ className = '', ...props }) {
  if (flag('NEW_UI_LIB')) {
    return <ShDialogHeader className={className} {...props} />;
  }
  return <div className={['mb-2', className].join(' ').trim()} {...props} />;
}

export function DialogTitle({ className = '', ...props }) {
  if (flag('NEW_UI_LIB')) {
    return <ShDialogTitle className={className} {...props} />;
  }
  return <RDialog.Title className={['text-lg font-semibold', className].join(' ').trim()} {...props} />;
}

export function DialogDescription({ className = '', ...props }) {
  if (flag('NEW_UI_LIB')) {
    return <ShDialogDescription className={className} {...props} />;
  }
  return <RDialog.Description className={['text-sm text-[var(--text-muted)]', className].join(' ').trim()} {...props} />;
}

export function DialogFooter({ className = '', ...props }) {
  if (flag('NEW_UI_LIB')) {
    return <ShDialogFooter className={className} {...props} />;
  }
  return <div className={['mt-4 flex justify-end gap-2', className].join(' ').trim()} {...props} />;
}
