import React from 'react';
import { CheckCircle2, AlertCircle, Clock, AlertTriangle } from 'lucide-react';
import type { ValidationStatus } from '@/types/learning';

interface ValidationIndicatorProps {
  status: ValidationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  className?: string;
}

const statusConfig = {
  verified: {
    icon: CheckCircle2,
    label: 'Verified',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
  },
  unverified: {
    icon: Clock,
    label: 'Unverified',
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    iconColor: 'text-gray-500',
  },
  disputed: {
    icon: AlertCircle,
    label: 'Disputed',
    color: 'text-red-600 bg-red-50 border-red-200',
    iconColor: 'text-red-600',
  },
  outdated: {
    icon: AlertTriangle,
    label: 'Outdated',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
  },
};

export const ValidationIndicator: React.FC<ValidationIndicatorProps> = ({
  status,
  verifiedAt,
  verifiedBy,
  className = '',
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm font-medium ${config.color} ${className}`}
      title={
        verifiedAt
          ? `Verified ${formatDate(verifiedAt)}${verifiedBy ? ` by ${verifiedBy}` : ''}`
          : config.label
      }
    >
      <Icon size={14} className={config.iconColor} />
      <span>{config.label}</span>
      {verifiedAt && (
        <span className="text-xs opacity-75 ml-1">
          {formatDate(verifiedAt)}
        </span>
      )}
    </div>
  );
};


