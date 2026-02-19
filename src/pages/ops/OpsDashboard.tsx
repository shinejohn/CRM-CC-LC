// ============================================
// Ops Dashboard - Main operations dashboard
// Health score, financial summary, infrastructure, alerts
// Auto-refresh every 30 seconds
// ============================================

import React from 'react';
import { Link, useNavigate } from 'react-router';
import { RefreshCw, DollarSign, Users, Mail, BarChart3, AlertTriangle } from 'lucide-react';
import { useOpsDashboard } from '@/hooks/ops/useOpsDashboard';
import { OpsMetricCard } from '@/components/ops/OpsMetricCard';
import { OpsHealthGrid } from '@/components/ops/OpsHealthGrid';
import { OpsAlertBanner } from '@/components/ops/OpsAlertBanner';
import { useOpsAlerts } from '@/hooks/ops/useOpsAlerts';

export function OpsDashboard() {
  const navigate = useNavigate();
  const { data: snapshot, isLoading, error, refetch } = useOpsDashboard(30_000);
  const { data: alertsData } = useOpsAlerts({ status: 'active' });
  const alerts = alertsData?.data ?? [];

  if (isLoading && !snapshot) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-6">
        <p className="text-red-800 dark:text-red-200">
          Failed to load dashboard: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  const healthScore =
    snapshot?.infrastructure?.overallStatus === 'healthy'
      ? 95
      : snapshot?.infrastructure?.overallStatus === 'degraded'
        ? 70
        : 40;

  const components =
    snapshot?.infrastructure != null
      ? [
          {
            id: 'overall',
            name: 'Overall',
            status: snapshot.infrastructure.overallStatus,
            componentType: 'system',
          },
        ]
      : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Operations Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Platform health and metrics · Auto-refresh every 30s
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <OpsAlertBanner
        alerts={alerts}
        onViewAll={() => navigate('/ops/alerts')}
      />

      {/* Health Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
            Health Score
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-4xl font-bold ${
                healthScore >= 90
                  ? 'text-green-600'
                  : healthScore >= 70
                    ? 'text-amber-600'
                    : 'text-red-600'
              }`}
            >
              {healthScore}
            </span>
            <span className="text-gray-500">/ 100</span>
          </div>
        </div>

        <OpsMetricCard
          title="MRR"
          value={`$${snapshot?.financial?.mrr?.toLocaleString() ?? '0'}`}
          subtitle={`ARR: $${snapshot?.financial?.arr?.toLocaleString() ?? '0'}`}
          trend={
            (snapshot?.financial?.mrrChangePercent30d ?? 0) >= 0 ? 'up' : 'down'
          }
          trendValue={`${snapshot?.financial?.mrrChangePercent30d ?? 0}% 30d`}
          icon={<DollarSign className="w-5 h-5" />}
        />

        <OpsMetricCard
          title="Customers"
          value={snapshot?.financial?.totalCustomers ?? 0}
          subtitle={`Churn: ${(snapshot?.financial?.churnRate30d ?? 0).toFixed(1)}%`}
          icon={<Users className="w-5 h-5" />}
        />

        <OpsMetricCard
          title="Deliverability"
          value={`${(snapshot?.email?.overallDeliverability ?? 0).toFixed(1)}%`}
          subtitle={`${snapshot?.email?.ipsBlacklisted ?? 0} IPs blacklisted`}
          status={
            (snapshot?.email?.overallDeliverability ?? 0) >= 95
              ? 'healthy'
              : (snapshot?.email?.overallDeliverability ?? 0) >= 80
                ? 'warning'
                : 'critical'
          }
          icon={<Mail className="w-5 h-5" />}
        />
      </div>

      {/* Infrastructure & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Infrastructure Status
          </h2>
          <OpsHealthGrid components={components} columns={2} />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <OpsMetricCard
              title="Queue Depth"
              value={(snapshot?.system?.queueDepthTotal ?? 0).toLocaleString()}
              subtitle={`Oldest: ${snapshot?.system?.oldestQueueItemAge ?? 0}s`}
            />
            <OpsMetricCard
              title="Jobs (24h)"
              value={(snapshot?.system?.jobsProcessed24h ?? 0).toLocaleString()}
              subtitle={`Failed: ${snapshot?.system?.jobsFailed24h ?? 0}`}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pipeline Summary
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <OpsMetricCard
              title="Leads"
              value={(snapshot?.pipeline?.leadsTotal ?? 0).toLocaleString()}
            />
            <OpsMetricCard
              title="In Trial"
              value={snapshot?.pipeline?.prospectsInTrial ?? 0}
            />
            <OpsMetricCard
              title="Opportunities"
              value={`$${(snapshot?.pipeline?.opportunitiesValue ?? 0).toLocaleString()}`}
            />
            <OpsMetricCard
              title="Projected MRR (30d)"
              value={`$${(snapshot?.pipeline?.projectedMrr30d ?? 0).toLocaleString()}`}
            />
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Alerts
          </h2>
          <Link
            to="/ops/alerts"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all →
          </Link>
        </div>
        {alerts.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400">No active alerts</p>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 5).map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700"
              >
                <AlertTriangle
                  className={`w-5 h-5 ${
                    a.severity === 'critical' || a.severity === 'emergency'
                      ? 'text-red-500'
                      : 'text-amber-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {a.title}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{a.severity}</p>
                </div>
                <Link
                  to="/ops/alerts"
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  View
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
