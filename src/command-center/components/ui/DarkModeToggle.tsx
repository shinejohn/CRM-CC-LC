import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../core/ThemeProvider';

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`
              relative p-2 rounded-md transition-colors
              ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-300'}
            `}
            title={option.label}
            aria-label={`Set theme to ${option.label}`}
          >
            {isActive && (
              <motion.div
                layoutId="theme-toggle-active"
                className="absolute inset-0 bg-white dark:bg-slate-600 rounded-md shadow-sm"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className="w-4 h-4 relative z-10" />
          </button>
        );
      })}
    </div>
  );
}

