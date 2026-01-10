import React from 'react';
import { Building2, MapPin, FileText } from 'lucide-react';

interface ListingPreviewSlideProps {
  content: {
    headline: string;
    listing_preview: {
      business_name: string;
      category?: string;
      location?: string;
      description?: string;
      placeholder_image?: boolean;
      status?: string;
    };
    note?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const ListingPreviewSlide: React.FC<ListingPreviewSlideProps> = ({
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
      <div className="max-w-4xl mx-auto w-full">
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center animate-fade-in">
          {content.headline}
        </h2>

        <div className="bg-white rounded-lg shadow-xl p-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {content.listing_preview.placeholder_image && (
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
              <Building2 size={64} className="text-gray-400" />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {content.listing_preview.business_name}
              </h3>
              {content.listing_preview.status && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${accentColors[theme]}`}>
                  {content.listing_preview.status}
                </span>
              )}
            </div>

            {content.listing_preview.category && (
              <div className="flex items-center gap-2 text-gray-600">
                <FileText size={20} />
                <span>{content.listing_preview.category}</span>
              </div>
            )}

            {content.listing_preview.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={20} />
                <span>{content.listing_preview.location}</span>
              </div>
            )}

            {content.listing_preview.description && (
              <p className="text-gray-700 mt-4 leading-relaxed">
                {content.listing_preview.description}
              </p>
            )}
          </div>

          {content.note && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-700 text-sm">{content.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

