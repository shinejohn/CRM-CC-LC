import React from 'react';
import { motion } from 'framer-motion';
interface BusinessHealthScoreProps {
  score: number;
  label: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}
export function BusinessHealthScore({
  score,
  label,
  status
}: BusinessHealthScoreProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - score / 100 * circumference;
  const colors = {
    excellent: {
      text: 'text-emerald-600',
      stroke: 'var(--nexus-059669)',
      bg: 'bg-emerald-50'
    },
    good: {
      text: 'text-blue-600',
      stroke: 'var(--nexus-2563eb)',
      bg: 'bg-blue-50'
    },
    warning: {
      text: 'text-amber-500',
      stroke: 'var(--nexus-d97706)',
      bg: 'bg-amber-50'
    },
    critical: {
      text: 'text-red-600',
      stroke: 'var(--nexus-dc2626)',
      bg: 'bg-red-50'
    }
  };
  const color = colors[status];
  return <motion.div initial={{
    opacity: 0,
    scale: 0.95
  }} animate={{
    opacity: 1,
    scale: 1
  }} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center h-full relative overflow-hidden">
      <h3 className="text-slate-500 text-sm font-medium absolute top-6 left-6">
        Business Health
      </h3>

      <div className="relative w-48 h-48 flex items-center justify-center mt-4">
        {/* Background Ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="96" cy="96" r={radius} stroke="var(--nexus-e2e8f0)" strokeWidth="12" fill="transparent" className="opacity-30" />
          {/* Progress Ring */}
          <motion.circle cx="96" cy="96" r={radius} stroke={color.stroke} strokeWidth="12" fill="transparent" strokeDasharray={circumference} initial={{
          strokeDashoffset: circumference
        }} animate={{
          strokeDashoffset
        }} transition={{
          duration: 1.5,
          ease: 'easeOut'
        }} strokeLinecap="round" />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.5
        }} className="text-5xl font-bold text-slate-900">
            {score}
          </motion.span>
          <motion.span initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.7
        }} className={`text-sm font-semibold mt-1 ${color.text} px-3 py-1 rounded-full ${color.bg}`}>
            {label}
          </motion.span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-4 text-center max-w-[200px]">
        Based on revenue, customer retention, and operational efficiency.
      </p>
    </motion.div>;
}