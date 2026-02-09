import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
  children?: React.ReactNode;
}

export function Label({ className = '', children, ...props }: LabelProps) {
  return (
    <label
      className={`text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 block ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
