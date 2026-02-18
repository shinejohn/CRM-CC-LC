import React from 'react';
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
import { useDashboardAnalytics } from '@/hooks/useAnalytics';
import { useAuthStore } from '@/stores/authStore';
interface OverviewDashboardProps {
  onNavigate?: (page: string) => void;
}
function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
}

function formatTimeAgo(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function computeHealthScore(data: { orders?: { total_revenue?: number; paid?: number }; customers?: { total?: number }; conversion?: { rate?: number } } | null): { score: number; label: string; status: 'excellent' | 'good' | 'warning' | 'critical' } {
  if (!data) return { score: 0, label: 'Loading', status: 'critical' as const };
  const revenue = data.orders?.total_revenue ?? 0;
  const customers = data.customers?.total ?? 0;
  const conversion = data.conversion?.rate ?? 0;
  const revenueScore = Math.min(100, (revenue / 10000) * 25);
  const customerScore = Math.min(100, customers * 2);
  const conversionScore = Math.min(100, conversion);
  const score = Math.round((revenueScore + customerScore + conversionScore) / 3);
  if (score >= 80) return { score, label: 'Excellent', status: 'excellent' };
  if (score >= 60) return { score, label: 'Good', status: 'good' };
  if (score >= 40) return { score, label: 'Needs Work', status: 'warning' };
  return { score, label: 'Critical', status: 'critical' };
}

export function OverviewDashboard({
  onNavigate
}: OverviewDashboardProps) {
  const { getColorScheme, isDarkMode } = useTheme();
  const { user } = useAuthStore();
  const { data: analytics, isLoading, isError } = useDashboardAnalytics();

  const health = computeHealthScore(analytics as Parameters<typeof computeHealthScore>[0]);
  const orders = (analytics as { orders?: { total_revenue?: number; recent_revenue?: number; paid?: number; total?: number } })?.orders;
  const customers = (analytics as { customers?: { total?: number; new?: number } })?.customers;
  const totalRevenue = orders?.total_revenue ?? 0;
  const recentRevenue = orders?.recent_revenue ?? 0;
  const revenueOverTime = (analytics as { orders?: { revenue_over_time?: Array<{ revenue: number }> } })?.orders?.revenue_over_time ?? [];
  const revLen = revenueOverTime.length;
  const revenueChange = revLen >= 2
    ? (() => {
        const recent = revenueOverTime.slice(-Math.ceil(revLen / 2)).reduce((s, x) => s + x.revenue, 0);
        const prev = revenueOverTime.slice(0, Math.floor(revLen / 2)).reduce((s, x) => s + x.revenue, 0);
        return prev > 0 ? Math.round(((recent - prev) / prev) * 100) : 0;
      })()
    : 0;
  const customerCount = customers?.total ?? 0;
  const newCustomers = customers?.new ?? 0;
  const customerChange = newCustomers;
  const paidOrders = orders?.paid ?? 0;
  const totalOrders = orders?.total ?? 0;
  const pendingJobs = Math.max(0, totalOrders - paidOrders);
  const aov = paidOrders > 0 ? totalRevenue / paidOrders : 0;

  const recentActivity = (analytics as { recent_activity?: { customers?: Array<{ id: string; business_name?: string; created_at: string }>; orders?: Array<{ id: string; order_number?: string; total?: number; payment_status?: string; created_at: string }>; conversations?: Array<{ id: string; outcome?: string; started_at: string }> } })?.recent_activity;
  const activityItems = React.useMemo(() => {
    const items: Array<{ id: string; text: string; time: string; type: 'success' | 'warning' | 'error' | 'info'; action?: string }> = [];
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
    recentActivity?.customers?.slice(0, 3).forEach((c) => {
      items.push({ id: `cust-${c.id}`, text: `New customer: ${c.business_name ?? 'Unknown'}`, time: formatTimeAgo(c.created_at), type: 'info', action: 'View' });
    });
    recentActivity?.orders?.slice(0, 3).forEach((o) => {
      const isPaid = o.payment_status === 'paid';
      items.push({
        id: `ord-${o.id}`,
        text: isPaid ? `Payment received: ${fmt(o.total ?? 0)}` : `Order ${o.order_number ?? o.id} pending`,
        time: formatTimeAgo(o.created_at),
        type: isPaid ? 'success' : 'warning',
        action: isPaid ? undefined : 'View'
      });
    });
    recentActivity?.conversations?.slice(0, 3).forEach((c) => {
      items.push({ id: `conv-${c.id}`, text: `Conversation ${c.outcome ? `(${c.outcome})` : ''}`, time: formatTimeAgo(c.started_at), type: 'info', action: 'View' });
    });
    return items.sort((a, b) => {
      const tA = a.time.includes('m') ? 0 : a.time.includes('h') ? 1 : 2;
      const tB = b.time.includes('m') ? 0 : b.time.includes('h') ? 1 : 2;
      return tA - tB;
    }).slice(0, 6);
  }, [recentActivity]);
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
            {isLoading ? 'Loading...' : `Good ${new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, ${user?.name?.split(' ')[0] ?? 'there'} 👋`}
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
            {isLoading ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 h-full flex items-center justify-center border border-slate-100 dark:border-slate-700">
                <div className="animate-pulse h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-600" />
              </div>
            ) : (
              <BusinessHealthScore score={health.score} label={health.label} status={health.status} />
            )}
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
                <MetricCard label="Total Revenue" value={isLoading ? '—' : formatCurrency(totalRevenue)} trend={{
              direction: revenueChange >= 0 ? 'up' : 'down',
              value: isLoading ? '—' : `${Math.abs(revenueChange)}%`
            }} icon={DollarSign} iconColor={style.iconColor} iconBg={isDarkMode ? 'bg-black/20' : 'bg-white/50'} />
              </div>;
        })()}

          {(() => {
          const style = getCardStyle('metric-customers', 'mint');
          return <div className={style.className}>
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ColorPicker cardId="metric-customers" currentColor="mint" />
                </div>
                <MetricCard label="Active Customers" value={isLoading ? '—' : String(customerCount)} trend={{
              direction: newCustomers > 0 ? 'up' : 'neutral',
              value: isLoading ? '—' : (newCustomers > 0 ? `+${newCustomers} new` : '0')
            }} icon={Users} iconColor={style.iconColor} iconBg={isDarkMode ? 'bg-black/20' : 'bg-white/50'} />
              </div>;
        })()}

          {(() => {
          const style = getCardStyle('metric-aov', 'lavender');
          return <div className={style.className}>
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ColorPicker cardId="metric-aov" currentColor="lavender" />
                </div>
                <MetricCard label="Avg Order Value" value={isLoading ? '—' : formatCurrency(aov)} trend={{
              direction: 'neutral',
              value: isLoading ? '—' : (paidOrders > 0 ? `${paidOrders} paid` : '0')
            }} icon={TrendingUp} iconColor={style.iconColor} iconBg={isDarkMode ? 'bg-black/20' : 'bg-white/50'} />
              </div>;
        })()}

          {(() => {
          const style = getCardStyle('metric-jobs', 'sunshine');
          return <div className={style.className}>
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ColorPicker cardId="metric-jobs" currentColor="sunshine" />
                </div>
                <MetricCard label="Pending Jobs" value={isLoading ? '—' : String(pendingJobs)} trend={{
              direction: pendingJobs > 0 ? 'down' : 'neutral',
              value: isLoading ? '—' : String(orders?.recent ?? 0)
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
                <RevenueTrendChart
                  revenueOverTime={revenueOverTime}
                  totalRevenue={totalRevenue}
                  recentRevenue={recentRevenue}
                  isLoading={isLoading}
                />
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
      </motion.div>

      {/* Bottom Row: Activity Feed & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <div onClick={() => onNavigate?.('activity-full')} className="cursor-pointer h-full transition-transform hover:scale-[1.01]">
            <ActivityFeed
              activities={activityItems}
              isLoading={isLoading}
              onViewAll={() => onNavigate?.('activity-full')}
            />
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