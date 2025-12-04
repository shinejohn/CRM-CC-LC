import React from 'react';
import { Quote } from 'lucide-react';

interface TestimonialSlideProps {
  content: {
    title?: string;
    testimonial: {
      quote: string;
      author: string;
      role: string;
      company: string;
      avatar?: string;
    };
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
        {content.title && (
          <h2 className="text-3xl font-bold mb-8 animate-fade-in">{content.title}</h2>
        )}
        <Quote size={48} className="text-white/30 mx-auto mb-6 animate-fade-in" />
        <blockquote
          className="text-2xl md:text-3xl font-medium mb-8 leading-relaxed animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          "{content.testimonial.quote}"
        </blockquote>
        <div className="flex items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {content.testimonial.avatar && (
            <img
              src={content.testimonial.avatar}
              alt={content.testimonial.author}
              className="w-16 h-16 rounded-full border-2 border-white"
            />
          )}
          <div className="text-left">
            <div className="font-semibold text-lg">{content.testimonial.author}</div>
            <div className="text-white/80">
              {content.testimonial.role} at {content.testimonial.company}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


