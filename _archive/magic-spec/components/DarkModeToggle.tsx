import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
export function DarkModeToggle() {
  const {
    isDarkMode,
    toggleDarkMode
  } = useTheme();
  return <button onClick={toggleDarkMode} className={`relative w-14 h-8 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode ? 'bg-slate-700 focus:ring-slate-500' : 'bg-gray-200 focus:ring-gray-400'}`} aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
      <motion.div className={`absolute top-1 w-6 h-6 rounded-full shadow-md flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`} animate={{
      x: isDarkMode ? 28 : 4
    }} transition={{
      type: 'spring',
      stiffness: 500,
      damping: 30
    }}>
        {isDarkMode ? <Moon className="w-3.5 h-3.5 text-blue-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
      </motion.div>
    </button>;
}