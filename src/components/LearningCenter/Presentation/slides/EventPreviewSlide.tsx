import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';

interface EventPreviewSlideProps {
  content: {
    headline: string;
    event_preview?: {
      title: string;
      date?: string;
      time?: string;
      location?: string;
      description?: string;
      status?: string;
    };
    note?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const EventPreviewSlide: React.FC<EventPreviewSlideProps> = ({
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

        {content.event_preview && (
          <div className="bg-white rounded-lg shadow-xl p-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-center mb-6">
              <Calendar size={64} className={`${accentColors[theme]} mx-auto mb-4 rounded-full p-4`} />
              {content.event_preview.status && (
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${accentColors[theme]}`}>
                  {content.event_preview.status}
                </span>
              )}
            </div>

            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              {content.event_preview.title}
            </h3>

            <div className="space-y-4">
              {content.event_preview.date && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Calendar size={20} className="text-blue-600" />
                  <span className="text-lg">{content.event_preview.date}</span>
                </div>
              )}
              {content.event_preview.time && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Clock size={20} className="text-blue-600" />
                  <span className="text-lg">{content.event_preview.time}</span>
                </div>
              )}
              {content.event_preview.location && (
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin size={20} className="text-blue-600" />
                  <span className="text-lg">{content.event_preview.location}</span>
                </div>
              )}
              {content.event_preview.description && (
                <p className="text-gray-700 mt-4 leading-relaxed">
                  {content.event_preview.description}
                </p>
              )}
            </div>

            {content.note && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-700 text-sm">{content.note}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

