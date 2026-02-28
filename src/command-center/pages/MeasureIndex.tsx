import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { BarChart3, Eye, MousePointerClick, DollarSign, ArrowRight, TrendingUp } from 'lucide-react';
import { PageHeader, MetricCard, DataCard } from '@/components/shared';

// TODO: wire to API — replace with real analytics data
const trendData = [
  { period: 'This Week', views: '847', engagement: '3.4%', revenue: '$1,200' },
  { period: 'Last Week', views: '756', engagement: '3.1%', revenue: '$980' },
  { period: '2 Weeks Ago', views: '702', engagement: '2.8%', revenue: '$850' },
  { period: '3 Weeks Ago', views: '680', engagement: '2.5%', revenue: '$790' },
];

export function MeasureIndex() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Measure"
        subtitle="Track performance across your marketing, sales, and service delivery"
      />

      {/* Top-Line Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Views" value="847" icon={Eye} color="blue" change={{ value: 12, direction: 'up' }} />
        <MetricCard label="Engagement Rate" value="3.4%" icon={MousePointerClick} color="green" change={{ value: 0.3, direction: 'up' }} />
        <MetricCard label="Revenue This Month" value="$4,250" icon={DollarSign} color="purple" change={{ value: 8, direction: 'up' }} />
        <MetricCard label="Engagement Score" value="72" icon={TrendingUp} color="amber" change={{ value: 5, direction: 'up' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Trend Table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <DataCard title="Weekly Trends" icon={BarChart3}>
            <div className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--nexus-divider)]">
                    <th className="text-left py-2 text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider">Period</th>
                    <th className="text-right py-2 text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider">Views</th>
                    <th className="text-right py-2 text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider">Engagement</th>
                    <th className="text-right py-2 text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.map((row, i) => (
                    <tr key={i} className={i < trendData.length - 1 ? 'border-b border-[var(--nexus-divider)]' : ''}>
                      <td className="py-3 text-[var(--nexus-text-primary)] font-medium">{row.period}</td>
                      <td className="py-3 text-right text-[var(--nexus-text-secondary)]">{row.views}</td>
                      <td className="py-3 text-right text-[var(--nexus-text-secondary)]">{row.engagement}</td>
                      <td className="py-3 text-right text-[var(--nexus-text-secondary)]">{row.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataCard>
        </motion.div>

        {/* Value Delivered */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <DataCard title="Value Delivered" icon={DollarSign} subtitle="Advertising value received through Fibonacco">
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-[var(--nexus-accent-primary)]">$2,450</p>
                <p className="text-sm text-[var(--nexus-text-secondary)] mt-1">Equivalent ad spend value this month</p>
              </div>
              <div className="space-y-2">
                {[
                  { source: 'Day.News Articles', value: '$800' },
                  { source: 'Downtown Guide Listing', value: '$450' },
                  { source: 'Social Media Reach', value: '$650' },
                  { source: 'Email Campaign Impressions', value: '$550' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-[var(--nexus-text-secondary)]">{item.source}</span>
                    <span className="text-sm font-medium text-[var(--nexus-text-primary)]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </DataCard>
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2">
          <DataCard title="Reports & Analytics">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Full Report', href: '/command-center/measure/reports', icon: BarChart3 },
                { label: 'Detailed Analytics', href: '/command-center/measure/analytics', icon: TrendingUp },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.href)}
                  className="flex items-center gap-3 p-4 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)] hover:bg-[var(--nexus-card-bg-hover)] transition-colors group"
                >
                  <action.icon className="w-5 h-5 text-[var(--nexus-accent-primary)]" />
                  <span className="text-sm font-medium text-[var(--nexus-text-primary)]">{action.label}</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-[var(--nexus-text-tertiary)] group-hover:text-[var(--nexus-accent-primary)] transition-colors" />
                </button>
              ))}
            </div>
          </DataCard>
        </motion.div>
      </div>
    </div>
  );
}
