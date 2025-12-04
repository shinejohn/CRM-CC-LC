import React from 'react';
import { Globe, User, Search } from 'lucide-react';
import type { ValidationSource } from '@/types/learning';

interface SourceBadgeProps {
  source: ValidationSource;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

const sourceConfig = {
  google: {
    icon: Search,
    label: 'Google',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    iconColor: 'text-blue-600',
  },
  serpapi: {
    icon: Search,
    label: 'SerpAPI',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    iconColor: 'text-emerald-600',
  },
  website: {
    icon: Globe,
    label: 'Website',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    iconColor: 'text-purple-600',
  },
  owner: {
    icon: User,
    label: 'Owner',
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    iconColor: 'text-amber-600',
  },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  source,
  size = 'md',
  showIcon = true,
  showLabel = true,
  className = '',
}) => {
  const config = sourceConfig[source];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.color} ${sizeClasses[size]} ${className}`}
      title={`Source: ${config.label}`}
    >
      {showIcon && <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} className={config.iconColor} />}
      {showLabel && config.label}
    </span>
  );
};

