import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, ArrowUpRight } from 'lucide-react';

interface RevenueTrendChartProps {
  revenueOverTime?: Array<{ date: string; revenue: number }>;
  totalRevenue?: number;
  recentRevenue?: number;
  isLoading?: boolean;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function RevenueTrendChart({ revenueOverTime = [], totalRevenue = 0, recentRevenue = 0, isLoading = false }: RevenueTrendChartProps) {
  const points = revenueOverTime.length > 0
    ? revenueOverTime.map((p) => p.revenue)
    : [];
  const maxVal = Math.max(...points, 1);
  const data = points.length > 0
    ? points.map((v) => Math.round((v / maxVal) * 100))
    : [0, 0, 0, 0, 0, 0, 0];
  const prevData = data.map((v) => Math.max(0, v - 10));
  const goal = 90;
  const labels = revenueOverTime.length > 0
    ? revenueOverTime.map((p) => {
        const d = new Date(p.date);
        return MONTHS[d.getMonth()];
      })
    : ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
  const pctChange = totalRevenue > 0 && recentRevenue > 0 && totalRevenue !== recentRevenue
    ? Math.round(((recentRevenue / (totalRevenue - recentRevenue || 1)) - 1) * 100)
    : 0;

  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" /> Revenue Trend
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {revenueOverTime.length > 0 ? `${revenueOverTime.length} days` : 'Last 6 months performance'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">
            {isLoading ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(totalRevenue)}
          </div>
          {!isLoading && pctChange !== 0 && (
            <div className={`text-xs font-medium flex items-center justify-end gap-1 ${pctChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              <ArrowUpRight className={`w-3 h-3 ${pctChange < 0 ? 'rotate-180' : ''}`} /> {pctChange >= 0 ? '+' : ''}{pctChange}% vs prior
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative min-h-[200px] flex items-end justify-between gap-2 px-2 pb-6 border-b border-slate-100">
        {/* Y-Axis Labels */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-slate-400 pointer-events-none">
          <span>$15k</span>
          <span>$10k</span>
          <span>$5k</span>
          <span>$0</span>
        </div>

        {/* Goal Line */}
        <div className="absolute left-8 right-0 top-[20%] border-t-2 border-dashed border-slate-300 flex items-center">
          <span className="bg-white px-1 text-xs font-bold text-slate-400 -mt-2.5 ml-auto">
            Goal
          </span>
        </div>

        {/* Chart Bars/Points */}
        <div className="flex-1 ml-8 flex items-end justify-between h-full relative z-10">
          {data.map((value, index) => <div key={index} className="flex-1 flex flex-col justify-end items-center gap-1 group relative h-full">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20 pointer-events-none">
                {points[index] != null
                  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(points[index])
                  : '—'}
              </div>

              {/* Bar Container */}
              <div className="w-full max-w-[40px] h-full flex items-end relative">
                {/* Previous Period (Ghost Bar) */}
                <motion.div initial={{
              height: 0
            }} animate={{
              height: `${prevData[index]}%`
            }} transition={{
              duration: 0.8,
              delay: index * 0.1
            }} className="w-full absolute bottom-0 bg-slate-100 rounded-t-sm" />

                {/* Current Period */}
                <motion.div initial={{
              height: 0
            }} animate={{
              height: `${value}%`
            }} transition={{
              duration: 1,
              delay: index * 0.1
            }} className="w-full absolute bottom-0 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm opacity-90 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* X-Axis Label */}
              <span className="text-xs text-slate-500 absolute -bottom-6">
                {labels[index] ?? ''}
              </span>
            </div>)}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-xs text-slate-600">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-200" />
          <span className="text-xs text-slate-600">Previous</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-slate-300" />
          <span className="text-xs text-slate-600">Goal</span>
        </div>
      </div>
    </div>;
}