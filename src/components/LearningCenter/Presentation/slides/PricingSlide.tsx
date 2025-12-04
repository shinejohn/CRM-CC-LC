import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface PricingSlideProps {
  content: {
    title: string;
    plans: Array<{
      name: string;
      price: string;
      period?: string;
      features: string[];
      cta: { text: string; url: string };
      popular?: boolean;
    }>;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
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
          {content.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.plans.map((plan, index) => (
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
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href={plan.cta.url}
                className={`
                  block w-full text-center px-6 py-3 rounded-lg font-semibold
                  ${plan.popular ? accentColors[theme] + ' text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}
                  transition-colors
                `}
              >
                {plan.cta.text}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


