import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}

export function Badge({ className, variant = 'primary', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight uppercase transition-all select-none",
        {
          "bg-indigo-50 text-indigo-700 border border-indigo-200/80": variant === 'primary',
          "bg-slate-100 text-slate-700 border border-slate-200": variant === 'secondary',
          "bg-emerald-50 text-emerald-700 border border-emerald-200/80": variant === 'success',
          "bg-amber-50 text-amber-800 border border-amber-200/80": variant === 'warning',
          "bg-rose-50 text-rose-700 border border-rose-200/80": variant === 'danger',
          "bg-sky-50 text-sky-700 border border-sky-200/80": variant === 'info',
          "bg-purple-50 text-purple-700 border border-purple-200/80": variant === 'purple',
        },
        className
      )}
      {...props}
    />
  );
}
