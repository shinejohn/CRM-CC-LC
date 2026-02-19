// ============================================
// OpsModuleStatus - Per-module status indicator
// ============================================

import React from 'react';
import { CheckCircle, AlertCircle, XCircle, HelpCircle } from 'lucide-react';

type Status = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

interface OpsModuleStatusProps {
  moduleName: string;
  status: Status;
  lastCheck?: string;
  details?: string;
}

const statusConfig: Record<
  Status,
  { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  healthy: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  degraded: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  unhealthy: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  unknown: { icon: HelpCircle, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-slate-800' },
};

export function OpsModuleStatus({
  moduleName,
  status,
  lastCheck,
  details,
}: OpsModuleStatusProps) {
  const config = statusConfig[status] ?? statusConfig.unknown;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 ${config.bg}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${config.color}`} />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900 dark:text-white">{moduleName}</p>
        {details && (
          <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{details}</p>
        )}
        {lastCheck && (
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            Last check: {lastCheck}
          </p>
        )}
      </div>
      <span className={`text-sm font-medium capitalize ${config.color}`}>{status}</span>
    </div>
  );
}
