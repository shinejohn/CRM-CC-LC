import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, Trash2, Plus, FileText } from 'lucide-react';
interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalNumber: string;
  onCreateInvoice: (data: any) => void;
}
export function CreateInvoiceModal({
  isOpen,
  onClose,
  proposalNumber,
  onCreateInvoice
}: CreateInvoiceModalProps) {
  const [customer, setCustomer] = useState('acme');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([{
    desc: 'Q1 Services - Consulting',
    qty: 10,
    rate: 350,
    amount: 3500
  }, {
    desc: 'Q1 Services - Implementation',
    qty: 4,
    rate: 250,
    amount: 1000
  }]);
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const total = subtotal; // Add tax logic if needed
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
      }} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" /> Create Invoice
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <p className="text-sm text-slate-500">
              Creating invoice from:{' '}
              <span className="font-medium text-slate-900">
                {proposalNumber}
              </span>
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Customer
                </label>
                <select value={customer} onChange={e => setCustomer(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white">
                  <option value="acme">Acme Corporation</option>
                  <option value="beta">Beta Inc</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Invoice Date
                </label>
                <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Due Date
                </label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Line Items
              </label>
              <div className="space-y-2">
                {items.map((item, i) => <div key={i} className="flex gap-2 items-start">
                    <input type="text" value={item.desc} className="flex-1 p-2 border border-slate-200 rounded-lg text-sm" readOnly />
                    <div className="w-20 p-2 border border-slate-200 rounded-lg text-sm text-right">
                      {item.qty} hrs
                    </div>
                    <div className="w-24 p-2 border border-slate-200 rounded-lg text-sm text-right">
                      ${item.rate}
                    </div>
                    <div className="w-24 p-2 border border-slate-200 rounded-lg text-sm text-right font-medium">
                      ${item.amount}
                    </div>
                    <button className="p-2 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>)}
                <button className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:underline">
                  <Plus className="w-4 h-4" /> Add Line Item
                </button>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-4">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-medium text-slate-900">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax (0%):</span>
                  <span className="font-medium text-slate-900">$0</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-2">
                  <span className="text-slate-900">TOTAL:</span>
                  <span className="text-slate-900">
                    ${total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes to Customer
              </label>
              <textarea placeholder="Thank you for your business!" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 h-20 resize-none" />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                <span className="text-sm text-slate-600">
                  Send invoice to customer immediately
                </span>
              </label>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => onCreateInvoice({
            customer,
            invoiceDate,
            dueDate,
            items
          })} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
              <FileText className="w-4 h-4" /> Create & Send Invoice
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>;
}