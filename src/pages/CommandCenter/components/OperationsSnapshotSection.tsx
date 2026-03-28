import React from 'react';
import { BarChart3, AlertCircle } from 'lucide-react';
import type { OperationsDashboardSnapshot } from '@/types/operations';

interface Props {
  snapshot: OperationsDashboardSnapshot | null;
  error: string | null;
}

export const OperationsSnapshotSection: React.FC<Props> = ({ snapshot, error }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Operations Snapshot</h2>
          {snapshot && (
            <p className="text-sm text-gray-500">
              As of {snapshot.asOf.toLocaleString()}
            </p>
          )}
        </div>
        <BarChart3 className="h-5 w-5 text-indigo-600" />
      </div>
      <div className="p-6">
        {error && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800">{error}</p>
            </div>
          </div>
        )}
        {snapshot ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">Overall Status</p>
              <p className="text-xl font-semibold text-gray-900 capitalize">
                {snapshot.infrastructure.overallStatus}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {snapshot.infrastructure.componentsHealthy} healthy ·{' '}
                {snapshot.infrastructure.componentsDegraded} degraded
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">Active Alerts</p>
              <p className="text-xl font-semibold text-gray-900">
                {snapshot.alerts.activeTotal}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {snapshot.alerts.activeCritical} critical ·{' '}
                {snapshot.alerts.activeWarning} warning
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">Queue Depth</p>
              <p className="text-xl font-semibold text-gray-900">
                {snapshot.system.queueDepthTotal.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Oldest item {snapshot.system.oldestQueueItemAge}s
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">MRR</p>
              <p className="text-xl font-semibold text-gray-900">
                ${snapshot.financial.mrr.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {snapshot.financial.mrrChangePercent30d}% 30d change
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">Costs (MTD)</p>
              <p className="text-xl font-semibold text-gray-900">
                ${snapshot.costs.mtdTotal.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Budget ${snapshot.costs.mtdBudget.toLocaleString()}
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-sm text-gray-500">Deliverability</p>
              <p className="text-xl font-semibold text-gray-900">
                {snapshot.email.overallDeliverability.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {snapshot.email.ipsBlacklisted} IPs blacklisted
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No operations snapshot available yet.</p>
        )}
      </div>
    </div>
  );
};
