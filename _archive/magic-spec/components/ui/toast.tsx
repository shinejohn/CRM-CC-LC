import React, { useCallback, useState, forwardRef, createContext, useContext } from 'react';
import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
const toastVariants = cva('group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all', {
  variants: {
    variant: {
      default: 'border-slate-200 bg-white text-slate-950',
      destructive: 'border-red-500 bg-red-600 text-white',
      success: 'border-green-500 bg-green-600 text-white',
      warning: 'border-yellow-500 bg-yellow-500 text-white'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});
export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  onClose?: () => void;
  title?: string;
  description?: string;
}
export const Toast = forwardRef<HTMLDivElement, ToastProps>(({
  className,
  variant,
  onClose,
  title,
  description,
  children,
  ...props
}, ref) => {
  return <div ref={ref} className={`${toastVariants({
    variant
  })} ${className || ''}`} {...props}>
        <div className="grid gap-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
          {children}
        </div>
        {onClose && <button onClick={onClose} className="absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2">
            <X className="h-4 w-4" />
          </button>}
      </div>;
});
Toast.displayName = 'Toast';
// Toast Provider and Hook
interface ToastContextValue {
  toasts: Array<ToastProps & {
    id: string;
  }>;
  addToast: (toast: Omit<ToastProps, 'onClose'>) => void;
  removeToast: (id: string) => void;
}
const ToastContext = createContext<ToastContextValue | undefined>(undefined);
export function ToastProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Array<ToastProps & {
    id: string;
  }>>([]);
  const addToast = useCallback((toast: Omit<ToastProps, 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, {
      ...toast,
      id
    }]);
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  return <ToastContext.Provider value={{
    toasts,
    addToast,
    removeToast
  }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
        {toasts.map(toast => <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} className="mb-2" />)}
      </div>
    </ToastContext.Provider>;
}
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}