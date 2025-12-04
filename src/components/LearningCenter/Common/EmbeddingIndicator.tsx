import React from 'react';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { EmbeddingStatus } from '@/types/learning';

interface EmbeddingIndicatorProps {
  status: EmbeddingStatus;
  className?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'text-gray-600 bg-gray-50 border-gray-200',
    iconColor: 'text-gray-500',
  },
  processing: {
    icon: Loader2,
    label: 'Processing',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    animate: true,
  },
  completed: {
    icon: CheckCircle2,
    label: 'Embedded',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    color: 'text-red-600 bg-red-50 border-red-200',
    iconColor: 'text-red-600',
  },
};

export const EmbeddingIndicator: React.FC<EmbeddingIndicatorProps> = ({
  status,
  className = '',
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${config.color} ${className}`}
    >
      <Icon
        size={12}
        className={config.iconColor}
        {...(config.animate && { className: `${config.iconColor} animate-spin` })}
      />
      <span>{config.label}</span>
    </div>
  );
};


