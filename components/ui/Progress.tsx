import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  indicatorClassName?: string;
}

export function Progress({ className, value, max = 100, indicatorClassName, ...props }: ProgressProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div
      className={cn("relative w-full h-2 bg-slate-100 rounded-full overflow-hidden", className)}
      {...props}
    >
      <div
        className={cn("h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out", indicatorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
