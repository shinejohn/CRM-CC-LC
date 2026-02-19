// ============================================
// OpsMetricCard - Metric display with sparkline
// ============================================

import React from 'react';

interface OpsMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  sparklineData?: number[];
  status?: 'healthy' | 'warning' | 'critical';
  icon?: React.ReactNode;
}

export function OpsMetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  sparklineData,
  status = 'healthy',
  icon,
}: OpsMetricCardProps) {
  const statusColors = {
    healthy: 'border-l-green-500',
    warning: 'border-l-amber-500',
    critical: 'border-l-red-500',
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  };

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 border-l-4 ${statusColors[status]} shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
            {title}
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white truncate">
            {value}
          </p>
          {(subtitle || trendValue) && (
            <div className="mt-1 flex items-center gap-2">
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-slate-400">{subtitle}</p>
              )}
              {trendValue && trend && (
                <span className={`text-xs font-medium ${trendColors[trend]}`}>
                  {trendValue}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-2 text-gray-400 dark:text-slate-500">
            {icon}
          </div>
        )}
      </div>
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3 h-8 flex items-end gap-0.5">
          {sparklineData.map((v, i) => {
            const max = Math.max(...sparklineData);
            const h = max > 0 ? (v / max) * 100 : 0;
            return (
              <div
                key={i}
                className="flex-1 bg-indigo-200 dark:bg-indigo-800 rounded-t min-w-[2px]"
                style={{ height: `${Math.max(h, 4)}%` }}
                title={String(v)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
