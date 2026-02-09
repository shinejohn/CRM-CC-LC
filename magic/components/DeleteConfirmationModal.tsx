import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  details?: string[];
  confirmationText?: string;
}
export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  details = [],
  confirmationText = 'DELETE'
}: DeleteConfirmationModalProps) {
  const [inputValue, setInputValue] = useState('');
  const isConfirmed = inputValue === confirmationText;
  const handleClose = () => {
    setInputValue('');
    onClose();
  };
  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      handleClose();
    }
  };
  return <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent onClose={handleClose} className="sm:max-w-md">
        <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 0.2
      }}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>

            {/* Warning */}
            <Alert variant="destructive" className="mb-4">
              <AlertDescription className="text-center">
                <p className="font-bold mb-2">This action cannot be undone.</p>
                <p className="text-sm">
                  You are about to delete{' '}
                  <span className="font-medium">{itemName}</span>
                  {details.length > 0 && ' and all associated data including:'}
                </p>
              </AlertDescription>
            </Alert>

            {details.length > 0 && <ul className="bg-slate-50 rounded-lg p-4 space-y-2 mb-4">
                {details.map((detail, index) => <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">•</span>
                    {detail}
                  </li>)}
              </ul>}

            {/* Confirmation Input */}
            <div className="space-y-2">
              <Label>
                Type{' '}
                <span className="font-mono font-bold text-red-600">
                  {confirmationText}
                </span>{' '}
                to confirm:
              </Label>
              <Input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder={confirmationText} className="focus-visible:ring-red-500" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={!isConfirmed}>
              Delete Permanently
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>;
}