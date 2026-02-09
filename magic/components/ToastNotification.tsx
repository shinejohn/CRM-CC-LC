import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { Toast } from './ui/toast';
export type ToastType = 'success' | 'error' | 'info';
interface ToastNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  type: ToastType;
  message: string;
  duration?: number;
}
export function ToastNotification({
  isOpen,
  onClose,
  type,
  message,
  duration = 5000
}: ToastNotificationProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);
  const variantMap = {
    success: 'success' as const,
    error: 'destructive' as const,
    info: 'default' as const
  };
  const iconMap = {
    success: CheckCircle2,
    error: XCircle,
    info: Info
  };
  const Icon = iconMap[type];
  return <AnimatePresence>
      {isOpen && <div className="fixed top-4 right-4 z-50">
          <motion.div initial={{
        opacity: 0,
        y: -20,
        scale: 0.95
      }} animate={{
        opacity: 1,
        y: 0,
        scale: 1
      }} exit={{
        opacity: 0,
        y: -20,
        scale: 0.95
      }}>
            <Toast variant={variantMap[type]} onClose={onClose} className="pr-12">
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{message}</p>
              </div>
            </Toast>
          </motion.div>
        </div>}
    </AnimatePresence>;
}