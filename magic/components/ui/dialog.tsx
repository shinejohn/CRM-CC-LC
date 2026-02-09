import React, { useEffect, forwardRef } from 'react';
import { X } from 'lucide-react';
export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}
export function Dialog({
  open,
  onOpenChange,
  children
}: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange?.(false)} />
      <div className="relative z-50">{children}</div>
    </div>;
}
export const DialogContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  onClose?: () => void;
}>(({
  className,
  children,
  onClose,
  ...props
}, ref) => <div ref={ref} className={`fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-slate-200 bg-white p-6 shadow-lg duration-200 sm:rounded-lg ${className || ''}`} {...props}>
    {children}
    {onClose && <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>}
  </div>);
DialogContent.displayName = 'DialogContent';
export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ''}`} {...props} />;
DialogHeader.displayName = 'DialogHeader';
export const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`} {...props} />;
DialogFooter.displayName = 'DialogFooter';
export const DialogTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({
  className,
  ...props
}, ref) => <h2 ref={ref} className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`} {...props} />);
DialogTitle.displayName = 'DialogTitle';
export const DialogDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({
  className,
  ...props
}, ref) => <p ref={ref} className={`text-sm text-slate-500 ${className || ''}`} {...props} />);
DialogDescription.displayName = 'DialogDescription';