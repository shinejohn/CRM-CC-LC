// ============================================
// OpsIncidentTimeline - Incident lifecycle timeline
// ============================================

import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { Incident } from '@/types/operations';

interface OpsIncidentTimelineProps {
  incident: Incident;
}

const statusOrder = ['investigating', 'identified', 'monitoring', 'resolved', 'postmortem'];
const statusLabels: Record<string, string> = {
  investigating: 'Investigating',
  identified: 'Root cause identified',
  monitoring: 'Monitoring',
  resolved: 'Resolved',
  postmortem: 'Post-mortem',
};

export function OpsIncidentTimeline({ incident }: OpsIncidentTimelineProps) {
  const currentIdx = statusOrder.indexOf(incident.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {statusOrder.map((status, i) => {
          const isPast = i <= currentIdx;
          const isCurrent = i === currentIdx;
          const Icon =
            status === 'resolved' || status === 'postmortem'
              ? CheckCircle
              : isCurrent
                ? AlertCircle
                : Clock;

          return (
            <div key={status} className="flex items-center flex-shrink-0">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : isPast
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                      : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isCurrent ? 'text-indigo-600' : isPast ? 'text-green-600' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isCurrent ? 'text-indigo-900 dark:text-indigo-200' : isPast ? 'text-green-800 dark:text-green-200' : 'text-gray-500'
                  }`}
                >
                  {statusLabels[status]}
                </span>
              </div>
              {i < statusOrder.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 ${
                    isPast ? 'bg-green-300 dark:bg-green-700' : 'bg-gray-200 dark:bg-slate-700'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-sm text-gray-500 dark:text-slate-400">
        {incident.startedAt && (
          <span>Started: {new Date(incident.startedAt).toLocaleString()}</span>
        )}
        {incident.resolvedAt && (
          <span className="ml-4">
            Resolved: {new Date(incident.resolvedAt).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
