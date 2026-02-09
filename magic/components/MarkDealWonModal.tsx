import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, DollarSign, Calendar } from 'lucide-react';
interface MarkDealWonModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealName: string;
  onMarkWon: (data: any) => void;
}
export function MarkDealWonModal({
  isOpen,
  onClose,
  dealName,
  onMarkWon
}: MarkDealWonModalProps) {
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('price');
  const [notes, setNotes] = useState('');
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
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-emerald-50">
            <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
              🎉 Mark Deal as Won
            </h2>
            <button onClick={onClose} className="text-emerald-700 hover:text-emerald-900 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <p className="font-medium text-slate-900">{dealName}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Final Deal Value
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={value} onChange={e => setValue(e.target.value)} className="w-full pl-9 p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Close Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full pl-9 p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Won Reason
              </label>
              <select value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-white">
                <option value="price">Best price</option>
                <option value="service">Best service</option>
                <option value="relationship">Existing relationship</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add details..." className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 h-20 resize-none" />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-sm font-bold text-slate-700 mb-2">
                Next Steps:
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                  <span className="text-sm text-slate-600">Create invoice</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                  <span className="text-sm text-slate-600">
                    Schedule kickoff meeting
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                  <span className="text-sm text-slate-600">
                    Send welcome email
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => onMarkWon({
            value,
            date,
            reason,
            notes
          })} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Mark as Won
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>;
}