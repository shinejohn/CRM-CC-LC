import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
interface FAQEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}
export function FAQEditModal({
  isOpen,
  onClose,
  onSave
}: FAQEditModalProps) {
  return <AnimatePresence>
      {isOpen && <>
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
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
        }} className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Edit FAQ</h3>
                <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Question *
                  </label>
                  <input type="text" defaultValue="What is your cancellation policy?" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Answer *
                  </label>
                  <textarea rows={4} defaultValue="Appointments can be cancelled or rescheduled up to 24 hours in advance with no charge. Same-day cancellations incur a $50 service fee. No-shows are charged the full service call amount." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>Policies & Terms</option>
                    <option>Services</option>
                    <option>Pricing</option>
                    <option>General</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm text-slate-700">
                      Show this FAQ to customers
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm text-slate-700">
                      Allow AI to use this in responses
                    </span>
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
                  <span className="text-lg">💡</span>
                  <p className="text-sm text-blue-800">
                    Tip: Be specific and clear. This helps Lisa and Olivia
                    answer customer questions accurately.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between">
                <button className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete FAQ
                </button>
                <div className="flex gap-3">
                  <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    Save FAQ
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>}
    </AnimatePresence>;
}