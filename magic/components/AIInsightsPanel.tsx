import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react';
export function AIInsightsPanel() {
  const insights = [{
    type: 'winning',
    title: 'WINNING',
    icon: TrendingUp,
    message: 'Email campaigns are performing 28% above industry average.',
    recommendation: 'Increase frequency from 2x to 3x per month.',
    action: 'Implement Now',
    color: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    iconColor: 'text-emerald-600',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700'
  }, {
    type: 'attention',
    title: 'ATTENTION',
    icon: AlertTriangle,
    message: "3 customers haven't booked in 60+ days.",
    recommendation: 'Launch re-engagement campaign.',
    action: 'Create Campaign',
    color: 'border-amber-400 bg-amber-50 text-amber-700',
    iconColor: 'text-amber-600',
    btnColor: 'bg-amber-500 hover:bg-amber-600'
  }, {
    type: 'action',
    title: 'ACTION NEEDED',
    icon: AlertCircle,
    message: '2 invoices overdue by 30+ days ($1,200 total).',
    recommendation: 'Escalate to collections sequence.',
    action: 'Start Collections',
    color: 'border-red-500 bg-red-50 text-red-700',
    iconColor: 'text-red-600',
    btnColor: 'bg-red-600 hover:bg-red-700'
  }];
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h3 className="font-bold text-slate-900">AI Performance Insights</h3>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, index) => <motion.div key={index} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.1
      }} whileHover={{
        y: -4
      }} className={`rounded-xl p-5 border-l-4 shadow-sm ${insight.color.replace('text-', 'border-').split(' ')[0]} bg-white border border-slate-200`}>
            <div className="flex items-center gap-2 mb-3">
              <insight.icon className={`w-5 h-5 ${insight.iconColor}`} />
              <span className={`text-xs font-bold uppercase tracking-wide ${insight.iconColor}`}>
                {insight.title}
              </span>
            </div>

            <p className="text-slate-900 font-medium mb-2 text-sm">
              {insight.message}
            </p>

            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">
                Recommendation:
              </p>
              <p className="text-sm text-slate-700">{insight.recommendation}</p>
            </div>

            <button className={`w-full py-2 px-4 rounded-lg text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 ${insight.btnColor}`}>
              {insight.action} <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>)}
      </div>
    </div>;
}