// ============================================
// OpsHealthGrid - Grid of component health indicators
// ============================================

import React from 'react';
import type { InfrastructureComponent } from '@/types/operations';

interface OpsHealthGridProps {
  components: Array<{
    id: string;
    name: string;
    status: InfrastructureComponent['currentStatus'];
    componentType?: string;
  }>;
  columns?: number;
}

const statusConfig = {
  healthy: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', dot: 'bg-green-500' },
  degraded: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300', dot: 'bg-amber-500' },
  unhealthy: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', dot: 'bg-red-500' },
  unknown: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-slate-400', dot: 'bg-gray-400' },
};

export function OpsHealthGrid({ components, columns = 4 }: OpsHealthGridProps) {
  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {components.map((c) => {
        const config = statusConfig[c.status] ?? statusConfig.unknown;
        return (
          <div
            key={c.id}
            className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 ${config.bg}`}
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate ${config.text}`}>{c.name}</p>
              {c.componentType && (
                <p className="text-xs text-gray-500 dark:text-slate-400 capitalize">
                  {c.componentType.replace(/_/g, ' ')}
                </p>
              )}
            </div>
            <span className={`text-xs font-medium capitalize ${config.text}`}>
              {c.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}
