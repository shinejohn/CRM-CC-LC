import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  Briefcase, CreditCard, Globe, ArrowRight,
  DollarSign, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { PageHeader, MetricCard, DataCard, StatusBadge } from '@/components/shared';
import { usePermission, type Resource } from '@/hooks/usePermission';

// TODO: wire to API — replace with real services/billing data
const mockServices = [
  { name: 'SEO Optimization', status: 'active' as const, lastUpdate: '2 days ago' },
  { name: 'Social Media Management', status: 'active' as const, lastUpdate: '1 day ago' },
  { name: 'Email Marketing', status: 'pending' as const, lastUpdate: '5 days ago' },
  { name: 'Content Writing', status: 'active' as const, lastUpdate: '3 hours ago' },
  { name: 'PPC Advertising', status: 'inactive' as const, lastUpdate: '2 weeks ago' },
];

const platforms = [
  { name: 'Day.News', status: 'active' as const, completion: 100 },
  { name: 'Downtown Guide', status: 'active' as const, completion: 85 },
  { name: 'GoEventCity', status: 'pending' as const, completion: 60 },
  { name: 'Alphasite', status: 'inactive' as const, completion: 0 },
];

export function DeliverIndex() {
  const navigate = useNavigate();
  const { allowed: canViewBilling } = usePermission('view', 'billing');
  const { allowed: canManageServices } = usePermission('manage', 'services');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deliver"
        subtitle="What you're delivering and getting paid for — services, billing, and platform presence"
      />

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Active Services" value={String(mockServices.filter((s) => s.status === 'active').length)} icon={Briefcase} color="blue" />
        <MetricCard label="Revenue This Month" value="$4,250" icon={DollarSign} color="green" />
        <MetricCard label="Outstanding Invoices" value="$2,800" icon={CreditCard} color="amber" />
        <MetricCard label="Overdue Amount" value="$800" icon={AlertCircle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active Services */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <DataCard title="Active Services" icon={Briefcase}
            headerAction={
              <button onClick={() => navigate('/command-center/deliver')} className="text-xs font-medium text-[var(--nexus-accent-primary)] hover:underline flex items-center gap-1">
                Manage <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-3">
              {mockServices.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)]">
                  <div>
                    <p className="text-sm font-medium text-[var(--nexus-text-primary)]">{s.name}</p>
                    <p className="text-xs text-[var(--nexus-text-secondary)]">Updated {s.lastUpdate}</p>
                  </div>
                  <StatusBadge status={s.status} size="sm" />
                </div>
              ))}
            </div>
          </DataCard>
        </motion.div>

        {/* Platform Status */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <DataCard title="Platform Presence" icon={Globe}
            headerAction={
              <button onClick={() => navigate('/command-center/deliver/platforms')} className="text-xs font-medium text-[var(--nexus-accent-primary)] hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-3">
              {platforms.map((p, i) => (
                <div key={i} className="p-3 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-[var(--nexus-text-primary)]">{p.name}</p>
                    <StatusBadge status={p.status} size="sm" />
                  </div>
                  {p.status !== 'inactive' && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--nexus-divider)]">
                        <div className="h-full rounded-full bg-[var(--nexus-accent-primary)]" style={{ width: `${p.completion}%` }} />
                      </div>
                      <span className="text-xs text-[var(--nexus-text-tertiary)]">{p.completion}%</span>
                    </div>
                  )}
                  {p.status === 'inactive' && (
                    <p className="text-xs text-[var(--nexus-text-tertiary)]">Not yet set up</p>
                  )}
                </div>
              ))}
            </div>
          </DataCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2">
          <DataCard title="Quick Actions">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'View Invoices', href: '/command-center/deliver/billing', icon: CreditCard, allowed: canViewBilling },
                { label: 'Check Platforms', href: '/command-center/deliver/platforms', icon: Globe, allowed: true },
                { label: 'Manage Services', href: '/command-center/deliver', icon: Briefcase, allowed: canManageServices },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => action.allowed && navigate(action.href)}
                  disabled={!action.allowed}
                  className={`flex items-center gap-3 p-4 rounded-lg border border-[var(--nexus-card-border)] transition-colors group ${
                    action.allowed
                      ? 'bg-[var(--nexus-bg-secondary)] hover:bg-[var(--nexus-card-bg-hover)]'
                      : 'bg-[var(--nexus-bg-secondary)] opacity-50 cursor-not-allowed'
                  }`}
                >
                  <action.icon className="w-5 h-5 text-[var(--nexus-accent-primary)]" />
                  <span className="text-sm font-medium text-[var(--nexus-text-primary)]">{action.label}</span>
                  <ArrowRight className={`w-4 h-4 ml-auto transition-colors ${action.allowed ? 'text-[var(--nexus-text-tertiary)] group-hover:text-[var(--nexus-accent-primary)]' : 'text-[var(--nexus-text-tertiary)]'}`} />
                </button>
              ))}
            </div>
          </DataCard>
        </motion.div>
      </div>
    </div>
  );
}
