import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ComparisonColumn {
  title: string;
  features: Array<{ text: string; included: boolean }>;
}

interface ComparisonSlideProps {
  content: Record<string, unknown>;
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

/**
 * Normalize comparison data from various JSON shapes:
 * - Standard: { left: { title, features[] }, right: { title, features[] } }
 * - Named keys: { disconnected: { label, ...fields }, connected: { label, ...fields } }
 */
function resolveColumns(comparison: Record<string, unknown> | undefined): { left: ComparisonColumn; right: ComparisonColumn } | null {
  if (!comparison) return null;

  // Standard shape: left/right with features arrays
  const left = comparison.left as Record<string, unknown> | undefined;
  const right = comparison.right as Record<string, unknown> | undefined;
  if (left?.features && right?.features) {
    return {
      left: { title: (left.title as string) ?? '', features: left.features as ComparisonColumn['features'] },
      right: { title: (right.title as string) ?? '', features: right.features as ComparisonColumn['features'] },
    };
  }

  // Named-key shape: any two keys that are objects (e.g. disconnected/connected)
  const keys = Object.keys(comparison).filter(k => typeof comparison[k] === 'object' && comparison[k] !== null);
  if (keys.length >= 2) {
    const a = comparison[keys[0]] as Record<string, unknown>;
    const b = comparison[keys[1]] as Record<string, unknown>;

    // Convert object fields into a features list for display
    const toFeatures = (obj: Record<string, unknown>, skipKeys: string[]): ComparisonColumn['features'] => {
      return Object.entries(obj)
        .filter(([k]) => !skipKeys.includes(k))
        .map(([k, v]) => ({ text: `${k.replace(/_/g, ' ')}: ${String(v)}`, included: true }));
    };

    return {
      left: {
        title: (a.label as string) ?? (a.title as string) ?? keys[0].replace(/_/g, ' '),
        features: (a.features as ComparisonColumn['features']) ?? toFeatures(a, ['label', 'title']),
      },
      right: {
        title: (b.label as string) ?? (b.title as string) ?? keys[1].replace(/_/g, ' '),
        features: (b.features as ComparisonColumn['features']) ?? toFeatures(b, ['label', 'title']),
      },
    };
  }

  return null;
}

export const ComparisonSlide: React.FC<ComparisonSlideProps> = ({
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

  const columns = resolveColumns(content.comparison as Record<string, unknown> | undefined);

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
          {(content.title as string) ?? (content.headline as string) ?? 'Comparison'}
        </h2>
        {columns ? (
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div
              className="bg-white rounded-lg p-8 shadow-lg animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 capitalize">
                {columns.left.title}
              </h3>
              <ul className="space-y-3">
                {columns.left.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
                    ) : (
                      <X size={20} className="text-red-600 flex-shrink-0" />
                    )}
                    <span className="text-gray-700">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column */}
            <div
              className="bg-white rounded-lg p-8 shadow-lg animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 capitalize">
                {columns.right.title}
              </h3>
              <ul className="space-y-3">
                {columns.right.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
                    ) : (
                      <X size={20} className="text-red-600 flex-shrink-0" />
                    )}
                    <span className="text-gray-700">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg">Comparison data not available.</p>
        )}
      </div>
    </div>
  );
};
