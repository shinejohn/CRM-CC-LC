import React from 'react';
import { ArrowRight } from 'lucide-react';

interface FlowSlideProps {
  content: {
    headline: string;
    steps?: Array<{ step: string; description?: string }>;
    visual?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const FlowSlide: React.FC<FlowSlideProps> = ({
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
      <div className="max-w-5xl mx-auto w-full">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center animate-fade-in">
          {content.headline}
        </h2>
        {content.steps && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {content.steps.map((item, index) => (
              <React.Fragment key={index}>
                <div className="flex-1 text-center bg-white rounded-lg p-6 shadow-md animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-2xl font-bold text-blue-600 mb-2">{index + 1}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.step}</h3>
                  {item.description && <p className="text-gray-600">{item.description}</p>}
                </div>
                {index < content.steps.length - 1 && (
                  <ArrowRight size={24} className="text-gray-400 flex-shrink-0 hidden md:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};





