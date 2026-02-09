import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp, Plus, Edit2, ArrowRight } from 'lucide-react';
interface FAQsSectionProps {
  onNavigate?: (page: string) => void;
}
export function FAQsSection({
  onNavigate
}: FAQsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const faqs = [{
    q: 'What is your cancellation policy?',
    a: 'Appointments can be cancelled or rescheduled up to 24 hours in advance with no charge. Same-day cancellations incur a $50 service fee.'
  }, {
    q: 'Do you offer emergency services?',
    a: 'Yes! We offer 24/7 emergency plumbing at premium rates. Call our emergency line: (555) 123-9999'
  }];
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div onClick={() => setIsExpanded(!isExpanded)} className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900">FAQs & Knowledge Base</h3>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={e => {
          e.stopPropagation();
          onNavigate?.('faq-management');
        }} className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
            <Plus className="w-3 h-3" /> Add FAQ
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
              <p className="text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">
                These FAQs help Lisa (Business Info AI) and Olivia (Customer
                Service) answer customer questions accurately.
              </p>

              <div className="space-y-4">
                {faqs.map((faq, index) => <div key={index} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow relative group">
                    <button onClick={() => onNavigate?.('faq-management')} className="absolute top-4 right-4 text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-50 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <h4 className="font-bold text-slate-900 mb-2 pr-8">
                      Q: {faq.q}
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      A: {faq.a}
                    </p>
                  </div>)}
              </div>

              <button onClick={() => onNavigate?.('faq-management')} className="w-full mt-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1">
                View All 12 FAQs <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}