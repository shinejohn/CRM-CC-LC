import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  children,
  label,
  ...props
}, ref) => {
  return <div className="relative">
        {label && <label className="text-sm font-medium leading-none mb-2 block">
            {label}
          </label>}
        <select className={`flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${className || ''}`} ref={ref} {...props}>
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" style={{
      marginTop: label ? '12px' : '0'
    }} />
      </div>;
});
Select.displayName = 'Select';