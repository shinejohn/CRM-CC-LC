import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Menu, Mail, Image, Share2, Palette,
  Loader2,
} from 'lucide-react';
import { useMarketingProfile } from './useMarketingProfile';
import { WebsiteWidget } from './WebsiteWidget';
import { MenuBarWidget } from './MenuBarWidget';
import { EmailSignature } from './EmailSignature';
import { SocialHeaders } from './SocialHeaders';
import { SocialPosts } from './SocialPosts';
import { BrandedImage } from './BrandedImage';
import type { MarketingProfile } from './useMarketingProfile';

type ToolSlug =
  | 'website-widget'
  | 'menu-bar'
  | 'email-signature'
  | 'social-headers'
  | 'social-posts'
  | 'branded-image';

interface ToolDefinition {
  slug: ToolSlug;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: 'Widgets' | 'Images';
}

const TOOLS: ToolDefinition[] = [
  { slug: 'website-widget', label: 'Website Widget', icon: Globe, group: 'Widgets' },
  { slug: 'menu-bar', label: 'Menu Bar', icon: Menu, group: 'Widgets' },
  { slug: 'email-signature', label: 'Email Signature', icon: Mail, group: 'Images' },
  { slug: 'social-headers', label: 'Social Headers', icon: Image, group: 'Images' },
  { slug: 'social-posts', label: 'Social Posts', icon: Share2, group: 'Images' },
  { slug: 'branded-image', label: 'Branded Image', icon: Palette, group: 'Images' },
];

const VALID_SLUGS = new Set<string>(TOOLS.map((t) => t.slug));

function isValidSlug(s: string | undefined): s is ToolSlug {
  return typeof s === 'string' && VALID_SLUGS.has(s);
}

function ToolComponent({
  slug,
  profile,
}: {
  slug: ToolSlug;
  profile: MarketingProfile;
}) {
  switch (slug) {
    case 'website-widget':
      return <WebsiteWidget profile={profile} />;
    case 'menu-bar':
      return <MenuBarWidget profile={profile} />;
    case 'email-signature':
      return <EmailSignature profile={profile} />;
    case 'social-headers':
      return <SocialHeaders profile={profile} />;
    case 'social-posts':
      return <SocialPosts profile={profile} />;
    case 'branded-image':
      return <BrandedImage profile={profile} />;
  }
}

export function MarketingKitPage() {
  const { tool } = useParams<{ tool?: string }>();
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useMarketingProfile();

  const [activeTool, setActiveTool] = useState<ToolSlug>(
    isValidSlug(tool) ? tool : 'website-widget',
  );

  useEffect(() => {
    if (isValidSlug(tool) && tool !== activeTool) {
      setActiveTool(tool);
    }
  }, [tool, activeTool]);

  const handleSelectTool = (slug: ToolSlug) => {
    setActiveTool(slug);
    navigate(`/command-center/attract/marketing-kit/${slug}`, { replace: true });
  };

  const groups = ['Widgets', 'Images'] as const;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--nexus-accent-primary)]" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 gap-4">
        <p className="text-[var(--nexus-text-secondary)]">
          Unable to load your marketing profile.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--nexus-accent-primary)] text-white hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)] overflow-y-auto">
        <div className="px-4 py-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--nexus-text-tertiary)] mb-4">
            Marketing Kit
          </h2>
          {groups.map((group) => (
            <div key={group} className="mb-5">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[var(--nexus-text-tertiary)] mb-2 px-2">
                {group}
              </h3>
              <div className="space-y-1">
                {TOOLS.filter((t) => t.group === group).map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTool === t.slug;
                  return (
                    <button
                      key={t.slug}
                      type="button"
                      onClick={() => handleSelectTool(t.slug)}
                      aria-label={`Select ${t.label} tool`}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[var(--nexus-accent-primary)] text-white'
                          : 'text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-primary)] hover:text-[var(--nexus-text-primary)]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTool}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <ToolComponent slug={activeTool} profile={profile} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
