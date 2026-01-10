import React from 'react';
import { Folder } from 'lucide-react';

interface CategorySlideProps {
  content: {
    headline: string;
    categories?: string[];
    visual?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const CategorySlide: React.FC<CategorySlideProps> = ({
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
        <Folder size={64} className="mx-auto mb-6 text-blue-600 animate-fade-in" />
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {content.headline}
        </h2>
        {content.categories && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {content.categories.map((category, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-md text-center animate-fade-in" style={{ animationDelay: `${0.2 + index * 0.05}s` }}>
                <span className="text-gray-800">{category}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

