import React from 'react';
import { motion } from 'framer-motion';
import { AIModeMenu } from './AIModeMenu';
interface CommandCenterHeaderProps {
  businessName: string;
  isAIMode: boolean;
  onToggleMode: () => void;
  onAIModeNavigate?: (path: string) => void;
}
export function CommandCenterHeader({
  businessName,
  isAIMode,
  onToggleMode,
  onAIModeNavigate
}: CommandCenterHeaderProps) {
  return <div className="h-16 bg-slate-900 dark:bg-slate-950 border-b border-slate-800 dark:border-slate-900 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-40 transition-colors">
      {/* Left: Command Center branding */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-white">Command Center</h1>
      </div>

      {/* Center: Business Name (large and bold) */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <h2 className="text-2xl font-bold text-white">{businessName}</h2>
      </div>

      {/* Right: Mode toggle - UI/AI style matching CC/PA */}
      <div className="flex items-center gap-3">
        <button onClick={onToggleMode} className="relative w-16 h-8 bg-slate-700 dark:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 dark:focus:ring-offset-slate-950">
          {/* Background gradient bar */}
          <motion.div className={`absolute top-1 left-1 w-14 h-6 rounded-full flex items-center justify-between px-1 ${isAIMode ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`} transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30
        }}>
            <span className={`text-[10px] font-bold text-white ${isAIMode ? 'opacity-40' : 'opacity-100'}`}>
              UI
            </span>
            <span className={`text-[10px] font-bold text-white ${isAIMode ? 'opacity-100' : 'opacity-40'}`}>
              AI
            </span>
          </motion.div>

          {/* White sliding indicator */}
          <motion.div className="absolute top-0.5 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center" animate={{
          left: isAIMode ? 'calc(100% - 1.875rem)' : '0.125rem'
        }} transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30
        }}>
            <span className="text-[10px] font-bold text-gray-700">
              {isAIMode ? 'AI' : 'UI'}
            </span>
          </motion.div>
        </button>

        {/* AI Mode Menu - only show when in AI Mode */}
        {isAIMode && onAIModeNavigate && <AIModeMenu onNavigate={onAIModeNavigate} />}
      </div>
    </div>;
}