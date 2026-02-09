import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ArrowRight, Lightbulb } from 'lucide-react';
export function AIRecommendationsPanel() {
  return <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-indigo-600" /> AI Recommendations
        </h3>
        <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
          See All <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <motion.div initial={{
        y: 10,
        opacity: 0
      }} animate={{
        y: 0,
        opacity: 1
      }} transition={{
        delay: 0.2
      }} className="bg-white rounded-lg p-5 shadow-sm border border-indigo-100 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">
                Email Performance Opportunity
              </h4>
              <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                Your open rates are 28% above industry average. Increase email
                frequency from 2x to 3x monthly.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  +$1,200 monthly revenue
                </span>
                <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  Schedule Strategy Call <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{
        y: 10,
        opacity: 0
      }} animate={{
        y: 0,
        opacity: 1
      }} transition={{
        delay: 0.3
      }} className="bg-white rounded-lg p-5 shadow-sm border border-indigo-100 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg shrink-0">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">
                Renewal Opportunity
              </h4>
              <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                3 customers due for renewal this week ($2,400 potential).
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  High Priority
                </span>
                <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  View Renewal Plan <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>;
}