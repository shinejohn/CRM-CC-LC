import React from 'react';
import { motion } from 'framer-motion';
import { Target, Edit2 } from 'lucide-react';
export function GoalProgressCards() {
  const goals = [{
    label: 'Monthly Revenue',
    current: 12450,
    target: 16000,
    unit: '$',
    color: 'bg-emerald-500'
  }, {
    label: 'New Customers',
    current: 8,
    target: 10,
    unit: '',
    color: 'bg-blue-500'
  }, {
    label: 'Jobs Completed',
    current: 46,
    target: 50,
    unit: '',
    color: 'bg-purple-500'
  }];
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-red-500" /> Goal Progress
        </h3>
        <button className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1">
          <Edit2 className="w-3 h-3" /> Edit Goals
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-8">
        {goals.map((goal, index) => {
        const percentage = Math.round(goal.current / goal.target * 100);
        return <div key={index}>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-slate-700">
                  {goal.label}
                </span>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-900">
                    {goal.unit}
                    {goal.current.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">
                    / {goal.unit}
                    {goal.target.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
                <motion.div initial={{
              width: 0
            }} animate={{
              width: `${percentage}%`
            }} transition={{
              duration: 1,
              delay: index * 0.2
            }} className={`h-full rounded-full ${goal.color}`} />
              </div>

              <div className="mt-1 text-right">
                <span className="text-xs font-bold text-slate-600">
                  {percentage}%
                </span>
              </div>
            </div>;
      })}
      </div>
    </div>;
}