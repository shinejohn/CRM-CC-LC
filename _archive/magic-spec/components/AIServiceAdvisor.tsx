import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';
export function AIServiceAdvisor() {
  const [isExpanded, setIsExpanded] = useState(false);
  return <motion.div layout className={`bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-lg' : 'shadow-sm'}`}>
      <div onClick={() => setIsExpanded(!isExpanded)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-900">AI Service Advisor</h3>
            {!isExpanded && <p className="text-xs text-indigo-600/80">
                3 recommendations available based on your profile
              </p>}
          </div>
        </div>
        <button className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-lg transition-colors">
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
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
      }} className="overflow-hidden">
            <div className="p-6 pt-0 border-t border-indigo-100/50">
              <div className="bg-white/60 rounded-xl p-4 mb-6 mt-4 backdrop-blur-sm border border-indigo-50">
                <p className="text-slate-700 text-sm leading-relaxed">
                  <span className="font-bold text-indigo-700">Analysis:</span>{' '}
                  Based on your business profile and recent growth goals, I've
                  identified three opportunities to optimize your operations:
                </p>
                <ul className="mt-3 space-y-3">
                  <li className="flex gap-3 text-sm text-slate-700">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <span>
                      <span className="font-semibold text-slate-900">
                        Add Jennifer (Content):
                      </span>{' '}
                      Your website traffic has plateaued. Regular blog content
                      could improve your SEO by estimated 40% in 3 months.
                    </span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-700">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <span>
                      <span className="font-semibold text-slate-900">
                        Upgrade to Tier 3:
                      </span>{' '}
                      You've hit email sending limits for 2 consecutive months.
                      Tier 3 unlocks 15,000 sends/month.
                    </span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-700">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <span>
                      <span className="font-semibold text-slate-900">
                        Enable Recurring Billing:
                      </span>{' '}
                      15 of your active customers are eligible for auto-pay
                      setup, which would reduce late payments.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-indigo-500/20 flex items-center gap-2">
                  Tell me more about Jennifer <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-4 py-2 bg-white border border-indigo-200 hover:border-indigo-300 text-indigo-700 text-sm font-medium rounded-lg transition-colors">
                  Compare plans
                </button>
                <button className="px-4 py-2 bg-white border border-indigo-200 hover:border-indigo-300 text-indigo-700 text-sm font-medium rounded-lg transition-colors">
                  Ask something else
                </button>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </motion.div>;
}