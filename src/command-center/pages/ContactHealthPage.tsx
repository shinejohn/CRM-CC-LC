import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, ShieldCheck, ShieldAlert, ShieldX, RefreshCw,
  CreditCard, Clock, AlertTriangle, CheckCircle2, HelpCircle, XCircle,
} from 'lucide-react';
import { PageHeader, MetricCard, DataCard } from '@/components/shared';
import {
  getContactHealthStats,
  triggerListRevalidation,
} from '@/services/email-engine-api';

const statusBreakdownConfig = [
  { key: 'valid_count' as const, status: 'Valid', color: 'bg-green-500', icon: CheckCircle2 },
  { key: 'invalid_count' as const, status: 'Invalid', color: 'bg-red-500', icon: ShieldX },
  { key: 'catch_all_count' as const, status: 'Catch-All', color: 'bg-amber-500', icon: HelpCircle },
  { key: 'unknown_count' as const, status: 'Unknown', color: 'bg-gray-500', icon: HelpCircle },
  { key: 'suppressed_count' as const, status: 'Suppressed', color: 'bg-orange-500', icon: ShieldAlert },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-[var(--nexus-bg-tertiary)] rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-[var(--nexus-bg-tertiary)] rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-64 bg-[var(--nexus-bg-tertiary)] rounded-lg" />
        <div className="h-64 bg-[var(--nexus-bg-tertiary)] rounded-lg" />
      </div>
    </div>
  );
}

export function ContactHealthPage() {
  const queryClient = useQueryClient();
  const [revalidateMsg, setRevalidateMsg] = useState<string | null>(null);

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['contact-health', 'stats'],
    queryFn: getContactHealthStats,
  });

  const revalidateMutation = useMutation({
    mutationFn: triggerListRevalidation,
    onSuccess: (result) => {
      setRevalidateMsg(result.message ?? 'Re-validation started');
      queryClient.invalidateQueries({ queryKey: ['contact-health'] });
    },
    onError: () => {
      setRevalidateMsg('Failed to start re-validation. Try again.');
    },
  });

  if (isLoading) return <LoadingSkeleton />;

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Contact Health"
          subtitle="Email list hygiene powered by ZeroBounce — monitor validation status and suppression rates"
        />
        <div className="p-8 text-center text-red-400 bg-red-500/5 rounded-lg border border-red-500/20">
          <XCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Failed to load contact health data. Please try again later.</p>
        </div>
      </div>
    );
  }

  const totalBar = stats.validated_count || 1;

  const statusBreakdown = statusBreakdownConfig.map((cfg) => ({
    ...cfg,
    count: stats[cfg.key],
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact Health"
        subtitle="Email list hygiene powered by ZeroBounce — monitor validation status and suppression rates"
      />

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Total Contacts" value={stats.total_contacts.toLocaleString()} icon={Users} color="blue" />
        <MetricCard label="Validated" value={stats.validated_count.toLocaleString()} icon={ShieldCheck} color="green" />
        <MetricCard label="Suppressed" value={stats.suppressed_count.toLocaleString()} icon={ShieldAlert} color="amber" />
        <MetricCard label="Suppression Rate" value={`${stats.suppression_rate}%`} icon={AlertTriangle} color="red" />
        <MetricCard label="ZB Credits" value={stats.zerobounce_credits.toLocaleString()} icon={CreditCard} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Validation Breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <DataCard title="Validation Status Breakdown" icon={ShieldCheck}>
            <div className="space-y-4">
              {/* Stacked bar */}
              <div className="flex h-4 rounded-full overflow-hidden bg-[var(--nexus-bg-tertiary)]">
                {statusBreakdown.map((item) => (
                  <div
                    key={item.status}
                    className={`${item.color} transition-all`}
                    style={{ width: `${(item.count / totalBar) * 100}%` }}
                    title={`${item.status}: ${item.count}`}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="space-y-2">
                {statusBreakdown.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.status} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <Icon className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
                        <span className="text-sm text-[var(--nexus-text-secondary)]">{item.status}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[var(--nexus-text-primary)]">{item.count.toLocaleString()}</span>
                        <span className="text-xs text-[var(--nexus-text-tertiary)] w-12 text-right">
                          {((item.count / totalBar) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </DataCard>
        </motion.div>

        {/* Actions Panel */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <DataCard title="List Hygiene Actions" icon={RefreshCw}>
            <div className="space-y-4">
              {/* Last Scrub */}
              <div className="p-4 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)]">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
                  <span className="text-xs font-medium text-[var(--nexus-text-tertiary)] uppercase tracking-wider">Last Full Scrub</span>
                </div>
                <p className="text-lg font-semibold text-[var(--nexus-text-primary)]">
                  {stats.last_scrub_at
                    ? new Date(stats.last_scrub_at).toLocaleDateString()
                    : 'Never'}
                </p>
                <p className="text-xs text-[var(--nexus-text-tertiary)] mt-1">
                  Weekly scrub runs Sundays at 2:00 AM
                </p>
              </div>

              {/* Credits */}
              <div className="p-4 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)]">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
                  <span className="text-xs font-medium text-[var(--nexus-text-tertiary)] uppercase tracking-wider">ZeroBounce Credits</span>
                </div>
                <p className="text-lg font-semibold text-[var(--nexus-text-primary)]">
                  {stats.zerobounce_credits.toLocaleString()}
                </p>
                <p className="text-xs text-[var(--nexus-text-tertiary)] mt-1">
                  Credits consumed only on validation, not every send
                </p>
              </div>

              {/* Re-Validate Button */}
              <div className="p-4 rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)]">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
                  <span className="text-xs font-medium text-[var(--nexus-text-tertiary)] uppercase tracking-wider">Manual Re-Validate</span>
                </div>
                <button
                  type="button"
                  onClick={() => revalidateMutation.mutate()}
                  disabled={revalidateMutation.isPending}
                  className={`mt-2 w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    revalidateMutation.isPending
                      ? 'bg-[var(--nexus-bg-tertiary)] text-[var(--nexus-text-tertiary)] cursor-not-allowed'
                      : 'bg-[var(--nexus-accent-primary)] text-white hover:opacity-90'
                  }`}
                >
                  {revalidateMutation.isPending ? 'Validating...' : 'Re-Validate List'}
                </button>
                {revalidateMsg && (
                  <p className="text-xs text-[var(--nexus-text-tertiary)] mt-2">{revalidateMsg}</p>
                )}
              </div>
            </div>
          </DataCard>
        </motion.div>
      </div>
    </div>
  );
}
