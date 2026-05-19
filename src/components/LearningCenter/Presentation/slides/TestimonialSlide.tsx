import React from 'react';
import { Quote } from 'lucide-react';

interface TestimonialSlideProps {
  content: {
    title?: string;
    headline?: string;
    testimonial?: {
      quote: string;
      author: string;
      role?: string;
      company?: string;
      business_type?: string;
      business?: string;
      category?: string;
      result?: string;
      avatar?: string;
    };
    quote?: string;
    author?: string;
    business_type?: string;
    business?: string;
    result?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const TestimonialSlide: React.FC<TestimonialSlideProps> = ({
  content,
  isActive,
  theme = 'blue',
}) => {
  const themeColors = {
    blue: 'bg-gradient-to-br from-indigo-500 to-blue-600',
    green: 'bg-gradient-to-br from-teal-500 to-emerald-600',
    purple: 'bg-gradient-to-br from-purple-500 to-pink-600',
    orange: 'bg-gradient-to-br from-orange-500 to-red-600',
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
      <div className="max-w-4xl mx-auto text-white text-center">
        {(content.title ?? content.headline) && (
          <h2 className="text-3xl font-bold mb-8 animate-fade-in">{content.title ?? content.headline}</h2>
        )}
        <Quote size={48} className="text-white/30 mx-auto mb-6 animate-fade-in" />
        {(() => {
          const t = content.testimonial;
          const quote = t?.quote ?? content.quote;
          const author = t?.author ?? content.author ?? 'Business Owner';
          const subtitle = t?.role
            ? (t.company ? `${t.role} at ${t.company}` : t.role)
            : (t?.business_type ?? t?.business ?? content.business_type ?? content.business ?? '');
          const result = t?.result ?? content.result;
          const avatar = t?.avatar;

          if (!quote) {
            return <p className="text-xl text-white/70 text-center animate-fade-in">Testimonial content loading...</p>;
          }

          return (
            <>
              <blockquote
                className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed animate-fade-in"
                style={{ animationDelay: '0.2s' }}
              >
                &ldquo;{quote}&rdquo;
              </blockquote>
              {result && (
                <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <span className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 text-sm font-semibold">
                    {result}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                {avatar && (
                  <img
                    src={avatar}
                    alt={author}
                    className="w-16 h-16 rounded-full border-2 border-white"
                  />
                )}
                <div className="text-left">
                  <div className="font-semibold text-lg">{author}</div>
                  {subtitle && <div className="text-white/80">{subtitle}</div>}
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
};


