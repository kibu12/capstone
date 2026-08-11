import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
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
          "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          {
            "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm focus:ring-indigo-500": variant === 'primary',
            "bg-slate-100 hover:bg-slate-200 text-slate-800 focus:ring-slate-400": variant === 'secondary',
            "border border-slate-200 hover:bg-slate-50 text-slate-700 focus:ring-indigo-500": variant === 'outline',
            "bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500": variant === 'danger',
          },
          {
            "px-3 py-1.5 text-xs": size === 'sm',
            "px-4 py-2 text-sm": size === 'md',
            "px-6 py-3 text-base": size === 'lg',
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
