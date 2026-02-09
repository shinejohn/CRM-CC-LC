import React from 'react';
import { DollarSign, Users, CheckCircle2, TrendingUp } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import { RevenueTrendChart } from '../components/RevenueTrendChart';
import { GoalProgressCards } from '../components/GoalProgressCards';
import { AIEmployeePerformanceTable } from '../components/AIEmployeePerformanceTable';
import { useTheme } from '../contexts/ThemeContext';
import { ColorPicker } from '../components/ColorPicker';
export function PerformanceDashboard() {
  const {
    getColorScheme,
    isDarkMode
  } = useTheme();
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
  return <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Performance Analytics
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Track your business growth and AI workforce efficiency.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(() => {
        const style = getCardStyle('metric-revenue', 'mint');
        return <div className={style.className}>
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ColorPicker cardId="metric-revenue" currentColor="mint" />
              </div>
              <MetricCard label="Revenue" value="$12,450" trend={{
            direction: 'up',
            value: '12%'
          }} icon={DollarSign} iconColor={style.iconColor} iconBg={isDarkMode ? 'bg-black/20' : 'bg-white/50'} progress={{
            current: 12450,
            target: 16000,
            label: 'Monthly Goal'
          }} />
            </div>;
      })()}

        {(() => {
        const style = getCardStyle('metric-customers', 'sky');
        return <div className={style.className}>
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ColorPicker cardId="metric-customers" currentColor="sky" />
              </div>
              <MetricCard label="Active Customers" value="47" trend={{
            direction: 'up',
            value: '5%'
          }} icon={Users} iconColor={style.iconColor} iconBg={isDarkMode ? 'bg-black/20' : 'bg-white/50'} subtext="+2 this week" sparklineData={[40, 42, 41, 44, 45, 47, 47]} />
            </div>;
      })()}

        {(() => {
        const style = getCardStyle('metric-tasks', 'lavender');
        return <div className={style.className}>
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ColorPicker cardId="metric-tasks" currentColor="lavender" />
              </div>
              <MetricCard label="Tasks Completed" value="156" trend={{
            direction: 'up',
            value: '23%'
          }} icon={CheckCircle2} iconColor={style.iconColor} iconBg={isDarkMode ? 'bg-black/20' : 'bg-white/50'} subtext="This month" sparklineData={[20, 40, 60, 50, 80, 90, 100]} />
            </div>;
      })()}

        {(() => {
        const style = getCardStyle('metric-score', 'peach');
        return <div className={style.className}>
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ColorPicker cardId="metric-score" currentColor="peach" />
              </div>
              <MetricCard label="Performance Score" value="94%" trend={{
            direction: 'up',
            value: '3%'
          }} icon={TrendingUp} iconColor={style.iconColor} iconBg={isDarkMode ? 'bg-black/20' : 'bg-white/50'} sparklineData={[88, 89, 90, 92, 91, 93, 94]} />
            </div>;
      })()}
      </div>

      {/* AI Insights */}
      {(() => {
      const style = getCardStyle('ai-insights', 'lavender');
      return <div className={`${style.className} p-1`}>
            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <ColorPicker cardId="ai-insights" currentColor="lavender" />
            </div>
            <AIInsightsPanel />
          </div>;
    })()}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(() => {
        const style = getCardStyle('revenue-chart', 'sky');
        return <div className={`lg:col-span-2 h-[400px] ${style.className} p-1`}>
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ColorPicker cardId="revenue-chart" currentColor="sky" />
              </div>
              <RevenueTrendChart />
            </div>;
      })()}

        {(() => {
        const style = getCardStyle('goal-progress', 'rose');
        return <div className={`lg:col-span-1 h-[400px] ${style.className} p-1`}>
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ColorPicker cardId="goal-progress" currentColor="rose" />
              </div>
              <GoalProgressCards />
            </div>;
      })()}
      </div>

      {/* Performance Table */}
      {(() => {
      const style = getCardStyle('performance-table', 'ocean');
      return <div className={`${style.className} p-1`}>
            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <ColorPicker cardId="performance-table" currentColor="ocean" />
            </div>
            <AIEmployeePerformanceTable />
          </div>;
    })()}
    </div>;
}