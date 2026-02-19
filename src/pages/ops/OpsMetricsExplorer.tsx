// ============================================
// Ops Metrics Explorer - Drill into metrics with charts
// ============================================

import React, { useState } from 'react';
import { useOpsMetricDefinitions, useOpsMetricSnapshots } from '@/hooks/ops/useOpsMetrics';
import { OpsMetricCard } from '@/components/ops/OpsMetricCard';

export function OpsMetricsExplorer() {
  const [selectedMetricId, setSelectedMetricId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const { data: definitionsData, isLoading: loadingDefs } =
    useOpsMetricDefinitions();
  const definitions = definitionsData?.data ?? [];

  const { data: snapshotsData, isLoading: loadingSnapshots } =
    useOpsMetricSnapshots({
      metricId: selectedMetricId ?? undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      granularity: 'daily',
    });
  const snapshots = snapshotsData?.data ?? [];

  const sparklineData = snapshots
    .slice(-30)
    .map((s) => (typeof s.value === 'number' ? s.value : 0));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Metrics Explorer
      </h1>
      <p className="text-gray-500 dark:text-slate-400">
        Select a metric to view time-series data. Compare metrics side by side.
      </p>

      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Metric
          </label>
          <select
            value={selectedMetricId ?? ''}
            onChange={(e) => setSelectedMetricId(e.target.value || null)}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2"
          >
            <option value="">Select metric...</option>
            {definitions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingDefs && (
        <p className="text-gray-500">Loading metric definitions...</p>
      )}

      {selectedMetricId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <OpsMetricCard
            title={
              definitions.find((d) => d.id === selectedMetricId)?.name ??
              'Selected Metric'
            }
            value={
              sparklineData.length > 0
                ? sparklineData[sparklineData.length - 1].toLocaleString()
                : '—'
            }
            sparklineData={sparklineData}
            subtitle={`${snapshots.length} data points`}
          />
        </div>
      )}

      {selectedMetricId && snapshots.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Time Series
          </h2>
          <div className="h-64 flex items-end gap-1">
            {sparklineData.map((v, i) => {
              const max = Math.max(...sparklineData, 1);
              const h = (v / max) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 bg-indigo-500 rounded-t min-w-[4px] hover:bg-indigo-600"
                  style={{ height: `${h}%` }}
                  title={`${v}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {!selectedMetricId && !loadingDefs && (
        <p className="text-gray-500">Select a metric to view the chart.</p>
      )}
    </div>
  );
}
