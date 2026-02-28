import React from 'react';
import { motion } from 'framer-motion';
import { Target, MoreHorizontal, Pause, Settings, Plus } from 'lucide-react';
interface AIEmployee {
  id: string;
  name: string;
  role: string;
  initial: string;
  color: string;
  status: 'active' | 'paused';
  stat: string;
  performance: string;
}
const employees: AIEmployee[] = [{
  id: '1',
  name: 'Sarah',
  role: 'Marketing Manager',
  initial: 'S',
  color: 'bg-purple-100 text-purple-600',
  status: 'active',
  stat: '47 tasks this week',
  performance: '94%'
}, {
  id: '2',
  name: 'Derek',
  role: 'Service Coordinator',
  initial: 'D',
  color: 'bg-blue-100 text-blue-600',
  status: 'active',
  stat: '23 jobs completed',
  performance: '91%'
}, {
  id: '3',
  name: 'Alex',
  role: 'Customer Support',
  initial: 'A',
  color: 'bg-emerald-100 text-emerald-600',
  status: 'active',
  stat: '89 tickets resolved',
  performance: '96%'
}];
export function ActiveServicesGrid() {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      {/* Plan Card */}
      <motion.div whileHover={{
      y: -2
    }} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-32 bg-blue-500 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs font-medium bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
              Tier 2
            </span>
          </div>

          <h3 className="text-xl font-bold mb-1">Growth Plan</h3>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-2xl font-bold">$199</span>
            <span className="text-slate-400 text-sm">/month</span>
          </div>
          <p className="text-sm text-slate-400 mb-6">Renews Jan 15, 2025</p>
        </div>

        <button className="relative z-10 w-full py-2 px-4 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-sm font-medium">
          Manage Plan
        </button>
      </motion.div>

      {/* Employee Cards */}
      {employees.map((emp, index) => <motion.div key={emp.id} initial={{
      opacity: 0,
      scale: 0.9
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      delay: index * 0.1
    }} whileHover={{
      y: -2
    }} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between group">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${emp.color}`}>
                  {emp.initial}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{emp.name}</h4>
                  <p className="text-xs text-slate-500">{emp.role}</p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                Active
              </span>
            </div>

            <div className="space-y-2 mb-6">
              <div className="text-sm text-slate-600 flex justify-between">
                <span>Activity</span>
                <span className="font-medium text-slate-900">{emp.stat}</span>
              </div>
              <div className="text-sm text-slate-600 flex justify-between">
                <span>Performance</span>
                <span className="font-medium text-emerald-600">
                  {emp.performance}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors">
              <Settings className="w-3 h-3" /> Configure
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors">
              <Pause className="w-3 h-3" /> Pause
            </button>
          </div>
        </motion.div>)}

      {/* Add New Card */}
      <motion.button whileHover={{
      scale: 1.02,
      backgroundColor: 'rgba(248, 250, 252, 1)'
    }} whileTap={{
      scale: 0.98
    }} className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all bg-slate-50/50">
        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
          <Plus className="w-6 h-6" />
        </div>
        <span className="font-medium">Add AI Employee</span>
      </motion.button>
    </div>;
}