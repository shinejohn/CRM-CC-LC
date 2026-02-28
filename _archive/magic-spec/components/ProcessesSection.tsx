import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, ChevronUp, Plus, Edit2 } from 'lucide-react';
export function ProcessesSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div onClick={() => setIsExpanded(!isExpanded)} className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900">Processes & Policies</h3>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            <Plus className="w-3 h-3" /> Add Process
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
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-6">
                Define how your business operates so AI employees can follow
                your rules.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-xl p-5 relative group">
                  <button className="absolute top-4 right-4 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-50 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    📞 New Customer Intake
                  </h4>
                  <div className="h-px bg-slate-100 mb-3" />
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
                    <li>Capture name, phone, email, address</li>
                    <li>Ask what service is needed</li>
                    <li>Check if address is in service area</li>
                    <li>Offer next available appointment</li>
                    <li>Send confirmation email + text</li>
                    <li>Create customer record in CRM</li>
                  </ol>
                </div>

                <div className="border border-slate-200 rounded-xl p-5 relative group">
                  <button className="absolute top-4 right-4 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-50 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    💰 Pricing & Estimates Policy
                  </h4>
                  <div className="h-px bg-slate-100 mb-3" />
                  <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
                    <li>Service call fee: $75 (waived if work is done)</li>
                    <li>Estimates are free and valid for 30 days</li>
                    <li>Payment due upon completion</li>
                    <li>Accept: Cash, Check, Credit Card, Financing</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}