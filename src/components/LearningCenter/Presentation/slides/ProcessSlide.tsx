import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ProcessSlideProps {
  content: {
    title: string;
    steps: Array<{
      number: number;
      title: string;
      description: string;
      icon?: string;
    }>;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const ProcessSlide: React.FC<ProcessSlideProps> = ({
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
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center animate-fade-in">
          {content.title}
        </h2>
        <div className="flex items-center justify-between gap-4">
          {content.steps.map((step, index) => (
            <React.Fragment key={index}>
              <div
                className="flex-1 text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div
                  className={`w-16 h-16 ${accentColors[theme]} rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4`}
                >
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
              {index < content.steps.length - 1 && (
                <ArrowRight size={24} className="text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};


