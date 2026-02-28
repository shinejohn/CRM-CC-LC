import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, DollarSign, Search } from 'lucide-react';
interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'deal' | 'quote' | 'client';
  onQuickCreate: (data: any) => void;
}
export function QuickCreateModal({
  isOpen,
  onClose,
  type,
  onQuickCreate
}: QuickCreateModalProps) {
  const [name, setName] = useState('');
  const [account, setAccount] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');
  if (!isOpen) return null;
  const title = type === 'deal' ? 'Deal' : type === 'quote' ? 'Quote' : 'Client';
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
              <Plus className="w-5 h-5 text-blue-600" /> Quick Create {title}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {title} Name *
              </label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder={`e.g. Q1 Service Contract`} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Account *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={account} onChange={e => setAccount(e.target.value)} className="w-full pl-9 p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="Search or create account..." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Expected Revenue
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={value} onChange={e => setValue(e.target.value)} className="w-full pl-9 p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Expected Close
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full pl-9 p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Stage
                </label>
                <select className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white">
                  <option>Lead</option>
                  <option>Qualified</option>
                  <option>Proposal</option>
                  <option>Negotiation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Owner
                </label>
                <select className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white">
                  <option>Sarah Martinez</option>
                  <option>John Doe</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => onQuickCreate({
            name,
            account,
            value,
            date
          })} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              Create
            </button>
            <button onClick={() => onQuickCreate({
            name,
            account,
            value,
            date,
            open: true
          })} className="px-4 py-2 bg-white border border-blue-200 text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-colors">
              Create & Open
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>;
}