import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, AlertCircle } from 'lucide-react';
interface SendPaymentReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceNumber: string;
  customer: string;
  amount: string;
  daysOverdue: number;
  onSendReminder: (data?: { type?: string }) => void;
}
export function SendPaymentReminderModal({
  isOpen,
  onClose,
  invoiceNumber,
  customer,
  amount,
  daysOverdue,
  onSendReminder
}: SendPaymentReminderModalProps) {
  const [type, setType] = useState('urgent');
  if (!isOpen) return null;
  return <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div initial={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} animate={{
        opacity: 1,
        scale: 1,
        y: 0
      }} exit={{
        opacity: 0,
        scale: 0.95,
        y: 20
      }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" /> Send Payment Reminder
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-sm text-slate-600 mb-1">
                To:{' '}
                <span className="font-medium text-slate-900">
                  billing@acmecorp.com
                </span>
              </p>
              <p className="text-sm text-slate-600">
                Invoice:{' '}
                <span className="font-medium text-slate-900">
                  {invoiceNumber}
                </span>{' '}
                | <span className="font-bold text-slate-900">{amount}</span> |{' '}
                <span className="text-red-600 font-bold">
                  {daysOverdue} days overdue
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reminder Type
              </label>
              <div className="space-y-2">
                {[{
                id: 'friendly',
                label: 'Friendly Reminder (1st)'
              }, {
                id: 'followup',
                label: 'Follow-up (2nd)'
              }, {
                id: 'urgent',
                label: 'Urgent Notice (3rd+)'
              }, {
                id: 'final',
                label: 'Final Notice (before collections)'
              }].map(option => <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="reminderType" value={option.id} checked={type === option.id} onChange={e => setType(e.target.value)} className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                    <span className="text-sm text-slate-700">
                      {option.label}
                    </span>
                  </label>)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subject
              </label>
              <input type="text" defaultValue={`Urgent: Invoice #${invoiceNumber} - Payment Overdue`} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Message
              </label>
              <textarea defaultValue={`Dear ${customer},\n\nThis is an urgent reminder that invoice #${invoiceNumber} for ${amount} is now ${daysOverdue} days overdue.\n\nPlease arrange payment immediately to avoid any service interruption.\n\nIf you have already sent payment, please disregard this notice.`} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 h-32 resize-none font-mono text-sm" />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <span className="text-sm text-slate-600">
                  Attach invoice PDF
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <span className="text-sm text-slate-600">
                  Include payment link
                </span>
              </label>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => onSendReminder({
            type
          })} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
              <Mail className="w-4 h-4" /> Send Reminder
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>;
}