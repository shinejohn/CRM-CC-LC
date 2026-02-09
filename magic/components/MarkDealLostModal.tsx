import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
interface MarkDealLostModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealName: string;
  expectedValue: string;
  onMarkLost: (data: any) => void;
}
export function MarkDealLostModal({
  isOpen,
  onClose,
  dealName,
  expectedValue,
  onMarkLost
}: MarkDealLostModalProps) {
  const [reason, setReason] = useState('');
  const [competitor, setCompetitor] = useState('');
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
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-red-50">
            <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
              😔 Mark Deal as Lost
            </h2>
            <button onClick={onClose} className="text-red-700 hover:text-red-900 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <p className="font-medium text-slate-900">{dealName}</p>
              <p className="text-sm text-slate-500">
                Expected Value: {expectedValue}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lost Reason *
              </label>
              <select value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-red-500 bg-white">
                <option value="">Select reason...</option>
                <option value="price">Too expensive</option>
                <option value="competitor">Went with competitor</option>
                <option value="budget">Budget cut / No budget</option>
                <option value="timing">Timing not right</option>
                <option value="ghosted">No response / Ghosted</option>
                <option value="requirements">Requirements changed</option>
                <option value="other">Other</option>
              </select>
            </div>

            {reason === 'competitor' && <motion.div initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Competitor
                </label>
                <input type="text" value={competitor} onChange={e => setCompetitor(e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-red-500" />
              </motion.div>}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Notes
              </label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="What we learned..." className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-red-500 h-24 resize-none" />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500" />
                <span className="text-sm text-slate-600">
                  Set follow-up reminder in 3 months
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500" />
                <span className="text-sm text-slate-600">
                  Archive this deal
                </span>
              </label>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => onMarkLost({
            reason,
            competitor,
            notes
          })} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Mark as Lost
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>;
}