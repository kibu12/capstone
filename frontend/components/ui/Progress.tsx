import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  indicatorClassName?: string;
  variant?: 'indigo' | 'emerald' | 'amber' | 'gradient';
}

export function Progress({
  className,
  value,
  max = 100,
  indicatorClassName,
  variant = 'indigo',
  ...props
}: ProgressProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div
      className={cn("relative w-full h-2 bg-slate-100/90 rounded-full overflow-hidden border border-slate-200/50 shadow-2xs", className)}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-700 ease-out",
          {
            "bg-indigo-600": variant === 'indigo',
            "bg-emerald-500": variant === 'emerald',
            "bg-amber-500": variant === 'amber',
            "bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500": variant === 'gradient',
          },
          indicatorClassName
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
