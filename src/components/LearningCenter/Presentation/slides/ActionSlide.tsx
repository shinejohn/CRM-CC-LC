import React from 'react';
import { PlayCircle } from 'lucide-react';

interface ActionSlideProps {
  content: {
    headline: string;
    action?: string;
    steps?: string[];
    visual?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const ActionSlide: React.FC<ActionSlideProps> = ({
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
      <div className="max-w-4xl mx-auto text-center">
        <PlayCircle size={64} className="mx-auto mb-6 text-blue-600 animate-fade-in" />
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {content.headline}
        </h2>
        {content.action && (
          <p className="text-xl text-gray-700 mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {content.action}
          </p>
        )}
        {content.steps && (
          <ul className="space-y-3 text-left max-w-2xl mx-auto">
            {content.steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-md animate-fade-in" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                <span className="font-bold text-blue-600">{index + 1}.</span>
                <span className="text-gray-800">{step}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

