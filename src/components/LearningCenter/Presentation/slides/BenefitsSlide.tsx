import React from 'react';
import { Search, Bot, Megaphone, BarChart3, CheckCircle2 } from 'lucide-react';

interface NormalizedBenefit {
  icon?: string;
  title: string;
  desc: string;
}

interface BenefitsSlideProps {
  content: Record<string, unknown>;
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

const iconMap: Record<string, React.ComponentType<{ size?: number | string; className?: string }>> = {
  search: Search,
  robot: Bot,
  megaphone: Megaphone,
  chart: BarChart3,
  check: CheckCircle2,
  star: CheckCircle2,
};

/**
 * Normalize benefits from various JSON shapes:
 * - Standard: { icon, title, desc }
 * - Variant 1: { stat, label }
 * - Variant 2: { icon, benefit, detail }
 * - Variant 3: { pain, solution }
 * - Variant 4: { benefit, reach }
 */
function normalizeBenefits(raw: unknown[]): NormalizedBenefit[] {
  return raw.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      icon: (r.icon as string) ?? undefined,
      title: (r.title as string) ?? (r.benefit as string) ?? (r.stat as string) ?? (r.pain as string) ?? '',
      desc: (r.desc as string) ?? (r.detail as string) ?? (r.label as string) ?? (r.solution as string) ?? (r.reach as string) ?? '',
    };
  });
}

export const BenefitsSlide: React.FC<BenefitsSlideProps> = ({
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

  const accentColors = {
    blue: 'bg-blue-600 text-white',
    green: 'bg-emerald-600 text-white',
    purple: 'bg-purple-600 text-white',
    orange: 'bg-orange-600 text-white',
  };

  const rawBenefits = Array.isArray(content.benefits) ? content.benefits : [];
  const benefits = normalizeBenefits(rawBenefits);

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
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center animate-fade-in">
          {(content.headline as string) ?? ''}
        </h2>

        <div className={`grid grid-cols-1 md:grid-cols-2 ${benefits.length <= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon ? iconMap[benefit.icon] : CheckCircle2;

            return (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-lg text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {IconComponent && (
                  <div className={`${accentColors[theme]} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent size={32} className="text-white" />
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
