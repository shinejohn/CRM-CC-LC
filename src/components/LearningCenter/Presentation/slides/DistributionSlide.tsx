import React from 'react';
import { Share2 } from 'lucide-react';

interface DistributionSlideProps {
  content: {
    headline: string;
    channels?: string[];
    visual?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const DistributionSlide: React.FC<DistributionSlideProps> = ({
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
      <div className="max-w-4xl mx-auto w-full">
        <Share2 size={64} className="mx-auto mb-6 text-blue-600 animate-fade-in" />
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {content.headline}
        </h2>
        {content.channels && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.channels.map((channel, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md animate-fade-in" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                <span className="text-gray-800 text-lg">{channel}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};





