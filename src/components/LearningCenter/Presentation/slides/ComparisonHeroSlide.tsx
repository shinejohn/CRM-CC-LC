import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ComparisonHeroSlideProps {
  content: {
    headline: string;
    comparison?: {
      before: string;
      after: string;
    };
    visual?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const ComparisonHeroSlide: React.FC<ComparisonHeroSlideProps> = ({
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
        w-full h-full flex items-center justify-center
        bg-gradient-to-br ${themeColors[theme]}
        ${isActive ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-500
      `}
    >
      <div className="max-w-5xl mx-auto text-white px-8">
        <h1 className="text-5xl md:text-6xl font-bold mb-12 text-center animate-fade-in">
          {content.headline}
        </h1>
        {content.comparison && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 animate-fade-in">
              <div className="text-sm font-semibold mb-2">Before</div>
              <p className="text-xl">{content.comparison.before}</p>
            </div>
            <ArrowRight size={32} className="text-white mx-auto hidden md:block self-center" />
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-sm font-semibold mb-2">After</div>
              <p className="text-xl">{content.comparison.after}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};





