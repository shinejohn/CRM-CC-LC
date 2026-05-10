import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Menu, Copy, Check, Loader2,
  Newspaper, CalendarDays, Cloud, Building2, Star,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useSaveAsset } from './useMarketingAssets';
import type { MarketingProfile } from './useMarketingProfile';

interface MenuBarWidgetProps {
  profile: MarketingProfile;
}

interface TabConfig {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
}

export function MenuBarWidget({ profile }: MenuBarWidgetProps) {
  const [tabs, setTabs] = useState<TabConfig[]>([
    { key: 'news', label: 'News', icon: Newspaper, enabled: true },
    { key: 'events', label: 'Events', icon: CalendarDays, enabled: true },
    { key: 'weather', label: 'Weather', icon: Cloud, enabled: true },
    { key: 'downtown', label: 'Downtown', icon: Building2, enabled: true },
    { key: 'reviews', label: 'Reviews', icon: Star, enabled: false },
  ]);
  const [activePreviewTab, setActivePreviewTab] = useState('news');
  const [embedCode, setEmbedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const saveAsset = useSaveAsset();

  const toggleTab = (key: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.key === key ? { ...t, enabled: !t.enabled } : t)),
    );
  };

  const enabledTabs = tabs.filter((t) => t.enabled);

  const handlePublish = useCallback(async () => {
    try {
      const result = await saveAsset.mutateAsync({
        type: 'menu-bar',
        name: `${profile.business_name} Menu Bar`,
        config: {
          enabled_tabs: enabledTabs.map((t) => t.key),
          community_slug: profile.community.slug,
        },
      });
      const code = `<script src="${profile.alphasite_url}/embed/menubar/${result.id}.js" async></script>\n<div id="fib-menubar"></div>`;
      setEmbedCode(code);
    } catch {
      // Mutation error handled by TanStack Query
    }
  }, [saveAsset, enabledTabs, profile]);

  const handleCopy = useCallback(async () => {
    if (!embedCode) return;
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [embedCode]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--nexus-text-primary)]">
          Menu Bar
        </h1>
        <p className="text-sm text-[var(--nexus-text-secondary)] mt-1">
          A horizontal navigation bar with dropdown panels for your website.
        </p>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-[var(--nexus-card-border)] overflow-hidden shadow-sm">
        {/* Dark nav bar */}
        <nav className="bg-gray-900 px-4 py-2 flex items-center gap-1" role="navigation" aria-label="Menu bar preview">
          <span className="text-white text-sm font-semibold mr-4 shrink-0">
            {profile.community.name}
          </span>
          <div className="flex items-center gap-0.5 overflow-x-auto">
            {enabledTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activePreviewTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActivePreviewTab(tab.key)}
                  aria-label={`Preview ${tab.label} tab`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Dropdown panel preview */}
        <div className="bg-gray-800 border-t border-gray-700 px-6 py-4 min-h-[120px]">
          <DropdownPreview
            tabKey={activePreviewTab}
            profile={profile}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tab toggles */}
        <div className="rounded-xl border border-[var(--nexus-card-border)] p-4 bg-[var(--nexus-bg-secondary)] space-y-3">
          <h3 className="text-sm font-semibold text-[var(--nexus-text-primary)]">
            Visible Tabs
          </h3>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <div key={tab.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
                  <span className="text-sm text-[var(--nexus-text-primary)]">{tab.label}</span>
                </div>
                <Switch
                  checked={tab.enabled}
                  onCheckedChange={() => toggleTab(tab.key)}
                  aria-label={`Toggle ${tab.label} tab visibility`}
                />
              </div>
            );
          })}
        </div>

        {/* Publish */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handlePublish}
            disabled={saveAsset.isPending || enabledTabs.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[var(--nexus-accent-primary)] hover:opacity-90 transition-opacity disabled:opacity-60"
            aria-label="Publish menu bar and get embed code"
          >
            {saveAsset.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
            Publish &amp; Get Embed Code
          </button>

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

function DropdownPreview({
  tabKey,
  profile,
}: {
  tabKey: string;
  profile: MarketingProfile;
}) {
  const weather = profile.community.weather;
  const news = profile.community.news ?? [];
  const events = profile.community.events ?? [];

  switch (tabKey) {
    case 'news':
      return (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Latest News
          </h4>
          {news.length > 0 ? (
            news.slice(0, 3).map((item) => (
              <p key={item.id} className="text-sm text-gray-200 leading-snug">
                {item.title}
              </p>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No news stories available</p>
          )}
        </div>
      );
    case 'events':
      return (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Upcoming Events
          </h4>
          {events.length > 0 ? (
            events.slice(0, 3).map((ev) => (
              <div key={ev.id} className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="text-sm text-gray-200">{ev.title}</span>
                <span className="text-xs text-gray-500">{ev.date}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">No upcoming events</p>
          )}
        </div>
      );
    case 'weather':
      return weather ? (
        <div className="flex items-center gap-4">
          <Cloud className="w-10 h-10 text-blue-400" />
          <div>
            <p className="text-2xl font-bold text-white">{weather.temp}&deg;F</p>
            <p className="text-sm text-gray-400">{weather.condition}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">Weather data unavailable</p>
      );
    case 'downtown':
      return (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Downtown {profile.community.name}
          </h4>
          <p className="text-sm text-gray-300">
            Explore shops, restaurants, and attractions in downtown {profile.community.name}.
          </p>
        </div>
      );
    case 'reviews':
      return (
        <p className="text-sm text-gray-500 italic py-4 text-center">
          Customer reviews will appear here.
        </p>
      );
    default:
      return null;
  }
}
