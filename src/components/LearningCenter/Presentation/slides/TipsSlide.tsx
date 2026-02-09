import React from 'react';
import { Lightbulb } from 'lucide-react';

interface TipsSlideProps {
  content: {
    headline?: string;
    tips: string[];
    visual?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const TipsSlide: React.FC<TipsSlideProps> = ({
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
      <div className="max-w-4xl mx-auto w-full">
        {content.headline && (
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center animate-fade-in">
            {content.headline}
          </h2>
        )}

        <div className="space-y-4">
          {content.tips.map((tip, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-lg flex items-start gap-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`${accentColors[theme]} rounded-full p-2 flex-shrink-0`}>
                <Lightbulb size={24} className="text-white" />
              </div>
              <p className="text-lg text-gray-800 flex-1">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};





