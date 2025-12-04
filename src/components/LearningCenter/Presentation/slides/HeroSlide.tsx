import React from 'react';
import { PlayCircle } from 'lucide-react';

interface HeroSlideProps {
  content: {
    headline: string;
    subheadline?: string;
    cta?: {
      primary?: { text: string; url: string };
      secondary?: { text: string; url: string };
    };
    backgroundImage?: string;
    overlay?: boolean;
  };
  isActive: boolean;
}

export const HeroSlide: React.FC<HeroSlideProps> = ({ content, isActive }) => {
  return (
    <div
      className={`
        w-full h-full flex items-center justify-center
        ${isActive ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-500
      `}
      style={{
        backgroundImage: content.backgroundImage
          ? `url(${content.backgroundImage})`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {content.overlay && (
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      )}
      <div className="relative z-10 text-center px-8 max-w-4xl">
        <h1
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          {content.headline}
        </h1>
        {content.subheadline && (
          <p
            className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            {content.subheadline}
          </p>
        )}
        {content.cta && (
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
            style={{ animationDelay: '0.6s' }}
          >
            {content.cta.primary && (
              <a
                href={content.cta.primary.url}
                className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                {content.cta.primary.text}
              </a>
            )}
            {content.cta.secondary && (
              <a
                href={content.cta.secondary.url}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-colors"
              >
                {content.cta.secondary.text}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


