import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, ChevronDown, Search, Settings, LogOut, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isAIMode: boolean;
  onToggleMode: () => void;
  businessName?: string;
}

export function Header({ isAIMode, onToggleMode, businessName = 'My Business' }: HeaderProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 shadow-sm">
      {/* Left: Logo & Business Name */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-md">
          F
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Command Center
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {businessName}
          </p>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search customers, content, campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-100 dark:bg-slate-600 px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Mode Toggle, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Mode Toggle: CC (Command Center) / PA (Personal Assistant) */}
        <ModeToggle isAIMode={isAIMode} onToggle={onToggleMode} />
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-gray-500 dark:text-slate-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* Profile Dropdown */}
        <ProfileDropdown 
          isOpen={profileMenuOpen}
          onToggle={() => setProfileMenuOpen(!profileMenuOpen)}
        />
      </div>
    </header>
  );
}

// Mode Toggle Sub-component
function ModeToggle({ isAIMode, onToggle }: { isAIMode: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-16 h-8 bg-gray-200 dark:bg-slate-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      aria-label={isAIMode ? 'Switch to Command Center mode' : 'Switch to Personal Assistant mode'}
    >
      <motion.div
        className={`absolute top-1 left-1 w-14 h-6 rounded-full flex items-center justify-between px-1 ${
          isAIMode
            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
            : 'bg-gradient-to-r from-blue-500 to-cyan-500'
        }`}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <span className={`text-[10px] font-bold text-white ${isAIMode ? 'opacity-40' : 'opacity-100'}`}>
          CC
        </span>
        <span className={`text-[10px] font-bold text-white ${isAIMode ? 'opacity-100' : 'opacity-40'}`}>
          PA
        </span>
      </motion.div>
      <motion.div
        className="absolute top-0.5 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center"
        animate={{ left: isAIMode ? 'calc(100% - 1.875rem)' : '0.125rem' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <span className="text-[10px] font-bold text-gray-700">
          {isAIMode ? 'PA' : 'CC'}
        </span>
      </motion.div>
    </button>
  );
}

// Profile Dropdown Sub-component
function ProfileDropdown({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 rounded-full px-3 py-2 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-sm font-bold text-white">
          JD
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-50"
        >
          <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
            <p className="font-medium text-gray-900 dark:text-white">John Doe</p>
            <p className="text-sm text-gray-500 dark:text-slate-400">john@business.com</p>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-left">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-slate-300">Profile</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-left">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 dark:text-slate-300">Settings</span>
          </button>
          <hr className="my-2 border-gray-100 dark:border-slate-700" />
          <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-left">
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 dark:text-red-400">Sign Out</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}

