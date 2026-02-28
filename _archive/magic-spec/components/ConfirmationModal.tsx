import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive';
}
export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon,
  variant = 'default'
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="sm:max-w-md">
        <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 0.2
      }}>
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {icon || <div className={`w-12 h-12 rounded-full flex items-center justify-center ${variant === 'destructive' ? 'bg-red-100' : 'bg-amber-100'}`}>
                <AlertTriangle className={`w-6 h-6 ${variant === 'destructive' ? 'text-red-600' : 'text-amber-600'}`} />
              </div>}
          </div>

          <DialogHeader className="text-center">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="text-center">
              {message}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-6">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              {cancelText}
            </Button>
            <Button variant={variant === 'destructive' ? 'destructive' : 'default'} onClick={handleConfirm} className="w-full sm:w-auto">
              {confirmText}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>;
}