// ============================================
// Ops Alerts Page - Active alerts and alert rules
// ============================================

import React, { useState } from 'react';
import { useOpsAlerts, useOpsAcknowledgeAlert, useOpsResolveAlert } from '@/hooks/ops/useOpsAlerts';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { Alert } from '@/types/operations';

const severityStyles: Record<string, string> = {
  emergency: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
};

const statusStyles: Record<string, string> = {
  active: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
  acknowledged: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
  investigating: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  resolved: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300',
  snoozed: 'bg-gray-50 text-gray-700 dark:bg-slate-700 dark:text-slate-300',
};

export function OpsAlertsPage() {
  const [statusFilter, setStatusFilter] = useState<Alert['status'] | 'all'>('active');
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const { data, isLoading } = useOpsAlerts(
    statusFilter === 'all' ? undefined : { status: statusFilter }
  );
  const acknowledgeMutation = useOpsAcknowledgeAlert();
  const resolveMutation = useOpsResolveAlert();

  const alerts = data?.data ?? [];

  const handleResolve = (id: string) => {
    if (!resolveNotes.trim()) return;
    resolveMutation.mutate({ id, notes: resolveNotes });
    setResolvingId(null);
    setResolveNotes('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Alerts
      </h1>

      <div className="flex gap-2">
        {(['active', 'acknowledged', 'resolved', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              statusFilter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <p className="text-gray-500">No alerts match the filter.</p>
      ) : (
        <div className="space-y-4">
          {alerts.map((a) => (
            <div
              key={a.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <AlertTriangle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      a.severity === 'critical' || a.severity === 'emergency'
                        ? 'text-red-500'
                        : 'text-amber-500'
                    }`}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {a.title}
                    </p>
                    {a.description && (
                      <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                        {a.description}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${severityStyles[a.severity] ?? severityStyles.info}`}
                      >
                        {a.severity}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${statusStyles[a.status] ?? ''}`}
                      >
                        {a.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(a.triggeredAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {a.status === 'active' && (
                    <button
                      onClick={() => acknowledgeMutation.mutate(a.id)}
                      disabled={acknowledgeMutation.isPending}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-800/50"
                    >
                      <Clock className="w-4 h-4" />
                      Acknowledge
                    </button>
                  )}
                  {(a.status === 'active' || a.status === 'acknowledged') && (
                    <>
                      {resolvingId === a.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={resolveNotes}
                            onChange={(e) => setResolveNotes(e.target.value)}
                            placeholder="Resolution notes"
                            className="rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-sm w-40"
                          />
                          <button
                            onClick={() => handleResolve(a.id)}
                            disabled={!resolveNotes.trim()}
                            className="px-2 py-1 rounded bg-green-600 text-white text-sm disabled:opacity-50"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => {
                              setResolvingId(null);
                              setResolveNotes('');
                            }}
                            className="px-2 py-1 rounded bg-gray-200 dark:bg-slate-600 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setResolvingId(a.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm font-medium hover:bg-green-200 dark:hover:bg-green-800/50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Resolve
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
