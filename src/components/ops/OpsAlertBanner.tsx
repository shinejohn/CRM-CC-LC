// ============================================
// OpsAlertBanner - Critical alert banner
// ============================================

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { Alert } from '@/types/operations';

interface OpsAlertBannerProps {
  alerts: Alert[];
  onDismiss?: (id: string) => void;
  onViewAll?: () => void;
}

const severityConfig = {
  emergency: { bg: 'bg-red-600', text: 'text-white', icon: AlertTriangle },
  critical: { bg: 'bg-red-500', text: 'text-white', icon: AlertTriangle },
  warning: { bg: 'bg-amber-500', text: 'text-white', icon: AlertTriangle },
  info: { bg: 'bg-blue-500', text: 'text-white', icon: AlertTriangle },
};

export function OpsAlertBanner({ alerts, onDismiss, onViewAll }: OpsAlertBannerProps) {
  const criticalAlerts = alerts.filter(
    (a) => a.severity === 'critical' || a.severity === 'emergency'
  );
  if (criticalAlerts.length === 0) return null;

  const top = criticalAlerts[0];
  const config = severityConfig[top.severity] ?? severityConfig.critical;
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.text} px-4 py-3 rounded-lg flex items-center justify-between gap-4 shadow-md`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Icon className="w-5 h-5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold truncate">{top.title}</p>
          {top.description && (
            <p className="text-sm opacity-90 truncate">{top.description}</p>
          )}
          {criticalAlerts.length > 1 && (
            <p className="text-xs mt-1 opacity-80">
              +{criticalAlerts.length - 1} more critical alert
              {criticalAlerts.length > 2 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="px-3 py-1.5 rounded bg-white/20 hover:bg-white/30 text-sm font-medium"
          >
            View all
          </button>
        )}
        {onDismiss && (
          <button
            onClick={() => onDismiss(top.id)}
            className="p-1 rounded hover:bg-white/20"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
