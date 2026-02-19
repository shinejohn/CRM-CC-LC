// ============================================
// Ops Action Log - Action execution history
// ============================================

import React from 'react';
import { useOpsActionExecutions } from '@/hooks/ops/useOpsFOA';
import { CheckCircle, XCircle, Clock, Loader } from 'lucide-react';

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  running: { icon: Loader, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  rolled_back: { icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-slate-800' },
};

export function OpsActionLog() {
  const { data, isLoading } = useOpsActionExecutions({ perPage: 50 });
  const executions = data?.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Action Log
      </h1>
      <p className="text-gray-500 dark:text-slate-400">
        History of FOA-recommended actions and their execution status.
      </p>

      {isLoading ? (
        <p className="text-gray-500">Loading actions...</p>
      ) : executions.length === 0 ? (
        <p className="text-gray-500">No action executions yet.</p>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                  <th className="text-left py-3 px-4 font-medium">Initiated By</th>
                  <th className="text-left py-3 px-4 font-medium">Started</th>
                  <th className="text-left py-3 px-4 font-medium">Completed</th>
                </tr>
              </thead>
              <tbody>
                {executions.map((ex) => {
                  const config =
                    statusConfig[ex.status as keyof typeof statusConfig] ??
                    statusConfig.pending;
                  const Icon = config.icon;
                  return (
                    <tr
                      key={ex.id}
                      className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30"
                    >
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.color}`}
                        >
                          <Icon
                            className={`w-3.5 h-3.5 ${
                              ex.status === 'running' ? 'animate-spin' : ''
                            }`}
                          />
                          {ex.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {ex.actionId}
                      </td>
                      <td className="py-3 px-4">{ex.initiatedBy}</td>
                      <td className="py-3 px-4 text-gray-500">
                        {ex.startedAt
                          ? new Date(ex.startedAt).toLocaleString()
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {ex.completedAt
                          ? new Date(ex.completedAt).toLocaleString()
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
