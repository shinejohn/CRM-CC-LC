import React from 'react';
import { CheckCircle2, TrendingUp, Lightbulb } from 'lucide-react';

interface ConceptSlideProps {
  content: {
    headline: string;
    stats?: Array<{ value: string; label: string }>;
    points?: string[];
    comparison?: {
      before: string;
      after: string;
    };
    key_point?: string;
    elements?: Array<{ icon?: string; label: string; desc: string }>;
    three_pillars?: Array<{ title: string; desc: string }>;
    visual?: string;
  };
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

export const ConceptSlide: React.FC<ConceptSlideProps> = ({
  content,
  isActive,
  theme = 'blue',
}) => {
  const themeColors = {
    blue: 'bg-gradient-to-br from-indigo-500 to-blue-600',
    green: 'bg-gradient-to-br from-teal-500 to-emerald-600',
    purple: 'bg-gradient-to-br from-pink-500 to-purple-600',
    orange: 'bg-gradient-to-br from-red-500 to-orange-600',
  };

  const lightThemeColors = {
    blue: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    green: 'bg-gradient-to-br from-emerald-50 to-teal-100',
    purple: 'bg-gradient-to-br from-purple-50 to-pink-100',
    orange: 'bg-gradient-to-br from-orange-50 to-red-100',
  };

  const textColors = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  const accentColors = {
    blue: 'bg-blue-600 text-white',
    green: 'bg-emerald-600 text-white',
    purple: 'bg-purple-600 text-white',
    orange: 'bg-orange-600 text-white',
  };

  // Determine if we should use dark or light theme based on content type
  const useDarkTheme = !content.stats && !content.elements && !content.three_pillars;

  return (
    <div
      className={`
        w-full h-full flex items-center justify-center p-12
        ${useDarkTheme ? themeColors[theme] : lightThemeColors[theme]}
        ${isActive ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-500
      `}
    >
      <div className="max-w-6xl mx-auto w-full">
        <h2
          className={`text-4xl md:text-5xl font-bold mb-8 text-center animate-fade-in ${
            useDarkTheme ? 'text-white' : 'text-gray-900'
          }`}
        >
          {content.headline}
        </h2>

        {/* Stats Display */}
        {content.stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {content.stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-lg text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`text-5xl font-bold ${textColors[theme]} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-700 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Points List */}
        {content.points && (
          <ul className="space-y-4 max-w-3xl mx-auto mt-8">
            {content.points.map((point, index) => (
              <li
                key={index}
                className={`flex items-start gap-3 animate-fade-in ${
                  useDarkTheme ? 'text-white' : 'text-gray-800'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CheckCircle2
                  size={24}
                  className={`mt-0.5 flex-shrink-0 ${
                    useDarkTheme ? 'text-green-300' : textColors[theme]
                  }`}
                />
                <span className="text-lg md:text-xl">{point}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Comparison Display */}
        {content.comparison && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-8">
            <div
              className={`bg-white rounded-lg p-6 shadow-lg animate-fade-in ${
                useDarkTheme ? 'bg-opacity-20 backdrop-blur-sm' : ''
              }`}
            >
              <div className={`text-sm font-semibold mb-2 ${textColors[theme]}`}>
                Before
              </div>
              <p className={useDarkTheme ? 'text-white' : 'text-gray-700'}>
                {content.comparison.before}
              </p>
            </div>
            <div
              className={`bg-white rounded-lg p-6 shadow-lg animate-fade-in ${
                useDarkTheme ? 'bg-opacity-20 backdrop-blur-sm' : ''
              }`}
              style={{ animationDelay: '0.2s' }}
            >
              <div className={`text-sm font-semibold mb-2 ${textColors[theme]}`}>
                After
              </div>
              <p className={useDarkTheme ? 'text-white' : 'text-gray-700'}>
                {content.comparison.after}
              </p>
            </div>
          </div>
        )}

        {/* Key Point */}
        {content.key_point && (
          <div
            className={`max-w-3xl mx-auto mt-8 p-6 rounded-lg animate-fade-in ${
              useDarkTheme ? 'bg-white bg-opacity-20 backdrop-blur-sm' : accentColors[theme]
            }`}
            style={{ animationDelay: '0.3s' }}
          >
            <div className="flex items-center gap-3">
              <Lightbulb
                size={24}
                className={useDarkTheme ? 'text-yellow-300' : 'text-white'}
              />
              <p
                className={`text-lg md:text-xl font-semibold ${
                  useDarkTheme ? 'text-white' : 'text-white'
                }`}
              >
                {content.key_point}
              </p>
            </div>
          </div>
        )}

        {/* Elements Grid */}
        {content.elements && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {content.elements.map((element, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg p-6 shadow-lg text-center animate-fade-in ${
                  useDarkTheme ? 'bg-opacity-20 backdrop-blur-sm' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {element.icon && (
                  <div className={`text-3xl mb-3 ${textColors[theme]}`}>
                    {element.icon}
                  </div>
                )}
                <h3
                  className={`font-bold text-lg mb-2 ${
                    useDarkTheme ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {element.label}
                </h3>
                <p className={useDarkTheme ? 'text-white/90' : 'text-gray-600'}>
                  {element.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Three Pillars */}
        {content.three_pillars && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">
            {content.three_pillars.map((pillar, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg p-6 shadow-lg animate-fade-in ${
                  useDarkTheme ? 'bg-opacity-20 backdrop-blur-sm' : ''
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3
                  className={`font-bold text-xl mb-3 ${
                    useDarkTheme ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {pillar.title}
                </h3>
                <p className={useDarkTheme ? 'text-white/90' : 'text-gray-600'}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};





