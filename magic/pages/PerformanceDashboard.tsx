import React from 'react';
import { DollarSign, Users, CheckCircle2, TrendingUp } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { AIInsightsPanel } from '../components/AIInsightsPanel';
import { RevenueTrendChart } from '../components/RevenueTrendChart';
import { GoalProgressCards } from '../components/GoalProgressCards';
import { AIEmployeePerformanceTable } from '../components/AIEmployeePerformanceTable';
import { useTheme } from '../contexts/ThemeContext';
import { ColorPicker } from '../components/ColorPicker';
import { useDashboardAnalytics } from '@/hooks/useAnalytics';

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

export function PerformanceDashboard() {
  const { getColorScheme, isDarkMode } = useTheme();
  const { data: analytics, isLoading } = useDashboardAnalytics();
  const orders = (analytics as { orders?: { total_revenue?: number; recent_revenue?: number; paid?: number; recent?: number } })?.orders;
  const customers = (analytics as { customers?: { total?: number; new?: number } })?.customers;
  const conversion = (analytics as { conversion?: { rate?: number } })?.conversion;
  const totalRevenue = orders?.total_revenue ?? 0;
  const customerCount = customers?.total ?? 0;
  const paidOrders = orders?.paid ?? 0;
  const revenueOverTime = (analytics as { orders?: { revenue_over_time?: Array<{ date: string; revenue: number }> } })?.orders?.revenue_over_time ?? [];
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
              <MetricCard label="Revenue" value={isLoading ? '—' : formatCurrency(totalRevenue)} trend={{
            direction: 'up',
            value: isLoading ? '—' : `${paidOrders} paid`
          }} icon={DollarSign} iconColor={style.iconColor} iconBg={isDarkMode ? 'bg-black/20' : 'bg-white/50'} progress={{
            current: totalRevenue,
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
              <MetricCard label="Active Customers" value={isLoading ? '—' : String(customerCount)} trend={{
            direction: (customers?.new ?? 0) > 0 ? 'up' : 'neutral',
            value: isLoading ? '—' : `+${customers?.new ?? 0} new`
          }} icon={Users} iconColor={style.iconColor} iconBg={isDarkMode ? 'bg-black/20' : 'bg-white/50'} subtext={`${customers?.new ?? 0} this period`} sparklineData={revenueOverTime.length > 0 ? revenueOverTime.slice(-7).map((p) => Math.min(100, (p.revenue / Math.max(...revenueOverTime.map((x) => x.revenue), 1)) * 100)) : undefined} />
            </div>;
      })()}

        {(() => {
        const style = getCardStyle('metric-tasks', 'lavender');
        return <div className={style.className}>
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ColorPicker cardId="metric-tasks" currentColor="lavender" />
              </div>
              <MetricCard label="Tasks Completed" value={isLoading ? '—' : String(paidOrders)} trend={{
            direction: 'up',
            value: isLoading ? '—' : `${orders?.recent ?? 0} recent`
          }} icon={CheckCircle2} iconColor={style.iconColor} iconBg={isDarkMode ? 'bg-black/20' : 'bg-white/50'} subtext="Paid orders" sparklineData={revenueOverTime.length >= 7 ? revenueOverTime.slice(-7).map((p) => Math.min(100, (p.revenue / Math.max(...revenueOverTime.map((x) => x.revenue), 1)) * 100)) : undefined} />
            </div>;
      })()}

        {(() => {
        const style = getCardStyle('metric-score', 'peach');
        return <div className={style.className}>
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ColorPicker cardId="metric-score" currentColor="peach" />
              </div>
              <MetricCard label="Performance Score" value={isLoading ? '—' : `${Math.round(conversion?.rate ?? 0)}%`} trend={{
            direction: (conversion?.rate ?? 0) >= 50 ? 'up' : 'neutral',
            value: isLoading ? '—' : 'Conversion'
          }} icon={TrendingUp} iconColor={style.iconColor} iconBg={isDarkMode ? 'bg-black/20' : 'bg-white/50'} sparklineData={revenueOverTime.length >= 7 ? revenueOverTime.slice(-7).map((p) => Math.min(100, (p.revenue / Math.max(...revenueOverTime.map((x) => x.revenue), 1)) * 100)) : undefined} />
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
              <RevenueTrendChart
                revenueOverTime={revenueOverTime}
                totalRevenue={totalRevenue}
                recentRevenue={(analytics as { orders?: { recent_revenue?: number } })?.orders?.recent_revenue ?? 0}
                isLoading={isLoading}
              />
            </div>;
      })()}

        {(() => {
        const style = getCardStyle('goal-progress', 'rose');
        return <div className={`lg:col-span-1 h-[400px] ${style.className} p-1`}>
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ColorPicker cardId="goal-progress" currentColor="rose" />
              </div>
              <GoalProgressCards
                totalRevenue={totalRevenue}
                revenueTarget={16000}
                customerCount={customerCount}
                customerTarget={Math.max(customerCount + 10, 10)}
                paidOrders={paidOrders}
                orderTarget={Math.max(paidOrders + 10, 50)}
                isLoading={isLoading}
              />
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