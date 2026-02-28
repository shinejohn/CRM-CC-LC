import React, { useEffect, useState, useRef, forwardRef, createContext, useContext } from 'react';
import { ChevronRight } from 'lucide-react';
interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const DropdownMenuContext = createContext<DropdownMenuContextValue | undefined>(undefined);
export interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export function DropdownMenu({
  children,
  open: controlledOpen,
  onOpenChange
}: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (newOpen: boolean) => {
    setInternalOpen(newOpen);
    onOpenChange?.(newOpen);
  };
  return <DropdownMenuContext.Provider value={{
    open,
    setOpen
  }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>;
}
export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
}>(({
  className,
  children,
  onClick,
  ...props
}, ref) => {
  const context = useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    context.setOpen(!context.open);
  };
  return <button ref={ref} type="button" onClick={handleClick} className={className} {...props}>
      {children}
    </button>;
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';
export const DropdownMenuContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  align?: 'start' | 'center' | 'end';
}>(({
  className,
  children,
  align = 'start',
  ...props
}, ref) => {
  const context = useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu');
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!context.open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        context.setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [context]);
  if (!context.open) return null;
  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0'
  };
  return <>
      <div className="fixed inset-0 z-40" onClick={() => context.setOpen(false)} />
      <div ref={contentRef} className={`absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md ${alignmentClasses[align]} ${className || ''}`} {...props}>
        {children}
      </div>
    </>;
});
DropdownMenuContent.displayName = 'DropdownMenuContent';
export const DropdownMenuItem = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  disabled?: boolean;
}>(({
  className,
  disabled,
  onClick,
  ...props
}, ref) => {
  const context = useContext(DropdownMenuContext);
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    onClick?.(e);
    context?.setOpen(false);
  };
  return <div ref={ref} role="menuitem" onClick={handleClick} className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 ${disabled ? 'pointer-events-none opacity-50' : ''} ${className || ''}`} {...props} />;
});
DropdownMenuItem.displayName = 'DropdownMenuItem';
export const DropdownMenuSeparator = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => <div ref={ref} className={`-mx-1 my-1 h-px bg-slate-100 ${className || ''}`} {...props} />);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';
export const DropdownMenuLabel = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => <div ref={ref} className={`px-2 py-1.5 text-sm font-semibold ${className || ''}`} {...props} />);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';