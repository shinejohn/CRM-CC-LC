import React from 'react';
import { Eye, CheckCircle2 } from 'lucide-react';

interface PreviewSlideProps {
  content: Record<string, unknown>;
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
}

function renderPreviewCard(preview: Record<string, unknown>, theme: string) {
  const accentColors: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  const entries = Object.entries(preview).filter(
    ([key]) => !['visual', 'placeholder_image'].includes(key)
  );

  return (
    <div className="bg-white rounded-xl p-8 shadow-xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="space-y-4">
        {entries.map(([key, value]) => {
          const label = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());

          if (typeof value === 'boolean') {
            return (
              <div key={key} className="flex items-center gap-3">
                <CheckCircle2 size={20} className={value ? 'text-green-500' : 'text-gray-300'} />
                <span className="text-gray-700 font-medium">{label}</span>
              </div>
            );
          }

          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return (
              <div key={key} className="border-l-4 border-gray-200 pl-4">
                <div className="text-sm font-semibold text-gray-500 mb-1">{label}</div>
                {Object.entries(value as Record<string, unknown>).map(([sk, sv]) => (
                  <div key={sk} className="flex justify-between py-1">
                    <span className="text-gray-600">{sk.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                    <span className="font-medium text-gray-900">{String(sv)}</span>
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-gray-500 text-sm font-medium">{label}</span>
              <span className={`font-semibold ${accentColors[theme]} text-lg`}>
                {String(value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
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

  const textColors: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  const headline = (content.headline as string) ?? (content.title as string) ?? 'Preview';
  const preview = content.preview as Record<string, unknown> | undefined;
  const note = content.note as string | undefined;
  const features = content.features as string[] | undefined;

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
        <Eye size={48} className={`mx-auto mb-4 ${textColors[theme]} animate-fade-in`} />
        <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {headline}
        </h2>

        {preview && renderPreviewCard(preview, theme)}

        {features && features.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 shadow-sm">
                <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{f}</span>
              </div>
            ))}
          </div>
        )}

        {note && (
          <div className="mt-6 p-4 bg-white/80 rounded-lg border-l-4 border-blue-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p className="text-gray-700 text-sm">{note}</p>
          </div>
        )}
      </div>
    </div>
  );
};





