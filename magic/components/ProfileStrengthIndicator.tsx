import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRight } from 'lucide-react';
interface ProfileStrengthIndicatorProps {
  strength?: number;
  onCompleteClick?: () => void;
}
export function ProfileStrengthIndicator({
  strength = 65,
  onCompleteClick
}: ProfileStrengthIndicatorProps) {
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            My Business Profile
          </h2>
          <p className="text-sm text-slate-500">
            Complete your profile to help your AI employees serve customers
            better.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-md">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-slate-700">
            Profile Strength
          </span>
          <span className="text-lg font-bold text-blue-600">{strength}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div initial={{
          width: 0
        }} animate={{
          width: `${strength}%`
        }} transition={{
          duration: 1,
          ease: 'easeOut'
        }} className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
        </div>
      </div>

      <button onClick={onCompleteClick} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
        Complete Now <ArrowRight className="w-4 h-4" />
      </button>
    </div>;
}