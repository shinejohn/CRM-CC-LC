// ============================================
// Ops System Health - Component health grid
// ============================================

import React from 'react';
import { operationsApi } from '@/services/operations/operations-api';
import { useQuery } from '@tanstack/react-query';
import { OpsModuleStatus } from '@/components/ops/OpsModuleStatus';
import { OpsHealthGrid } from '@/components/ops/OpsHealthGrid';
import type { InfrastructureComponent } from '@/types/operations';

export function OpsSystemHealth() {
  const { data, isLoading } = useQuery({
    queryKey: ['ops', 'infrastructure', 'components'],
    queryFn: () => operationsApi.getInfrastructureComponents({ perPage: 50 }),
  });

  const components = data?.data ?? [];

  const byCategory = components.reduce(
    (acc, c) => {
      const cat = c.category ?? 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(c);
      return acc;
    },
    {} as Record<string, InfrastructureComponent[]>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-gray-500">Loading components...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        System Health
      </h1>
      <p className="text-gray-500 dark:text-slate-400">
        Infrastructure component status and health checks.
      </p>

      {components.length === 0 ? (
        <p className="text-gray-500">No infrastructure components configured.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(byCategory).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                {category.replace(/_/g, ' ')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((c) => (
                  <OpsModuleStatus
                    key={c.id}
                    moduleName={c.name}
                    status={c.currentStatus}
                    lastCheck={
                      c.lastStatusChange
                        ? new Date(c.lastStatusChange).toLocaleString()
                        : undefined
                    }
                    details={c.description}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
