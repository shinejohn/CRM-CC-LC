import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
export function CommunicationPrefsSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div onClick={() => setIsExpanded(!isExpanded)} className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900">
            Communication Preferences
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            <Edit2 className="w-3 h-3" /> Edit All
          </button>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && <motion.div initial={{
        height: 0,
        opacity: 0
      }} animate={{
        height: 'auto',
        opacity: 1
      }} exit={{
        height: 0,
        opacity: 0
      }} className="border-t border-slate-100">
            <div className="p-6 space-y-8">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">
                  Channel Preferences
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <span className="text-sm font-medium text-slate-700">
                      Appointment Confirmations
                    </span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="checkbox" defaultChecked className="rounded text-blue-600" />{' '}
                        Email
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="checkbox" defaultChecked className="rounded text-blue-600" />{' '}
                        SMS
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-400">
                        <input type="checkbox" className="rounded text-blue-600" />{' '}
                        Phone
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <div>
                      <span className="text-sm font-medium text-slate-700 block">
                        Appointment Reminders
                      </span>
                      <span className="text-xs text-slate-400">
                        24 hrs before
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-slate-400">
                        <input type="checkbox" className="rounded text-blue-600" />{' '}
                        Email
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="checkbox" defaultChecked className="rounded text-blue-600" />{' '}
                        SMS
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-400">
                        <input type="checkbox" className="rounded text-blue-600" />{' '}
                        Phone
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-50">
                    <div>
                      <span className="text-sm font-medium text-slate-700 block">
                        Follow-up After Service
                      </span>
                      <span className="text-xs text-slate-400">
                        1 day after
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="checkbox" defaultChecked className="rounded text-blue-600" />{' '}
                        Email
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-400">
                        <input type="checkbox" className="rounded text-blue-600" />{' '}
                        SMS
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-400">
                        <input type="checkbox" className="rounded text-blue-600" />{' '}
                        Phone
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">
                    Tone of Communication
                  </h4>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input type="radio" name="tone" defaultChecked className="text-blue-600 focus:ring-blue-500" />{' '}
                      Friendly
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input type="radio" name="tone" className="text-blue-600 focus:ring-blue-500" />{' '}
                      Professional
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input type="radio" name="tone" className="text-blue-600 focus:ring-blue-500" />{' '}
                      Casual
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">
                    Business Signature
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600 font-mono">
                    <p>Thanks for choosing ABC Home Services!</p>
                    <p>- The ABC Team</p>
                    <p>(555) 123-4567 | www.abchomeservices.com</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}