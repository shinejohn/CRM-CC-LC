import React from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
export function AIEmployeePerformanceTable() {
  const employees = [{
    name: 'Sarah',
    role: 'Marketing',
    tasks: 127,
    efficiency: 95,
    quality: 9.2,
    impact: '+$3,200',
    trend: 'up'
  }, {
    name: 'Derek',
    role: 'Service',
    tasks: 46,
    efficiency: 98,
    quality: 9.5,
    impact: '46 jobs',
    trend: 'up'
  }, {
    name: 'Olivia',
    role: 'Support',
    tasks: 89,
    efficiency: 94,
    quality: 9.0,
    impact: '4 min avg',
    trend: 'neutral'
  }, {
    name: 'Emma',
    role: 'Sales',
    tasks: 34,
    efficiency: 97,
    quality: 9.3,
    impact: '$11K inv',
    trend: 'up'
  }];
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" /> AI Employee Performance
        </h3>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-800">
          View Detailed Report
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-left">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                Employee
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                Tasks Done
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                Efficiency
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                Quality Score
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                Business Impact
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp, index) => <motion.tr key={index} initial={{
            opacity: 0,
            x: -10
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: index * 0.1
          }} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-purple-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-emerald-500' : 'bg-pink-500'}`}>
                      {emp.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{emp.name}</div>
                      <div className="text-xs text-slate-500">{emp.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                  {emp.tasks}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {emp.efficiency}%
                    </span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{
                    width: `${emp.efficiency}%`
                  }} />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-slate-900">
                      {emp.quality}
                    </span>
                    <span className="text-xs text-slate-400">/10</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-emerald-600">
                      {emp.impact}
                    </span>
                    {emp.trend === 'up' ? <ArrowUpRight className="w-3 h-3 text-emerald-500" /> : emp.trend === 'down' ? <ArrowDownRight className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3 text-slate-400" />}
                  </div>
                </td>
              </motion.tr>)}
          </tbody>
        </table>
      </div>
    </div>;
}