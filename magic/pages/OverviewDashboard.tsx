import React, { Children } from 'react';
import { motion } from 'framer-motion';
import { BusinessHealthScore } from '../components/BusinessHealthScore';
import { MetricCard } from '../components/MetricCard';
import { RevenueTrendChart } from '../components/RevenueTrendChart';
import { ActivityFeed } from '../components/ActivityFeed';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import { AIRecommendationsPanel } from '../components/AIRecommendationsPanel';
import { QuickActionsBar } from '../components/QuickActionsBar';
import { GoalProgressCards } from '../components/GoalProgressCards';
import { DollarSign, Users, TrendingUp, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { ColorPicker } from '../components/ColorPicker';
interface OverviewDashboardProps {
  onNavigate?: (page: string) => void;
}
export function OverviewDashboard({
  onNavigate
}: OverviewDashboardProps) {
  const {
    getColorScheme,
    isDarkMode
  } = useTheme();
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  // Helper to get card styles
  const getCardStyle = (id: string, defaultColor: string) => {
    const scheme = getColorScheme(id, defaultColor);
    return {
      className: `bg-gradient-to-br ${scheme.gradient} rounded-xl shadow-lg border-2 ${scheme.border} overflow-hidden relative group`,
      iconBg: scheme.iconBg,
      iconColor: scheme.iconColor,
      textClass: scheme.text
    };
  };
  return <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 pb-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Good Morning, John 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActionsBar />

      {/* Top Row: Health Score & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score - Takes up 1 column */}
        <motion.div variants={itemVariants} className="lg:col-span-1 h-full">
          <div onClick={() => onNavigate?.('health-score-detail')} className="cursor-pointer h-full transition-transform hover:scale-[1.02]">
            <BusinessHealthScore score={87} label="Excellent" status="excellent" />
          </div>
        </motion.div>

        {/* Key Metrics - Takes up 2 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(() => {
          const style = getCardStyle('metric-revenue', 'sky');
          return <div onClick={() => onNavigate?.('revenue-detail')} className={`cursor-pointer transition-transform hover:scale-[1.02] ${style.className}`}>
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ColorPicker cardId="metric-revenue" currentColor="sky" />
                </div>
                <MetricCard label="Total Revenue" value="$12,450" trend={{
              direction: 'up',
              value: '12%'
            }} icon={DollarSign} iconColor={style.iconColor} iconBg={isDarkMode ? 'bg-black/20' : 'bg-white/50'} />
              </div>;
        })()}

          {(() => {
          const style = getCardStyle('metric-customers', 'mint');
          return <div className={style.className}>
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ColorPicker cardId="metric-customers" currentColor="mint" />
                </div>
                <MetricCard label="Active Customers" value="247" trend={{
              direction: 'up',
              value: '8%'
            }} icon={Users} iconColor={style.iconColor} iconBg={isDarkMode ? 'bg-black/20' : 'bg-white/50'} />
              </div>;
        })()}

          {(() => {
          const style = getCardStyle('metric-aov', 'lavender');
          return <div className={style.className}>
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ColorPicker cardId="metric-aov" currentColor="lavender" />
                </div>
                <MetricCard label="Avg Order Value" value="$285" trend={{
              direction: 'up',
              value: '5%'
            }} icon={TrendingUp} iconColor={style.iconColor} iconBg={isDarkMode ? 'bg-black/20' : 'bg-white/50'} />
              </div>;
        })()}

          {(() => {
          const style = getCardStyle('metric-jobs', 'sunshine');
          return <div className={style.className}>
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ColorPicker cardId="metric-jobs" currentColor="sunshine" />
                </div>
                <MetricCard label="Pending Jobs" value="12" trend={{
              direction: 'down',
              value: '2%'
            }} icon={Calendar} iconColor={style.iconColor} iconBg={isDarkMode ? 'bg-black/20' : 'bg-white/50'} />
              </div>;
        })()}
        </motion.div>
      </div>

      {/* Middle Row: Revenue Chart & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          {(() => {
          const style = getCardStyle('revenue-chart', 'sky');
          return <div onClick={() => onNavigate?.('revenue-detail')} className={`cursor-pointer h-full transition-transform hover:scale-[1.01] ${style.className} p-1`}>
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ColorPicker cardId="revenue-chart" currentColor="sky" />
                </div>
                <RevenueTrendChart />
              </div>;
        })()}
        </motion.div>
        <motion.div variants={itemVariants} className="lg:col-span-1">
          {(() => {
          const style = getCardStyle('ai-insights', 'lavender');
          return <div className={`${style.className} p-1 h-full`}>
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ColorPicker cardId="ai-insights" currentColor="lavender" />
                </div>
                <AIInsightsPanel />
              </div>;
        })()}
        </motion.div>
      </div>

      {/* Goals Section */}
      <motion.div variants={itemVariants}>
        {(() => {
        const style = getCardStyle('goals', 'rose');
        return <div className={`${style.className} p-1`}>
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ColorPicker cardId="goals" currentColor="rose" />
              </div>
              <GoalProgressCards />
            </div>;
      })()}
      </motion.div>

      {/* Bottom Row: Activity Feed & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <div onClick={() => onNavigate?.('activity-full')} className="cursor-pointer h-full transition-transform hover:scale-[1.01]">
            <ActivityFeed />
          </div>
        </motion.div>
        <motion.div variants={itemVariants}>
          <div onClick={() => onNavigate?.('recommendations-full')} className="cursor-pointer h-full transition-transform hover:scale-[1.01]">
            <AIRecommendationsPanel />
          </div>
        </motion.div>
      </div>
    </motion.div>;
}