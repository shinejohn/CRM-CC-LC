import React from 'react';
import { Tag, Calendar, Edit } from 'lucide-react';

interface CouponPreviewSlideProps {
  content: {
    headline: string;
    coupon_preview: {
      offer: string;
      value?: string;
      terms?: string;
      expiry?: string;
      redemption?: string;
      status?: string;
    };
    note?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const CouponPreviewSlide: React.FC<CouponPreviewSlideProps> = ({
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
    blue: 'bg-blue-600 text-white border-blue-700',
    green: 'bg-emerald-600 text-white border-emerald-700',
    purple: 'bg-purple-600 text-white border-purple-700',
    orange: 'bg-orange-600 text-white border-orange-700',
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

        <div className="bg-white rounded-lg shadow-xl p-8 border-4 border-dashed border-gray-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="text-center mb-6">
            <Tag size={64} className={`${accentColors[theme]} mx-auto mb-4 rounded-full p-4`} />
            {content.coupon_preview.status && (
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${accentColors[theme]}`}>
                {content.coupon_preview.status}
              </span>
            )}
          </div>

          <div className="space-y-4 text-center">
            <h3 className="text-3xl font-bold text-gray-900">{content.coupon_preview.offer}</h3>
            
            {content.coupon_preview.value && (
              <p className="text-2xl text-gray-700 font-semibold">{content.coupon_preview.value}</p>
            )}

            {content.coupon_preview.terms && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{content.coupon_preview.terms}</p>
              </div>
            )}

            {content.coupon_preview.expiry && (
              <div className="flex items-center justify-center gap-2 text-gray-600 mt-4">
                <Calendar size={20} />
                <span>{content.coupon_preview.expiry}</span>
              </div>
            )}

            {content.coupon_preview.redemption && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-700 font-medium">{content.coupon_preview.redemption}</p>
              </div>
            )}
          </div>

          {content.note && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500 flex items-start gap-2">
              <Edit size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700 text-sm">{content.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

