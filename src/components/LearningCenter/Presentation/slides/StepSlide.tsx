import React from 'react';
import { CheckCircle2, ArrowRight, Clock } from 'lucide-react';

interface StepSlideProps {
  content: {
    headline: string;
    location?: string;
    key_fields?: Array<{ field: string; tip: string }>;
    content_types?: Array<{ type: string; use_for: string; time?: string }>;
    key_metrics?: Array<{ metric: string; what_it_means: string }>;
    steps?: Array<{ num: number; action: string; time?: string }>;
    management_tasks?: string[];
    options?: string[];
    recommendation?: string;
    completion_indicator?: string;
    visual?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const StepSlide: React.FC<StepSlideProps> = ({
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

  const borderColors = {
    blue: 'border-blue-600',
    green: 'border-emerald-600',
    purple: 'border-purple-600',
    orange: 'border-orange-600',
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
      <div className="max-w-6xl mx-auto w-full">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center animate-fade-in">
          {content.headline}
        </h2>

        {content.location && (
          <p className="text-xl text-gray-700 mb-8 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {content.location}
          </p>
        )}

        {/* Key Fields */}
        {content.key_fields && (
          <div className="space-y-4 max-w-3xl mx-auto mt-8">
            {content.key_fields.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-md animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{item.field}</h3>
                    <p className="text-gray-600">{item.tip}</p>
                  </div>
                  <CheckCircle2 size={24} className={`${accentColors[theme]} rounded-full flex-shrink-0`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Content Types */}
        {content.content_types && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8">
            {content.content_types.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-md border-l-4 animate-fade-in"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  borderLeftColor: theme === 'blue' ? '#2563eb' : theme === 'green' ? '#059669' : theme === 'purple' ? '#9333ea' : '#ea580c',
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{item.type}</h3>
                  {item.time && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>{item.time}</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600">{item.use_for}</p>
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        {content.steps && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto mt-8">
            {content.steps.map((step, index) => (
              <React.Fragment key={index}>
                <div
                  className="flex-1 text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`w-16 h-16 ${accentColors[theme]} rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4`}
                  >
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.action}</h3>
                  {step.time && (
                    <p className="text-gray-600 flex items-center justify-center gap-1">
                      <Clock size={14} />
                      {step.time}
                    </p>
                  )}
                </div>
                {index < content.steps.length - 1 && (
                  <ArrowRight size={24} className="text-gray-400 flex-shrink-0 hidden md:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Key Metrics */}
        {content.key_metrics && (
          <div className="space-y-4 max-w-3xl mx-auto mt-8">
            {content.key_metrics.map((metric, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-md animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="font-bold text-lg text-gray-900 mb-2">{metric.metric}</h3>
                <p className="text-gray-600">{metric.what_it_means}</p>
              </div>
            ))}
          </div>
        )}

        {/* Management Tasks */}
        {content.management_tasks && (
          <ul className="space-y-3 max-w-3xl mx-auto mt-8">
            {content.management_tasks.map((task, index) => (
              <li
                key={index}
                className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-md animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CheckCircle2 size={20} className={`${accentColors[theme]} rounded-full mt-0.5 flex-shrink-0`} />
                <span className="text-gray-800">{task}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Options */}
        {content.options && (
          <ul className="space-y-3 max-w-3xl mx-auto mt-8">
            {content.options.map((option, index) => (
              <li
                key={index}
                className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-md animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-2 h-2 rounded-full ${accentColors[theme]} mt-2 flex-shrink-0`} />
                <span className="text-gray-800">{option}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Recommendation */}
        {content.recommendation && (
          <div
            className={`max-w-3xl mx-auto mt-8 p-6 rounded-lg border-2 ${borderColors[theme]} ${accentColors[theme]} animate-fade-in`}
            style={{ animationDelay: '0.3s' }}
          >
            <p className="text-white font-semibold text-lg">{content.recommendation}</p>
          </div>
        )}

        {/* Completion Indicator */}
        {content.completion_indicator && (
          <div className="max-w-3xl mx-auto mt-8 p-4 bg-white rounded-lg shadow-md animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p className="text-gray-700 text-center font-medium">{content.completion_indicator}</p>
          </div>
        )}
      </div>
    </div>
  );
};





