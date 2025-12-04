import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SolutionSlideProps {
  content: {
    title: string;
    solution: string;
    benefits?: string[];
    visual?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const SolutionSlide: React.FC<SolutionSlideProps> = ({
  content,
  isActive,
  theme = 'blue',
}) => {
  const themeColors = {
    blue: 'from-indigo-500 to-blue-600',
    green: 'from-teal-500 to-emerald-600',
    purple: 'from-pink-500 to-purple-600',
    orange: 'from-red-500 to-orange-600',
  };

  return (
    <div
      className={`
        w-full h-full flex items-center justify-center p-12
        bg-gradient-to-br ${themeColors[theme]}
        ${isActive ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-500
      `}
    >
      <div className="max-w-4xl mx-auto text-white">
        <div className="flex items-center gap-3 mb-6 animate-fade-in">
          <CheckCircle2 size={32} className="text-green-300" />
          <h2 className="text-4xl font-bold">{content.title}</h2>
        </div>
        <p className="text-xl mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {content.solution}
        </p>
        {content.benefits && content.benefits.length > 0 && (
          <ul
            className="space-y-3 animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            {content.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-300 mt-0.5 flex-shrink-0" />
                <span className="text-lg">{benefit}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};


