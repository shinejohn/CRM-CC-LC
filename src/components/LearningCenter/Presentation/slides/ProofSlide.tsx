import React from 'react';
import { TrendingUp, Quote } from 'lucide-react';

interface ProofSlideProps {
  content: {
    case_study?: {
      business: string;
      before: string;
      after: string;
      time_change?: string;
      results: string;
      quote?: string;
    };
    testimonial?: {
      quote: string;
      author: string;
      business_type?: string;
    };
    visual?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const ProofSlide: React.FC<ProofSlideProps> = ({
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
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
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
        {/* Case Study Display */}
        {content.case_study && (
          <>
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center animate-fade-in">
              Real Results
            </h2>

            <div className="bg-white rounded-lg p-8 shadow-xl mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{content.case_study.business}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="border-l-4 border-red-500 pl-4">
                    <div className="text-sm font-semibold text-gray-600 mb-2">Before</div>
                    <p className="text-gray-800">{content.case_study.before}</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="text-sm font-semibold text-gray-600 mb-2">After</div>
                    <p className="text-gray-800">{content.case_study.after}</p>
                  </div>
                </div>

                {content.case_study.time_change && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-700">
                      <TrendingUp size={20} className={accentColors[theme]} />
                      <span className="font-semibold">{content.case_study.time_change}</span>
                    </div>
                  </div>
                )}

                <div className={`p-4 bg-green-50 rounded-lg border-2 border-green-500 mb-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={24} className="text-green-600" />
                    <span className="font-bold text-green-800 text-lg">Results</span>
                  </div>
                  <p className="text-green-900 font-semibold">{content.case_study.results}</p>
                </div>

                {content.case_study.quote && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                    <Quote size={24} className={`${accentColors[theme]} mb-2`} />
                    <p className="text-gray-800 italic text-lg">"{content.case_study.quote}"</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Testimonial Display */}
        {content.testimonial && (
          <div className="bg-white rounded-lg p-8 shadow-xl animate-fade-in">
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





