// ============================================
// GLOBAL ERROR HANDLER
// Toast/notification system for API errors
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  createdAt: number;
}

const TOAST_EVENT = 'global:toast';
const DEFAULT_DURATION = 5000;

const toasts: Toast[] = [];
const listeners = new Set<(t: Toast[]) => void>();

function notify() {
  listeners.forEach((fn) => fn([...toasts]));
}

export function showToast(toast: Omit<Toast, 'id' | 'createdAt'>) {
  const id = crypto.randomUUID();
  const t: Toast = {
    ...toast,
    id,
    createdAt: Date.now(),
  };
  toasts.push(t);
  notify();

  const duration = toast.duration ?? DEFAULT_DURATION;
  if (duration > 0) {
    setTimeout(() => {
      const idx = toasts.findIndex((x) => x.id === id);
      if (idx >= 0) {
        toasts.splice(idx, 1);
        notify();
      }
    }, duration);
  }
}

export function dismissToast(id: string) {
  const idx = toasts.findIndex((x) => x.id === id);
  if (idx >= 0) {
    toasts.splice(idx, 1);
    notify();
  }
}

// Listen for auth:unauthorized, global:api-error, and network status
if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    showToast({
      type: 'error',
      title: 'Session expired',
      message: 'Please sign in again.',
      duration: 8000,
    });
  });

  window.addEventListener('global:api-error', ((e: CustomEvent<{ error: { message?: string; status?: number }; endpoint?: string }>) => {
    const { error } = e.detail || {};
    const msg = error?.message || 'Something went wrong';
    showToast({
      type: (error?.status || 0) >= 500 ? 'error' : 'warning',
      title: 'Request failed',
      message: msg,
      duration: 6000,
    });
  }) as EventListener);

  // Network interruption handling
  window.addEventListener('offline', () => {
    showToast({
      type: 'warning',
      title: 'You are offline',
      message: 'Some features may not work until your connection is restored.',
      duration: 8000,
    });
  });
}

const icons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  error: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles: Record<ToastType, string> = {
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
  warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
};

export function GlobalErrorHandler() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    setItems([...toasts]);
    const fn = (t: Toast[]) => setItems(t);
    listeners.add(fn);
    return () => listeners.delete(fn);
  }, []);

  const handleDismiss = useCallback((id: string) => {
    dismissToast(id);
  }, []);

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-md w-full pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <div className="flex flex-col gap-2 pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {items.map((toast) => {
            const Icon = icons[toast.type];
            const style = styles[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${style}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{toast.title}</p>
                  {toast.message && <p className="text-sm mt-1 opacity-90">{toast.message}</p>}
                </div>
                <button
                  onClick={() => handleDismiss(toast.id)}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
