import React, { useState, useRef, useEffect } from 'react';

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextType | undefined>(undefined);

export interface PopoverProps {
  children: React.ReactNode;
}

export function Popover({ children }: PopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      {children}
    </PopoverContext.Provider>
  );
}

export interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export function PopoverTrigger({ asChild, children }: PopoverTriggerProps) {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error('PopoverTrigger must be used within Popover');

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => context.setOpen(!context.open),
    } as any);
  }

  return (
    <div onClick={() => context.setOpen(!context.open)}>
      {children}
    </div>
  );
}

export interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PopoverContent({ children, className = '' }: PopoverContentProps) {
  const context = React.useContext(PopoverContext);
  const ref = useRef<HTMLDivElement>(null);

  if (!context) throw new Error('PopoverContent must be used within Popover');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        context.setOpen(false);
      }
    };

    if (context.open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [context.open]);

  if (!context.open) return null;

  return (
    <div
      ref={ref}
      className={`
        absolute z-50 w-80 rounded-md border border-gray-200 dark:border-slate-700
        bg-white dark:bg-slate-800 shadow-lg p-4 mt-2
        ${className}
      `}
    >
      {children}
    </div>
  );
}

