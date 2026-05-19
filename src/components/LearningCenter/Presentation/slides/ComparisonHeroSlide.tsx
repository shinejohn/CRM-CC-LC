import React from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';

interface ComparisonHeroSlideProps {
  content: Record<string, unknown>;
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

function resolveComparison(content: Record<string, unknown>): { left: { label: string; value: string }; right: { label: string; value: string }; multiplier?: string } | null {
  const c = content.comparison as Record<string, unknown> | undefined;
  if (!c) return null;

  // Standard: { before, after }
  if (c.before && c.after) {
    return { left: { label: 'Before', value: String(c.before) }, right: { label: 'After', value: String(c.after) } };
  }

  // Variant: { your_views, featured_average, multiplier }
  if (c.your_views !== undefined || c.featured_average !== undefined) {
    return {
      left: { label: 'Standard Listing', value: String(c.your_views ?? '—') },
      right: { label: 'Featured Listing', value: String(c.featured_average ?? '—') },
      multiplier: c.multiplier ? String(c.multiplier) : undefined,
    };
  }

  // Generic: render first two key-value pairs
  const entries = Object.entries(c).filter(([k]) => k !== 'multiplier');
  if (entries.length >= 2) {
    return {
      left: { label: entries[0][0].replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()), value: String(entries[0][1]) },
      right: { label: entries[1][0].replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()), value: String(entries[1][1]) },
      multiplier: c.multiplier ? String(c.multiplier) : undefined,
    };
  }

  return null;
}

export const ComparisonHeroSlide: React.FC<ComparisonHeroSlideProps> = ({
  content,
  isActive,
  theme = 'blue',
}) => {
  const themeColors = {
    blue: 'from-indigo-500 to-blue-600',
    green: 'from-teal-500 to-emerald-600',
    purple: 'from-pink-500 to-purple-600',
    orange: 'from-red-500 to-orange-600',
  };

  const comparison = resolveComparison(content);
  const headline = (content.headline as string) ?? (content.title as string) ?? '';
  const subhead = content.subhead as string | undefined;

  return (
    <div
      className={`
        w-full h-full flex items-center justify-center
        bg-gradient-to-br ${themeColors[theme]}
        ${isActive ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-500
      `}
    >
      <div className="max-w-5xl mx-auto text-white px-8">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-center animate-fade-in">
          {headline}
        </h1>
        {subhead && (
          <p className="text-xl text-white/80 text-center mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {subhead}
          </p>
        )}
        {comparison && (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 animate-fade-in text-center">
              <div className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">{comparison.left.label}</div>
              <p className="text-3xl font-bold">{comparison.left.value}</p>
            </div>
            <div className="hidden md:flex flex-col items-center gap-2">
              <ArrowRight size={32} className="text-white/60" />
              {comparison.multiplier && (
                <div className="flex items-center gap-1 bg-yellow-400 text-gray-900 rounded-full px-3 py-1 text-sm font-bold">
                  <TrendingUp size={14} />
                  {comparison.multiplier}
                </div>
              )}
            </div>
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-8 animate-fade-in ring-2 ring-white/40 text-center" style={{ animationDelay: '0.2s' }}>
              <div className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">{comparison.right.label}</div>
              <p className="text-3xl font-bold">{comparison.right.value}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};





