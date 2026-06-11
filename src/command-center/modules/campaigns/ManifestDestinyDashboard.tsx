import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  Users,
  Activity,
  CheckCircle2,
  PauseCircle,
  UserX,
  TrendingUp,
  Calendar,
  ArrowRight,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { apiClient } from '@/services/api';

/* ── Types ───────────────────────────────────────────────────────────── */

interface StageRow {
  stage: string;
  label: string;
  color: string;
  count: number;
}

interface TimelineRow {
  timeline_id: string;
  name: string;
  slug: string;
  pipeline_stage: string;
  active: number;
  completed: number;
  paused: number;
  total: number;
}

interface DayBucket {
  day: number;
  count: number;
}

interface DashboardData {
  pipeline: StageRow[];
  enrollment: {
    active: number;
    completed: number;
    paused: number;
    unenrolled: number;
  };
  timelines: TimelineRow[];
  recent_activity_7d: number;
  day_distribution: DayBucket[];
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

const STAGE_BG: Record<string, string> = {
  hook:        'bg-blue-100 text-blue-700',
  engagement:  'bg-yellow-100 text-yellow-700',
  sales:       'bg-orange-100 text-orange-700',
  retention:   'bg-green-100 text-green-700',
  churned:     'bg-gray-100 text-gray-500',
};

const STAGE_BAR: Record<string, string> = {
  hook:        'bg-blue-500',
  engagement:  'bg-yellow-500',
  sales:       'bg-orange-500',
  retention:   'bg-green-500',
  churned:     'bg-gray-400',
};

/* ── Metric card ─────────────────────────────────────────────────────── */

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${accent ?? 'bg-indigo-50'}`}>
          <Icon size={20} className={accent ? 'text-white' : 'text-indigo-600'} />
        </div>
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────── */

export function ManifestDestinyDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await apiClient.get<{ data: DashboardData }>('/v1/campaigns/manifest-destiny/stats');
        if (!cancelled) setData(res.data.data);
      } catch {
        if (!cancelled) setError('Could not load campaign data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const totalStageCount = data?.pipeline.reduce((s, r) => s + r.count, 0) ?? 0;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manifest Destiny Campaign</h1>
          <p className="text-sm text-gray-500 mt-1">
            90-day automated outreach across all community organizations
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/command-center/simulation"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Activity size={16} />
            Run Simulation
          </Link>
          <Link
            to="/command-center/sell/customers"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            View Contacts
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* ── Enrollment metrics ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              icon={Activity}
              label="Active in Campaign"
              value={data.enrollment.active}
              sub="currently receiving outreach"
              accent="bg-indigo-600"
            />
            <MetricCard
              icon={CheckCircle2}
              label="Completed 90 Days"
              value={data.enrollment.completed}
              sub="full journey finished"
            />
            <MetricCard
              icon={PauseCircle}
              label="Paused"
              value={data.enrollment.paused}
              sub="manually paused"
            />
            <MetricCard
              icon={UserX}
              label="Not Yet Enrolled"
              value={data.enrollment.unenrolled}
              sub="eligible contacts waiting"
            />
          </div>

          {/* ── Secondary row ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard
              icon={TrendingUp}
              label="Actions (Last 7 Days)"
              value={data.recent_activity_7d}
              sub="emails, calls, and stage changes"
            />
            <MetricCard
              icon={Users}
              label="Total in Pipeline"
              value={totalStageCount}
              sub="all stages combined"
            />
          </div>

          {/* ── Pipeline stage breakdown ── */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <BarChart3 size={20} className="text-indigo-500" />
              Pipeline Stage Distribution
            </h2>
            <div className="space-y-4">
              {data.pipeline.map((row) => {
                const pct = totalStageCount > 0 ? (row.count / totalStageCount) * 100 : 0;
                return (
                  <div key={row.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STAGE_BG[row.stage] ?? 'bg-gray-100 text-gray-600'}`}>
                          {row.label}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {row.count.toLocaleString()}
                        <span className="text-gray-400 font-normal ml-1">({pct.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${STAGE_BAR[row.stage] ?? 'bg-gray-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Timeline enrollment table ── */}
          {data.timelines.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-500" />
                <h2 className="text-lg font-semibold text-gray-900">Timeline Enrollment</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-gray-500">Timeline</th>
                      <th className="px-4 py-3 font-semibold text-gray-500">Stage</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 text-right">Active</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 text-right">Completed</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 text-right">Paused</th>
                      <th className="px-4 py-3 font-semibold text-gray-500 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.timelines.map((t) => (
                      <tr key={t.timeline_id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-medium text-gray-900">{t.name}</td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STAGE_BG[t.pipeline_stage] ?? 'bg-gray-100 text-gray-600'}`}>
                            {t.pipeline_stage}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right text-gray-700">{(t.active ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-4 text-right text-gray-700">{(t.completed ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-4 text-right text-gray-700">{(t.paused ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-4 text-right font-semibold text-gray-900">{(t.total ?? 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Day distribution sparkline ── */}
          {data.day_distribution.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Contacts by Campaign Day</h2>
              <DayDistributionChart buckets={data.day_distribution} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Minimal bar chart for day distribution ──────────────────────────── */

function DayDistributionChart({ buckets }: { buckets: DayBucket[] }) {
  const max = Math.max(...buckets.map((b) => b.count), 1);
  // Show up to 90 columns
  const visible = buckets.slice(0, 90);

  return (
    <div className="flex items-end gap-px h-20 overflow-hidden">
      {visible.map((b) => (
        <div
          key={b.day}
          className="flex-1 bg-indigo-400 rounded-sm min-w-0 transition-all duration-300"
          style={{ height: `${(b.count / max) * 100}%`, minHeight: b.count > 0 ? '4px' : '0' }}
          title={`Day ${b.day}: ${b.count} contacts`}
        />
      ))}
    </div>
  );
}
