import React from 'react';
import { Clock, Target, BookOpen } from 'lucide-react';

interface TutorialIntroSlideProps {
  content: {
    headline: string;
    subhead?: string;
    expectations?: {
      time?: string;
      difficulty?: string;
      outcome?: string;
    };
    visual?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const TutorialIntroSlide: React.FC<TutorialIntroSlideProps> = ({
  content,
  isActive,
  theme = 'blue',
}) => {
  const themeColors = {
    blue: 'bg-gradient-to-br from-indigo-500 to-blue-600',
    green: 'bg-gradient-to-br from-teal-500 to-emerald-600',
    purple: 'bg-gradient-to-br from-pink-500 to-purple-600',
    orange: 'bg-gradient-to-br from-red-500 to-orange-600',
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
      <div className="max-w-4xl mx-auto text-center text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
          {content.headline}
        </h1>
        
        {content.subhead && (
          <p className="text-xl md:text-2xl text-white/90 mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {content.subhead}
          </p>
        )}

        {content.expectations && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {content.expectations.time && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <Clock size={32} className="mx-auto mb-3 text-white" />
                <div className="text-sm font-semibold mb-1">Time</div>
                <div className="text-xl font-bold">{content.expectations.time}</div>
              </div>
            )}
            
            {content.expectations.difficulty && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <BookOpen size={32} className="mx-auto mb-3 text-white" />
                <div className="text-sm font-semibold mb-1">Difficulty</div>
                <div className="text-xl font-bold">{content.expectations.difficulty}</div>
              </div>
            )}
            
            {content.expectations.outcome && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <Target size={32} className="mx-auto mb-3 text-white" />
                <div className="text-sm font-semibold mb-1">You'll Learn</div>
                <div className="text-xl font-bold">{content.expectations.outcome}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};





