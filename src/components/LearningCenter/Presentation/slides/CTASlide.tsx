import React from 'react';

interface CTASlideProps {
  content: Record<string, unknown>;
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

/**
 * Resolve primary CTA from various JSON shapes:
 * - { primaryButton: { text, url } }
 * - { cta_primary: { label, action, description } }
 */
function resolveCTA(content: Record<string, unknown>): { primary: { text: string; url: string } | null; secondary: { text: string; url: string } | null } {
  // Standard shape
  const pb = content.primaryButton as Record<string, unknown> | undefined;
  const sb = content.secondaryButton as Record<string, unknown> | undefined;
  if (pb?.text) {
    return {
      primary: { text: pb.text as string, url: (pb.url as string) ?? '#' },
      secondary: sb?.text ? { text: sb.text as string, url: (sb.url as string) ?? '#' } : null,
    };
  }

  // Campaign JSON shape: cta_primary / cta_secondary
  const cp = content.cta_primary as Record<string, unknown> | undefined;
  const cs = content.cta_secondary as Record<string, unknown> | undefined;
  return {
    primary: cp ? { text: (cp.label as string) ?? 'Get Started', url: '#' } : null,
    secondary: cs ? { text: (cs.label as string) ?? 'Learn More', url: '#' } : null,
  };
}

export const CTASlide: React.FC<CTASlideProps> = ({
  content,
  isActive,
  theme = 'blue',
}) => {
  const themeColors = {
    blue: 'from-indigo-600 to-blue-700',
    green: 'from-emerald-600 to-teal-700',
    purple: 'from-purple-600 to-pink-700',
    orange: 'from-orange-600 to-red-700',
  };

  const { primary, secondary } = resolveCTA(content);
  const subheadline = (content.subheadline as string) ?? (content.subhead as string) ?? (content.time_estimate as string);
  const urgency = content.urgency as string | undefined;

  return (
    <div
      className={`
        w-full h-full flex items-center justify-center
        bg-gradient-to-br ${themeColors[theme]}
        ${isActive ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-500
      `}
      style={{
        backgroundImage: content.backgroundImage
          ? `url(${content.backgroundImage as string})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {typeof content.backgroundImage === 'string' && (
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      )}
      <div className="relative z-10 text-center px-8 max-w-3xl">
        <h2
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in"
        >
          {String(content.headline ?? '')}
        </h2>
        {subheadline && (
          <p
            className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            {subheadline}
          </p>
        )}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          <a
            href={primary?.url ?? '#'}
            className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            {primary?.text ?? 'Get Started'}
          </a>
          {secondary && (
            <a
              href={secondary.url}
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-colors"
            >
              {secondary.text}
            </a>
          )}
        </div>
        {urgency && (
          <p className="mt-6 text-yellow-300 text-sm font-medium animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {urgency}
          </p>
        )}
      </div>
    </div>
  );
};
