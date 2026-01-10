import React from 'react';
import { TrendingUp, CheckCircle2 } from 'lucide-react';

interface ResultsSlideProps {
  content: {
    headline: string;
    results: Array<{ metric: string; label: string }>;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const ResultsSlide: React.FC<ResultsSlideProps> = ({
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

  return (
    <div
      className={`
        w-full h-full flex items-center justify-center p-12
        ${themeColors[theme]}
        ${isActive ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-500
      `}
    >
      <div className="max-w-5xl mx-auto w-full">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center animate-fade-in">
          {content.headline}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {content.results.map((result, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-8 shadow-lg text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <TrendingUp size={48} className={`${accentColors[theme]} mx-auto mb-4`} />
              <div className="text-4xl font-bold text-gray-900 mb-2">{result.metric}</div>
              <div className="text-gray-600">{result.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

