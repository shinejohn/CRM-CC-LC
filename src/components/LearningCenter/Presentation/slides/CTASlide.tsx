import React from 'react';

interface CTASlideProps {
  content: {
    headline: string;
    subheadline?: string;
    primaryButton: { text: string; url: string };
    secondaryButton?: { text: string; url: string };
    backgroundImage?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const CTASlide: React.FC<CTASlideProps> = ({
  content,
  isActive,
  theme = 'blue',
}) => {
  const themeColors = {
    blue: 'from-indigo-600 to-blue-700',
    green: 'from-emerald-600 to-teal-700',
    purple: 'from-purple-600 to-pink-700',
    orange: 'from-orange-600 to-red-700',
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
        backgroundImage: content.backgroundImage
          ? `url(${content.backgroundImage})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {content.backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      )}
      <div className="relative z-10 text-center px-8 max-w-3xl">
        <h2
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in"
        >
          {content.headline}
        </h2>
        {content.subheadline && (
          <p
            className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            {content.subheadline}
          </p>
        )}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          <a
            href={content.primaryButton.url}
            className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            {content.primaryButton.text}
          </a>
          {content.secondaryButton && (
            <a
              href={content.secondaryButton.url}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-colors"
            >
              {content.secondaryButton.text}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};


