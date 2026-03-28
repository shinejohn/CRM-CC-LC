import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Mail, Send, CheckCircle2, MousePointerClick, AlertTriangle,
  XCircle, Activity, Shield,
} from 'lucide-react';
import { PageHeader, MetricCard, DataCard } from '@/components/shared';
import {
  getEmailHealthStats,
  getRecentEmailEvents,
  getEmailCampaignSummaries,
} from '@/services/email-engine-api';

const warmupSchedule = [
  { week: 'Week 1', limit: '200/day', progress: 100 },
  { week: 'Week 2', limit: '500/day', progress: 100 },
  { week: 'Week 3', limit: '1,000/day', progress: 100 },
  { week: 'Week 4', limit: '2,500/day', progress: 65 },
  { week: 'Week 5', limit: '5,000/day', progress: 0 },
  { week: 'Week 6+', limit: 'Full volume', progress: 0 },
];

const eventTypeConfig: Record<string, { label: string; color: string; icon: typeof Mail }> = {
  MessageSent: { label: 'Sent', color: 'text-blue-400', icon: Send },
  MessageDelivered: { label: 'Delivered', color: 'text-green-400', icon: CheckCircle2 },
  MessageLoaded: { label: 'Opened', color: 'text-emerald-400', icon: Mail },
  MessageLinkClicked: { label: 'Clicked', color: 'text-cyan-400', icon: MousePointerClick },
  MessageDeliveryFailed: { label: 'Failed', color: 'text-red-400', icon: XCircle },
  MessageBounced: { label: 'Bounced', color: 'text-orange-400', icon: AlertTriangle },
  MessageHeld: { label: 'Held', color: 'text-yellow-400', icon: Shield },
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: 'bg-green-500/10 text-green-400',
    running: 'bg-blue-500/10 text-blue-400',
    draft: 'bg-gray-500/10 text-gray-400',
    scheduled: 'bg-amber-500/10 text-amber-400',
    held: 'bg-red-500/10 text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? colors.draft}`}>
      {status}
    </span>
  );
}

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

export function EmailHealthPage() {
  const statsQuery = useQuery({
    queryKey: ['email-health', 'stats'],
    queryFn: getEmailHealthStats,
  });

  const eventsQuery = useQuery({
    queryKey: ['email-health', 'events'],
    queryFn: () => getRecentEmailEvents({ limit: 10 }),
  });

  const campaignsQuery = useQuery({
    queryKey: ['email-health', 'campaigns'],
    queryFn: () => getEmailCampaignSummaries({ limit: 10 }),
  });

  const stats = statsQuery.data;
  const events = eventsQuery.data ?? [];
  const campaigns = campaignsQuery.data ?? [];
  const isLoading = statsQuery.isLoading;
  const error = statsQuery.error || eventsQuery.error || campaignsQuery.error;

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Email Health"
          subtitle="Deliverability control room — monitor delivery rates, bounces, and IP reputation"
        />
        <div className="p-8 text-center text-red-400 bg-red-500/5 rounded-lg border border-red-500/20">
          <XCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Failed to load email health data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Health"
        subtitle="Deliverability control room — monitor delivery rates, bounces, and IP reputation"
      />

      {/* Top Metrics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard label="Delivery Rate" value={`${stats.delivery_rate}%`} icon={CheckCircle2} color="green" />
          <MetricCard label="Open Rate" value={`${stats.open_rate}%`} icon={Mail} color="blue" />
          <MetricCard label="Click Rate" value={`${stats.click_rate}%`} icon={MousePointerClick} color="blue" />
          <MetricCard label="Bounce Rate" value={`${stats.bounce_rate}%`} icon={AlertTriangle} color="amber" />
          <MetricCard label="Total Sent" value={stats.total_sent.toLocaleString()} icon={Send} color="purple" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* IP Warmup Tracker */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <DataCard title="IP Warmup Progress" icon={Activity} subtitle="Gradual ramp-up schedule for sender reputation">
            <div className="space-y-3">
              {warmupSchedule.map((step) => (
                <div key={step.week} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--nexus-text-secondary)] w-16 shrink-0">{step.week}</span>
                  <div className="flex-1 h-2 rounded-full bg-[var(--nexus-bg-tertiary)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${step.progress === 100 ? 'bg-green-500' : step.progress > 0 ? 'bg-blue-500' : 'bg-[var(--nexus-bg-tertiary)]'}`}
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--nexus-text-tertiary)] w-20 text-right">{step.limit}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--nexus-text-tertiary)]">
              Rule: Never exceed 2x previous day. Pause immediately on any complaint.
            </p>
          </DataCard>
        </motion.div>

        {/* Recent Events Log */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <DataCard title="Recent Email Events" icon={Activity}>
            {events.length === 0 ? (
              <p className="text-sm text-[var(--nexus-text-tertiary)] py-4 text-center">No recent events</p>
            ) : (
              <div className="space-y-2">
                {events.map((event) => {
                  const config = eventTypeConfig[event.event_type] ?? eventTypeConfig.MessageSent;
                  const Icon = config.icon;
                  return (
                    <div key={event.id} className="flex items-center gap-3 py-2 border-b border-[var(--nexus-divider)] last:border-0">
                      <Icon className={`w-4 h-4 shrink-0 ${config.color}`} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                        <span className="text-xs text-[var(--nexus-text-tertiary)] ml-2">{event.external_id}</span>
                      </div>
                      <span className="text-xs text-[var(--nexus-text-tertiary)] shrink-0">
                        {new Date(event.received_at).toLocaleTimeString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </DataCard>
        </motion.div>

        {/* Campaign Performance Table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-2">
          <DataCard title="Email Campaigns" icon={Send}>
            {campaigns.length === 0 ? (
              <p className="text-sm text-[var(--nexus-text-tertiary)] py-4 text-center">No email campaigns yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--nexus-divider)]">
                      <th className="text-left py-2 text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider">Campaign</th>
                      <th className="text-center py-2 text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider">Status</th>
                      <th className="text-right py-2 text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider">Sent</th>
                      <th className="text-right py-2 text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider">Delivered</th>
                      <th className="text-right py-2 text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider">Opened</th>
                      <th className="text-right py-2 text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider">Clicked</th>
                      <th className="text-right py-2 text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider">Failed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.id} className="border-b border-[var(--nexus-divider)] last:border-0">
                        <td className="py-3 text-[var(--nexus-text-primary)] font-medium">{c.name}</td>
                        <td className="py-3 text-center"><StatusBadge status={c.status} /></td>
                        <td className="py-3 text-right text-[var(--nexus-text-secondary)]">{c.sent_count.toLocaleString()}</td>
                        <td className="py-3 text-right text-[var(--nexus-text-secondary)]">{c.delivered_count.toLocaleString()}</td>
                        <td className="py-3 text-right text-[var(--nexus-text-secondary)]">{c.opened_count.toLocaleString()}</td>
                        <td className="py-3 text-right text-[var(--nexus-text-secondary)]">{c.clicked_count.toLocaleString()}</td>
                        <td className="py-3 text-right text-[var(--nexus-text-secondary)]">{c.failed_count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DataCard>
        </motion.div>
      </div>
    </div>
  );
}
