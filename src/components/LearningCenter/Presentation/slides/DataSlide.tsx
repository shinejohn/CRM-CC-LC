import React from 'react';
import { TrendingUp } from 'lucide-react';

interface DataSlideProps {
  content: Record<string, unknown>;
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

interface NormalizedStat {
  value: string;
  label: string;
  trend?: string;
}

/**
 * Normalize stats from various JSON shapes:
 * - Array: [{ value, label }] — standard
 * - Object: { key1: "value1", key2: "value2" } — convert keys to labels
 */
function normalizeStats(raw: unknown): NormalizedStat[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => {
      const r = item as Record<string, unknown>;
      return {
        value: String(r.value ?? ''),
        label: String(r.label ?? ''),
        trend: r.trend as string | undefined,
      };
    });
  }
  if (raw && typeof raw === 'object') {
    return Object.entries(raw as Record<string, unknown>).map(([key, val]) => ({
      value: String(val ?? ''),
      label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    }));
  }
  return [];
}

export const DataSlide: React.FC<DataSlideProps> = ({
  content,
  isActive,
  theme = 'blue',
}) => {
  const themeColors = {
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    green: 'bg-gradient-to-br from-emerald-50 to-teal-100',
    purple: 'bg-gradient-to-br from-purple-50 to-pink-100',
    orange: 'bg-gradient-to-br from-orange-50 to-red-100',
  };

  const textColors = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  const stats = normalizeStats(content.stats);
  const layout = content.layout as string | undefined;

  return (
    <div
      className={`
        w-full h-full flex items-center justify-center p-12
        ${themeColors[theme]}
        ${isActive ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-500
      `}
    >
      <div className="max-w-6xl mx-auto w-full">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center animate-fade-in">
          {(content.title as string) ?? (content.headline as string) ?? ''}
        </h2>
        <div
          className={`grid ${
            layout === 'list' ? 'grid-cols-1' : `grid-cols-2 md:grid-cols-${Math.min(stats.length, 4)}`
          } gap-6`}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-lg text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`text-5xl font-bold ${textColors[theme]} mb-2`}>
                {stat.value}
              </div>
              <div className="text-gray-700 font-medium">{stat.label}</div>
              {stat.trend && (
                <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-600">
                  <TrendingUp size={14} />
                  <span>{stat.trend}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
