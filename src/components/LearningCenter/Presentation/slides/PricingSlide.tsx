import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface NormalizedPlan {
  name: string;
  price: string;
  period?: string;
  features: string[];
  ctaText: string;
  ctaUrl: string;
  popular?: boolean;
}

interface PricingSlideProps {
  content: Record<string, unknown>;
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

/**
 * Normalize pricing plans from various JSON shapes:
 * - Standard: { plans: [{ name, price, features[], cta: { text, url } }] }
 * - Variant: { options: [{ plan, price, commitment, savings }] }
 */
function normalizePlans(content: Record<string, unknown>): NormalizedPlan[] {
  const raw = (content.plans ?? content.options ?? []) as unknown[];
  if (!Array.isArray(raw)) return [];

  return raw.map((item) => {
    const r = item as Record<string, unknown>;
    const cta = r.cta as Record<string, unknown> | undefined;

    // Gather features from various possible field names
    const features: string[] = [];
    if (Array.isArray(r.features)) {
      features.push(...(r.features as string[]));
    }
    // If no features array, build from descriptive fields
    if (features.length === 0) {
      if (r.commitment) features.push(String(r.commitment));
      if (r.savings) features.push(String(r.savings));
      if (r.includes) features.push(String(r.includes));
    }

    return {
      name: (r.name as string) ?? (r.plan as string) ?? '',
      price: (r.price as string) ?? '',
      period: r.period as string | undefined,
      features,
      ctaText: (cta?.text as string) ?? 'Learn More',
      ctaUrl: (cta?.url as string) ?? '#',
      popular: r.popular as boolean | undefined,
    };
  });
}

export const PricingSlide: React.FC<PricingSlideProps> = ({
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
    blue: 'bg-blue-600',
    green: 'bg-emerald-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
  };

  const plans = normalizePlans(content);

  // Also render guarantee/includes if present at content level
  const guarantee = content.guarantee as string | undefined;
  const includes = content.includes as string | undefined;

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
          {(content.title as string) ?? (content.headline as string) ?? 'Pricing'}
        </h2>
        <div className={`grid grid-cols-1 ${plans.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`
                bg-white rounded-lg p-8 shadow-lg relative
                ${plan.popular ? 'ring-2 ring-indigo-500 scale-105' : ''}
                animate-fade-in
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                {plan.period && (
                  <span className="text-gray-600 ml-2">/{plan.period}</span>
                )}
              </div>
              {plan.features.length > 0 && (
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
              <a
                href={plan.ctaUrl}
                className={`
                  block w-full text-center px-6 py-3 rounded-lg font-semibold
                  ${plan.popular ? accentColors[theme] + ' text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}
                  transition-colors
                `}
              >
                {plan.ctaText}
              </a>
            </div>
          ))}
        </div>
        {(includes || guarantee) && (
          <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {includes && <p className="text-gray-700 mb-2">{includes}</p>}
            {guarantee && <p className="text-sm text-gray-500">{guarantee}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
