import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ className, variant = 'primary', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-colors",
        {
          "bg-indigo-50 text-indigo-700 border border-indigo-100": variant === 'primary',
          "bg-slate-100 text-slate-800 border border-slate-200": variant === 'secondary',
          "bg-emerald-50 text-emerald-700 border border-emerald-100": variant === 'success',
          "bg-amber-50 text-amber-700 border border-amber-100": variant === 'warning',
          "bg-rose-50 text-rose-700 border border-rose-100": variant === 'danger',
          "bg-sky-50 text-sky-700 border border-sky-100": variant === 'info',
        },
        className
      )}
      {...props}
    />
  );
}
