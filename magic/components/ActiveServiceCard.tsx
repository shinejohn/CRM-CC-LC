import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Pause, Settings, BarChart2, ArrowUpCircle } from 'lucide-react';
interface ActiveServiceCardProps {
  type: 'employee' | 'service';
  data: {
    id: string;
    name: string;
    role?: string;
    avatar?: string;
    initial?: string;
    color?: string;
    status?: 'active' | 'paused';
    stats?: {
      label: string;
      value: string;
      subtext?: string;
    };
    performance?: number;
    usage?: {
      current: number;
      limit: number;
      unit: string;
      resetDays: number;
    };
  };
}
export function ActiveServiceCard({
  type,
  data
}: ActiveServiceCardProps) {
  if (type === 'employee') {
    return <motion.div whileHover={{
      y: -2
    }} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between group h-full">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${data.color || 'bg-slate-100 text-slate-600'}`}>
                {data.initial}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{data.name}</h4>
                <p className="text-xs text-slate-500">{data.role}</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className={`w-2 h-2 rounded-full ${data.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className={`text-xs font-medium uppercase tracking-wide ${data.status === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>
              {data.status}
            </span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="text-sm text-slate-600 flex justify-between items-center">
              <span>Tasks this week</span>
              <span className="font-medium text-slate-900">
                {data.stats?.value}
              </span>
            </div>

            <div>
              <div className="text-sm text-slate-600 flex justify-between items-center mb-1">
                <span>Performance</span>
                <span className="font-medium text-emerald-600">
                  {data.performance}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{
                width: 0
              }} animate={{
                width: `${data.performance}%`
              }} transition={{
                duration: 1,
                ease: 'easeOut'
              }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors border border-slate-200">
            <Settings className="w-3 h-3" /> Configure
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors border border-slate-200">
            <Pause className="w-3 h-3" /> Pause
          </button>
        </div>
      </motion.div>;
  }
  // Service Card Variant
  const usagePercent = data.usage ? Math.round(data.usage.current / data.usage.limit * 100) : 0;
  return <motion.div whileHover={{
    y: -2
  }} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between group h-full">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-2xl">
              {data.avatar || '⚡'}
            </div>
            <div>
              <h4 className="font-bold text-slate-900">{data.name}</h4>
              <p className="text-xs text-slate-500">
                {data.usage?.limit.toLocaleString()} {data.usage?.unit}/mo
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-600">
                Used: {data.usage?.current.toLocaleString()} ({usagePercent}%)
              </span>
              <span className="font-medium text-slate-900">
                {data.usage?.limit.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div initial={{
              width: 0
            }} animate={{
              width: `${usagePercent}%`
            }} transition={{
              duration: 1,
              ease: 'easeOut'
            }} className={`h-full rounded-full ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 75 ? 'bg-amber-500' : 'bg-blue-500'}`} />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            Next reset:{' '}
            <span className="font-medium text-slate-700">
              {data.usage?.resetDays} days
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors border border-blue-100">
          <ArrowUpCircle className="w-3 h-3" /> Upgrade
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors border border-slate-200">
          <BarChart2 className="w-3 h-3" /> Stats
        </button>
      </div>
    </motion.div>;
}