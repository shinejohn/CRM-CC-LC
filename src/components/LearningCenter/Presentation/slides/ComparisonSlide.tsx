import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ComparisonSlideProps {
  content: {
    title: string;
    comparison: {
      left: {
        title: string;
        features: Array<{ text: string; included: boolean }>;
      };
      right: {
        title: string;
        features: Array<{ text: string; included: boolean }>;
      };
    };
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
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
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div
            className="bg-white rounded-lg p-8 shadow-lg animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {content.comparison.left.title}
            </h3>
            <ul className="space-y-3">
              {content.comparison.left.features.map((feature, index) => (
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
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {content.comparison.right.title}
            </h3>
            <ul className="space-y-3">
              {content.comparison.right.features.map((feature, index) => (
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
      </div>
    </div>
  );
};


