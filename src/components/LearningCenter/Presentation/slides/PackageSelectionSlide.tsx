import React, { useEffect, useState } from 'react';
import { Check, Star, Zap } from 'lucide-react';
import { apiClient } from '@/services/api';

interface Bundle {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price_cents: number;
  price: number;
  setup_fee_cents: number;
  setup_fee: number;
  features: string[];
  highlight_badge: string | null;
  sort_order: number;
}

interface PackageSelectionSlideProps {
  content: Record<string, unknown>;
  isActive: boolean;
  theme?: 'blue' | 'green' | 'purple' | 'orange';
  onAction?: (action: string, payload: Record<string, unknown>) => void;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100);
}

const THEME_ACCENT: Record<string, string> = {
  blue:   'bg-blue-600 hover:bg-blue-700',
  green:  'bg-emerald-600 hover:bg-emerald-700',
  purple: 'bg-purple-600 hover:bg-purple-700',
  orange: 'bg-orange-600 hover:bg-orange-700',
};
const THEME_BORDER: Record<string, string> = {
  blue:   'border-blue-500 ring-2 ring-blue-400',
  green:  'border-emerald-500 ring-2 ring-emerald-400',
  purple: 'border-purple-500 ring-2 ring-purple-400',
  orange: 'border-orange-500 ring-2 ring-orange-400',
};
const THEME_BADGE: Record<string, string> = {
  blue:   'bg-blue-600 text-white',
  green:  'bg-emerald-600 text-white',
  purple: 'bg-purple-600 text-white',
  orange: 'bg-orange-600 text-white',
};

export const PackageSelectionSlide: React.FC<PackageSelectionSlideProps> = ({
  content,
  isActive,
  theme = 'blue',
  onAction,
}) => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [error, setError] = useState('');

  const headline = (content.headline as string) ?? (content.title as string) ?? 'Choose Your Plan';
  const subheadline = content.subheadline as string | undefined;
  const button_text = (content.button_text as string) ?? 'Get Started';

  useEffect(() => {
    if (!isActive || bundles.length > 0) return;

    let cancelled = false;
    async function fetchBundles() {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get<{ data: Bundle[] }>('/v1/bundles');
        if (!cancelled) {
          setBundles(res.data.data);
        }
      } catch {
        if (!cancelled) {
          setError('Could not load packages. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void fetchBundles();
    return () => { cancelled = true; };
  }, [isActive, bundles.length]);

  const handleSelect = (bundle: Bundle) => {
    setSelectedSlug(bundle.slug);
    onAction?.('select_bundle', {
      bundle_id:   bundle.id,
      bundle_slug: bundle.slug,
      bundle_name: bundle.name,
      price_cents: bundle.price_cents,
      price:       bundle.price,
    });
  };

  return (
    <div
      className={`
        w-full h-full flex flex-col items-center justify-start p-6 overflow-y-auto
        bg-gradient-to-br from-slate-50 to-blue-50
        ${isActive ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-500
      `}
    >
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{headline}</h2>
        {subheadline && (
          <p className="mt-2 text-lg text-gray-600">{subheadline}</p>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm text-center py-4">{error}</p>
      )}

      {!loading && bundles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-fade-in">
          {bundles.map((bundle) => {
            const isSelected = bundle.slug === selectedSlug;
            const isPopular = bundle.highlight_badge === 'Most Popular';

            return (
              <div
                key={bundle.slug}
                className={`
                  relative flex flex-col bg-white rounded-2xl shadow-lg border-2 overflow-hidden
                  transition-all duration-200 cursor-pointer
                  ${isSelected ? THEME_BORDER[theme] : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'}
                `}
                onClick={() => handleSelect(bundle)}
              >
                {/* Badge */}
                {bundle.highlight_badge && (
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${THEME_BADGE[theme]}`}>
                    {bundle.highlight_badge === 'Most Popular' ? (
                      <span className="flex items-center gap-1"><Star size={12} />{bundle.highlight_badge}</span>
                    ) : (
                      <span className="flex items-center gap-1"><Zap size={12} />{bundle.highlight_badge}</span>
                    )}
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Plan name & tagline */}
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{bundle.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{bundle.tagline}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-gray-900">{formatPrice(bundle.price_cents)}</span>
                    <span className="text-gray-500 text-sm ml-1">/mo</span>
                    {bundle.setup_fee_cents > 0 && (
                      <p className="text-xs text-gray-400 mt-1">+{formatPrice(bundle.setup_fee_cents)} setup fee</p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 flex-1 mb-6">
                    {bundle.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleSelect(bundle); }}
                    className={`
                      w-full py-3 rounded-xl text-white font-semibold text-sm
                      transition-all duration-200 shadow-md
                      ${THEME_ACCENT[theme]}
                      ${isSelected ? 'scale-105' : ''}
                    `}
                    aria-label={`${button_text} — ${bundle.name}`}
                  >
                    {isSelected ? '✓ Selected' : button_text}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guarantee note */}
      {!loading && bundles.length > 0 && (
        <p className="mt-6 text-xs text-gray-400 text-center max-w-lg animate-fade-in">
          No long-term contracts. Cancel anytime. All plans include a 30-day satisfaction guarantee.
        </p>
      )}
    </div>
  );
};
