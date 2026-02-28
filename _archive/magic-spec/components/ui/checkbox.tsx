import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onCheckedChange?: (checked: boolean) => void;
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  className,
  checked,
  onCheckedChange,
  onChange,
  ...props
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onCheckedChange?.(e.target.checked);
  };
  return <div className="relative inline-flex items-center">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={handleChange} ref={ref} {...props} />
        <div className={`h-4 w-4 shrink-0 rounded-sm border border-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 peer-checked:bg-slate-900 peer-checked:text-slate-50 flex items-center justify-center ${className || ''}`}>
          {checked && <Check className="h-3 w-3 text-white" />}
        </div>
      </div>;
});
Checkbox.displayName = 'Checkbox';