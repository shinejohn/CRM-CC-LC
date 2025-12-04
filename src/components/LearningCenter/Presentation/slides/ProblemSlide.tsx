import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ProblemSlideProps {
  content: {
    title: string;
    problem: string;
    painPoints?: string[];
    visual?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const ProblemSlide: React.FC<ProblemSlideProps> = ({
  content,
  isActive,
  theme = 'blue',
}) => {
  const themeColors = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-emerald-500 to-teal-600',
    purple: 'from-purple-500 to-pink-600',
    orange: 'from-orange-500 to-red-600',
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
          <AlertTriangle size={32} className="text-yellow-300" />
          <h2 className="text-4xl font-bold">{content.title}</h2>
        </div>
        <p className="text-xl mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {content.problem}
        </p>
        {content.painPoints && content.painPoints.length > 0 && (
          <ul
            className="space-y-3 animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            {content.painPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-yellow-300 mt-1">•</span>
                <span className="text-lg">{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};


