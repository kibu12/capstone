import React from 'react';
import { cn } from '@/lib/utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all appearance-none cursor-pointer",
            { "border-rose-500 focus:border-rose-500 focus:ring-rose-500": error },
            className
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="block mt-1 text-xs text-rose-600">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
