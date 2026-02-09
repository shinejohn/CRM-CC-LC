import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface OverviewSlideProps {
  content: {
    headline: string;
    areas?: Array<{ num: number; name: string; desc: string }>;
    topics?: string[];
    visual?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const OverviewSlide: React.FC<OverviewSlideProps> = ({
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
      <div className="max-w-6xl mx-auto w-full">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center animate-fade-in">
          {content.headline}
        </h2>

        {/* Areas Display */}
        {content.areas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.areas.map((area, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className={`w-12 h-12 ${accentColors[theme]} rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0`}
                  >
                    {area.num}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{area.name}</h3>
                </div>
                <p className="text-gray-600 ml-16">{area.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Topics List */}
        {content.topics && (
          <ul className="space-y-4 max-w-3xl mx-auto">
            {content.topics.map((topic, index) => (
              <li
                key={index}
                className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-md animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CheckCircle2 size={24} className={`${accentColors[theme]} rounded-full mt-0.5 flex-shrink-0`} />
                <span className="text-lg text-gray-800">{topic}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};





