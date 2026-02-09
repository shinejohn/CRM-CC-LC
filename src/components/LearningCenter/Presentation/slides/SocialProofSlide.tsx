import React from 'react';
import { Users, TrendingUp, Quote } from 'lucide-react';

interface SocialProofSlideProps {
  content: {
    headline: string;
    stats?: Array<{ value: string; label: string }>;
    testimonial?: {
      quote: string;
      author: string;
      business_type?: string;
    };
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const SocialProofSlide: React.FC<SocialProofSlideProps> = ({
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
      <div className="max-w-5xl mx-auto w-full">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center animate-fade-in">
          {content.headline}
        </h2>

        {content.stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {content.stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-lg text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <TrendingUp size={32} className={`${accentColors[theme]} mx-auto mb-3`} />
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {content.testimonial && (
          <div className="bg-white rounded-lg p-8 shadow-xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Quote size={48} className={`${accentColors[theme]} mb-4`} />
            <p className="text-2xl text-gray-800 italic mb-6">"{content.testimonial.quote}"</p>
            <div className="border-t pt-4">
              <p className="font-bold text-gray-900">{content.testimonial.author}</p>
              {content.testimonial.business_type && (
                <p className="text-gray-600">{content.testimonial.business_type}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};





