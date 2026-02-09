import React from 'react';
import { Eye } from 'lucide-react';

interface PreviewSlideProps {
  content: {
    headline: string;
    preview?: any;
    note?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const PreviewSlide: React.FC<PreviewSlideProps> = ({
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
        <Eye size={64} className="mx-auto mb-6 text-blue-600 animate-fade-in" />
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {content.headline}
        </h2>
        {content.preview && (
          <div className="bg-white rounded-lg p-8 shadow-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <pre className="text-gray-800 whitespace-pre-wrap">{JSON.stringify(content.preview, null, 2)}</pre>
          </div>
        )}
        {content.note && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <p className="text-gray-700 text-sm">{content.note}</p>
          </div>
        )}
      </div>
    </div>
  );
};





