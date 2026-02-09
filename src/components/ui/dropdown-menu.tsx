import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | undefined>(undefined);

export interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

export interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export function DropdownMenuTrigger({ asChild, children }: DropdownMenuTriggerProps) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        context.setOpen(!context.open);
      },
    } as any);
  }

  return (
    <div onClick={(e) => { e.stopPropagation(); context.setOpen(!context.open); }}>
      {children}
    </div>
  );
}

export interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'end';
  className?: string;
}

export function DropdownMenuContent({ children, align = 'end', className = '' }: DropdownMenuContentProps) {
  const context = React.useContext(DropdownMenuContext);
  const ref = useRef<HTMLDivElement>(null);

  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu');

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
        absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 dark:border-slate-700
        bg-white dark:bg-slate-800 shadow-lg p-1 mt-1
        ${align === 'end' ? 'right-0' : 'left-0'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function DropdownMenuItem({ children, onClick, className = '' }: DropdownMenuItemProps) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuItem must be used within DropdownMenu');

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
        context.setOpen(false);
      }}
      className={`
        relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm
        hover:bg-gray-100 dark:hover:bg-slate-700
        ${className}
      `}
    >
      {children}
    </div>
  );
}

