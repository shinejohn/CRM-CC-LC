import { useQuery } from '@tanstack/react-query';
import { BarChart2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { ticketService } from '@/services/ticketService';

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] rounded-xl p-4">
      <div className="text-xs text-[var(--nexus-text-tertiary)] mb-1">{label}</div>
      <div className="text-2xl font-bold text-[var(--nexus-text-primary)]">{value}</div>
      {sub && <div className="text-xs text-[var(--nexus-text-tertiary)] mt-0.5">{sub}</div>}
    </div>
  );
}

export function TicketReportingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['ticket-reporting'],
    queryFn: () => ticketService.getReportingSummary(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-[var(--nexus-accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const totalOpen  = Object.values(data.by_status)
    .filter((s) => !['resolved', 'closed', 'cancelled'].includes(s.status))
    .reduce((sum, s) => sum + s.count, 0);

  const totalResolved = (data.by_status['resolved']?.count ?? 0) + (data.by_status['closed']?.count ?? 0);
  const escalated     = data.by_status['escalated']?.count ?? 0;

  return (
    <div className="h-full overflow-y-auto bg-[var(--nexus-bg-primary)]">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--nexus-divider)]">
        <BarChart2 className="w-5 h-5 text-[var(--nexus-accent-primary)]" />
        <h1 className="text-xl font-semibold text-[var(--nexus-text-primary)]">Ticket Reports</h1>
        <span className="text-xs text-[var(--nexus-text-tertiary)]">Last 30 days</span>
      </div>

      <div className="p-6 space-y-6">
        {/* Top stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Open Tickets" value={totalOpen} />
          <StatCard label="Resolved" value={totalResolved} sub="last 30 days" />
          <StatCard label="Escalated" value={escalated} />
          <StatCard
            label="SLA Compliance"
            value={data.sla_compliance_rate !== null ? `${data.sla_compliance_rate}%` : '—'}
            sub={`${data.sla_met}/${data.sla_total} resolved on time`}
          />
        </div>

        {/* By type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-[var(--nexus-text-primary)] mb-3">By Type</h2>
            <div className="space-y-2">
              {Object.values(data.by_type).map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--nexus-text-secondary)] capitalize">{item.type}</span>
                  <span className="text-sm font-medium text-[var(--nexus-text-primary)]">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-[var(--nexus-text-primary)] mb-3">Avg Resolution Time</h2>
            <div className="space-y-2">
              {Object.values(data.avg_resolution_hours).map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--nexus-text-secondary)] capitalize">{item.type}</span>
                  <span className="text-sm font-medium text-[var(--nexus-text-primary)]">
                    {item.avg_hours ? `${Math.round(item.avg_hours)}h` : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Implementation stages */}
        {data.implementation_by_stage.length > 0 && (
          <div className="bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-[var(--nexus-text-primary)] mb-3">
              Open Implementation Tickets by Stage
            </h2>
            <div className="space-y-2">
              {data.implementation_by_stage.map((item) => (
                <div key={item.stage_name} className="flex items-center gap-2">
                  <div className="flex-1 text-sm text-[var(--nexus-text-secondary)]">{item.stage_name}</div>
                  <div
                    className="h-3 rounded-full bg-[var(--nexus-accent-primary)]/60"
                    style={{ width: `${Math.max(10, (item.count / (data.implementation_by_stage[0]?.count || 1)) * 160)}px` }}
                  />
                  <span className="text-sm font-medium text-[var(--nexus-text-primary)] w-6 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top clients */}
        {data.top_clients_by_volume.length > 0 && (
          <div className="bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-[var(--nexus-text-primary)] mb-1">
              High-Volume Clients <span className="text-[var(--nexus-text-tertiary)] font-normal">(at-risk indicator)</span>
            </h2>
            <p className="text-xs text-[var(--nexus-text-tertiary)] mb-3">Support tickets in last 30 days</p>
            <div className="space-y-2">
              {data.top_clients_by_volume.map((item) => (
                <div key={item.client_id} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--nexus-text-secondary)]">
                    {item.client?.business_name ?? item.client_id}
                  </span>
                  <span className={`text-sm font-medium ${item.ticket_count >= 5 ? 'text-red-500' : 'text-[var(--nexus-text-primary)]'}`}>
                    {item.ticket_count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signals by platform */}
        {Object.keys(data.signals_by_platform).length > 0 && (
          <div className="bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-divider)] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-[var(--nexus-text-primary)] mb-3">
              Monitoring Signals by Platform
            </h2>
            <div className="space-y-2">
              {Object.values(data.signals_by_platform).map((item) => (
                <div key={item.source_platform} className="flex items-center justify-between">
                  <span className="text-sm text-[var(--nexus-text-secondary)] capitalize">{item.source_platform}</span>
                  <span className="text-sm font-medium text-[var(--nexus-text-primary)]">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
