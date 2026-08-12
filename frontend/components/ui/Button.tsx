import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer",
          {
            "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-sm hover:shadow-indigo-500/20 focus:ring-indigo-500 border border-indigo-500/30": variant === 'primary',
            "bg-slate-100/90 hover:bg-slate-200/80 text-slate-800 focus:ring-slate-400 border border-slate-200/60": variant === 'secondary',
            "border border-slate-200/80 hover:border-slate-300 bg-white/80 hover:bg-slate-50 text-slate-700 focus:ring-indigo-500 shadow-2xs": variant === 'outline',
            "hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 focus:ring-slate-400": variant === 'ghost',
            "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm hover:shadow-emerald-500/20 focus:ring-emerald-500 border border-emerald-500/30": variant === 'accent',
            "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-sm focus:ring-rose-500 border border-rose-500/30": variant === 'danger',
          },
          {
            "px-3 py-1.5 text-xs gap-1.5": size === 'sm',
            "px-4 py-2 text-xs font-semibold gap-2": size === 'md',
            "px-6 py-2.5 text-sm font-bold gap-2.5": size === 'lg',
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Processing...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
