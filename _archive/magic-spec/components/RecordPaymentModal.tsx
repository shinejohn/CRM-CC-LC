import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, CreditCard } from 'lucide-react';
interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceNumber: string;
  customer: string;
  amountDue: string;
  onRecordPayment: (data: any) => void;
}
export function RecordPaymentModal({
  isOpen,
  onClose,
  invoiceNumber,
  customer,
  amountDue,
  onRecordPayment
}: RecordPaymentModalProps) {
  const [amount, setAmount] = useState(amountDue.replace('$', '').replace(',', ''));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState('bank');
  const [reference, setReference] = useState('');
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
              <DollarSign className="w-5 h-5 text-blue-600" /> Record Payment
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Invoice:</span>
                <span className="font-medium text-slate-900">
                  {invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Customer:</span>
                <span className="font-medium text-slate-900">{customer}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Amount Due:</span>
                <span className="font-bold text-slate-900">{amountDue}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={amount} onChange={e => setAmount(e.target.value)} className="w-full pl-9 p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div className="flex gap-2 mt-2">
                <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium hover:bg-blue-100">
                  Pay in Full
                </button>
                <button className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded font-medium hover:bg-slate-100">
                  Partial Payment
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full pl-9 p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Method
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select value={method} onChange={e => setMethod(e.target.value)} className="w-full pl-9 p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white">
                    <option value="bank">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="card">Credit Card</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reference / Check Number
              </label>
              <input type="text" value={reference} onChange={e => setReference(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <span className="text-sm text-slate-600">
                  Send payment confirmation to customer
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <span className="text-sm text-slate-600">
                  Mark invoice as paid
                </span>
              </label>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => onRecordPayment({
            amount,
            date,
            method,
            reference
          })} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              Record Payment
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>;
}