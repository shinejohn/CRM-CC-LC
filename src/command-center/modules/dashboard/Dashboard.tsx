import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '../../core/ThemeProvider';
import { MetricsRow } from './MetricsRow';
import { DashboardGrid } from './DashboardGrid';
import { QuickActionDock } from './QuickActionDock';
import { useDashboard } from '../../hooks/useDashboard';

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const { isDarkMode } = useTheme();
  const { metrics, widgets, activities, isLoading, refreshDashboard } = useDashboard();

  return (
    <div className="space-y-6 pb-24">
      {/* Search Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search activities, customers, content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 shadow-sm rounded-xl"
            aria-label="Search dashboard"
          />
        </div>
      </motion.div>

      {/* Quick Action Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-slate-700 rounded-xl h-12"
          aria-label="Quick actions menu"
        >
          <Plus className="w-4 h-4 mr-2" />
          Quick Action
          <ChevronDown className="w-4 h-4 ml-auto" />
        </Button>
      </motion.div>

      {/* Metrics Row */}
      <MetricsRow metrics={metrics} isLoading={isLoading} />

      {/* Main Dashboard Grid */}
      <DashboardGrid widgets={widgets} activities={activities} />

      {/* Quick Action Dock (Fixed at bottom) */}
      <QuickActionDock />
    </div>
  );
}

