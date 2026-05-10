import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Cloud, Newspaper, CalendarDays,
  Copy, Check, ExternalLink, Loader2,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useSaveAsset } from './useMarketingAssets';
import type { MarketingProfile } from './useMarketingProfile';

interface WebsiteWidgetProps {
  profile: MarketingProfile;
}

export function WebsiteWidget({ profile }: WebsiteWidgetProps) {
  const [accentColor, setAccentColor] = useState(profile.accent_color || '#4f46e5');
  const [promoText, setPromoText] = useState('Check out our latest specials!');
  const [embedCode, setEmbedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const saveAsset = useSaveAsset();

  const handlePublish = useCallback(async () => {
    try {
      const result = await saveAsset.mutateAsync({
        type: 'website-widget',
        name: `${profile.business_name} Community Widget`,
        config: {
          accent_color: accentColor,
          promo_text: promoText,
          community_slug: profile.community.slug,
        },
      });
      const code = `<script src="${profile.alphasite_url}/embed/widget/${result.id}.js" async></script>`;
      setEmbedCode(code);
    } catch {
      // Mutation error handled by TanStack Query
    }
  }, [saveAsset, accentColor, promoText, profile]);

  const handleCopy = useCallback(async () => {
    if (!embedCode) return;
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [embedCode]);

  const weather = profile.community.weather;
  const news = profile.community.news ?? [];
  const events = profile.community.events ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--nexus-text-primary)]">
          Website Widget
        </h1>
        <p className="text-sm text-[var(--nexus-text-secondary)] mt-1">
          An embeddable community widget for your website showing weather, news, and events.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="xl:col-span-2">
          <div
            className="rounded-xl border border-[var(--nexus-card-border)] overflow-hidden shadow-sm"
            style={{ maxWidth: 480 }}
          >
            {/* Widget header */}
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ backgroundColor: accentColor }}
            >
              <Globe className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">
                {profile.community.name}
              </span>
            </div>

            {/* Tab content */}
            <Tabs defaultValue="community" className="bg-white dark:bg-slate-900">
              <TabsList className="w-full rounded-none justify-start px-2 pt-1">
                <TabsTrigger value="community" className="flex items-center gap-1.5 text-xs">
                  <Cloud className="w-3.5 h-3.5" />
                  Community
                </TabsTrigger>
                <TabsTrigger value="promos" className="flex items-center gap-1.5 text-xs">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Promos
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-1.5 text-xs">
                  <Newspaper className="w-3.5 h-3.5" />
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="community" className="p-4 space-y-4">
                {/* Weather */}
                {weather && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <Cloud className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-lg font-bold text-[var(--nexus-text-primary)]">
                        {weather.temp}&deg;F
                      </p>
                      <p className="text-xs text-[var(--nexus-text-secondary)]">
                        {weather.condition}
                      </p>
                    </div>
                  </div>
                )}

                {/* News */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--nexus-text-tertiary)] mb-2">
                    Local News
                  </h4>
                  {news.length > 0 ? (
                    <ul className="space-y-2">
                      {news.slice(0, 3).map((item) => (
                        <li
                          key={item.id}
                          className="text-sm text-[var(--nexus-text-primary)] leading-snug"
                        >
                          {item.title}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[var(--nexus-text-tertiary)] italic">
                      No news available
                    </p>
                  )}
                </div>

                {/* Events */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--nexus-text-tertiary)] mb-2">
                    Upcoming Events
                  </h4>
                  {events.length > 0 ? (
                    <ul className="space-y-2">
                      {events.slice(0, 3).map((ev) => (
                        <li key={ev.id} className="flex items-start gap-2">
                          <CalendarDays className="w-4 h-4 text-[var(--nexus-accent-primary)] mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-[var(--nexus-text-primary)]">
                              {ev.title}
                            </p>
                            <p className="text-xs text-[var(--nexus-text-secondary)]">
                              {ev.date} &middot; {ev.location}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[var(--nexus-text-tertiary)] italic">
                      No upcoming events
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="promos" className="p-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-[var(--nexus-card-border)]">
                  <ExternalLink className="w-5 h-5 shrink-0" style={{ color: accentColor }} />
                  <p className="text-sm text-[var(--nexus-text-primary)]">{promoText}</p>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="p-4">
                <p className="text-xs text-[var(--nexus-text-tertiary)] italic text-center py-6">
                  Customer reviews will appear here once published.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          <div className="rounded-xl border border-[var(--nexus-card-border)] p-4 space-y-4 bg-[var(--nexus-bg-secondary)]">
            <h3 className="text-sm font-semibold text-[var(--nexus-text-primary)]">
              Customization
            </h3>

            <div>
              <label
                htmlFor="widget-accent-color"
                className="block text-xs font-medium text-[var(--nexus-text-secondary)] mb-1"
              >
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="widget-accent-color"
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-md border border-[var(--nexus-card-border)] cursor-pointer"
                  aria-label="Select accent color"
                />
                <span className="text-xs text-[var(--nexus-text-tertiary)] font-mono">
                  {accentColor}
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="widget-promo-text"
                className="block text-xs font-medium text-[var(--nexus-text-secondary)] mb-1"
              >
                Promo Text
              </label>
              <Input
                id="widget-promo-text"
                value={promoText}
                onChange={(e) => setPromoText(e.target.value)}
                placeholder="Enter promotional text..."
                className="text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handlePublish}
            disabled={saveAsset.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: accentColor }}
            aria-label="Publish widget and get embed code"
          >
            {saveAsset.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
            Publish &amp; Get Embed Code
          </button>

          {/* Embed code output */}
          {embedCode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)] p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--nexus-text-secondary)]">
                  Embed Code
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy embed code to clipboard"
                  className="flex items-center gap-1 text-xs text-[var(--nexus-accent-primary)] hover:underline"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
                {embedCode}
              </pre>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
