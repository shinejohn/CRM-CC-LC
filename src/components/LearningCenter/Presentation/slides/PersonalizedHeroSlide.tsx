import React from 'react';
import { Sparkles } from 'lucide-react';

interface PersonalizedHeroSlideProps {
  content: {
    headline: string;
    subhead?: string;
    visual?: string;
    personalization?: string[];
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const PersonalizedHeroSlide: React.FC<PersonalizedHeroSlideProps> = ({
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
      style={{
        backgroundImage: content.visual
          ? `url(${content.visual})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {content.visual && (
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      )}
      
      <div className="relative z-10 text-center px-8 max-w-4xl">
        <div className="flex items-center justify-center gap-2 mb-4 animate-fade-in">
          <Sparkles size={24} className="text-yellow-300" />
          <span className="text-yellow-300 font-semibold">Personalized For You</span>
          <Sparkles size={24} className="text-yellow-300" />
        </div>
        
        <h1
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          {content.headline}
        </h1>
        
        {content.subhead && (
          <p
            className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            {content.subhead}
          </p>
        )}
      </div>
    </div>
  );
};

