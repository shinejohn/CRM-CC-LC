import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Newspaper, CalendarDays, Cloud, Building2, Sparkles,
  Copy, Check, Loader2, ArrowLeftRight,
} from 'lucide-react';
import { apiClient } from '@/services/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type ContentCardType = 'news' | 'events' | 'weather' | 'downtown' | 'spotlight';
type PostVariant = 'smb_self_post' | 'syndication_sponsored';

interface ContentCard {
  id: string;
  type: ContentCardType;
  variant: PostVariant;
  headline: string;
  body: string;
  caption: string;
  image_url: string | null;
  hashtags: string;
  community_name: string;
  business_name: string;
  created_at: string;
}

const CONTENT_TYPES: Array<{
  key: ContentCardType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'news', label: 'News', icon: Newspaper },
  { key: 'events', label: 'Events', icon: CalendarDays },
  { key: 'weather', label: 'Weather', icon: Cloud },
  { key: 'downtown', label: 'Downtown', icon: Building2 },
  { key: 'spotlight', label: 'Spotlight', icon: Sparkles },
];

async function fetchTodayCard(): Promise<ContentCard> {
  const { data } = await apiClient.get<ContentCard>('/content-cards/today');
  return data;
}

async function fetchPreviewCard(type: ContentCardType): Promise<ContentCard> {
  const { data } = await apiClient.get<ContentCard>(`/content-cards/preview/${type}`);
  return data;
}

export function ContentCardsPage() {
  const [selectedType, setSelectedType] = useState<ContentCardType>('news');
  const [variant, setVariant] = useState<PostVariant>('smb_self_post');
  const [copiedCaption, setCopiedCaption] = useState(false);

  const todayQuery = useQuery({
    queryKey: ['content-cards', 'today'],
    queryFn: fetchTodayCard,
    staleTime: 5 * 60 * 1000,
  });

  const previewQuery = useQuery({
    queryKey: ['content-cards', 'preview', selectedType],
    queryFn: () => fetchPreviewCard(selectedType),
    staleTime: 5 * 60 * 1000,
  });

  const activeCard = previewQuery.data ?? todayQuery.data;
  const isLoading = previewQuery.isLoading || todayQuery.isLoading;

  const handleCopyCaption = useCallback(async () => {
    if (!activeCard) return;
    await navigator.clipboard.writeText(`${activeCard.caption}\n\n${activeCard.hashtags}`);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  }, [activeCard]);

  const toggleVariant = () => {
    setVariant((prev) =>
      prev === 'smb_self_post' ? 'syndication_sponsored' : 'smb_self_post',
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--nexus-text-primary)]">
          Content Cards
        </h1>
        <p className="text-sm text-[var(--nexus-text-secondary)] mt-1">
          Today&apos;s ready-to-post content cards for your business.
        </p>
      </div>

      {/* Content type selector */}
      <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as ContentCardType)}>
        <TabsList>
          {CONTENT_TYPES.map((ct) => {
            const Icon = ct.icon;
            return (
              <TabsTrigger key={ct.key} value={ct.key} className="flex items-center gap-1.5 text-sm">
                <Icon className="w-3.5 h-3.5" />
                {ct.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Variant toggle */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={toggleVariant}
            aria-label="Toggle between self-post and syndication variant"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--nexus-card-border)] text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)] transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            {variant === 'smb_self_post' ? 'SMB Self-Post' : 'Syndication / Sponsored'}
          </button>
          <span className="text-[10px] text-[var(--nexus-text-tertiary)] uppercase tracking-wider">
            {variant === 'smb_self_post'
              ? 'Posted from the business page'
              : 'Posted as sponsored content'}
          </span>
        </div>

        {/* Content */}
        {CONTENT_TYPES.map((ct) => (
          <TabsContent key={ct.key} value={ct.key} className="mt-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--nexus-accent-primary)]" />
              </div>
            ) : activeCard ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeCard.id}-${variant}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* Card preview */}
                  <div className="rounded-xl border border-[var(--nexus-card-border)] overflow-hidden shadow-sm bg-white dark:bg-slate-900">
                    {/* Card image area */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center relative">
                      {activeCard.image_url ? (
                        <img
                          src={activeCard.image_url}
                          alt={`Content card: ${activeCard.headline}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ct.icon className="w-16 h-16 text-[var(--nexus-text-tertiary)] opacity-30" />
                      )}
                      {/* Type badge */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/50 text-white backdrop-blur-sm">
                        {ct.label}
                      </span>
                      {/* Variant badge */}
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/80 dark:bg-slate-900/80 text-[var(--nexus-text-secondary)] backdrop-blur-sm">
                        {variant === 'smb_self_post' ? 'Self-Post' : 'Sponsored'}
                      </span>
                    </div>

                    {/* Card body */}
                    <div className="p-4 space-y-2">
                      <h3 className="text-base font-bold text-[var(--nexus-text-primary)]">
                        {activeCard.headline}
                      </h3>
                      <p className="text-sm text-[var(--nexus-text-secondary)] leading-relaxed">
                        {activeCard.body}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[var(--nexus-text-tertiary)] pt-1">
                        <span>{activeCard.business_name}</span>
                        <span>&middot;</span>
                        <span>{activeCard.community_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Caption panel */}
                  <div className="space-y-4">
                    <div className="rounded-xl border border-[var(--nexus-card-border)] p-4 bg-[var(--nexus-bg-secondary)] space-y-3">
                      <h3 className="text-sm font-semibold text-[var(--nexus-text-primary)]">
                        Caption
                      </h3>
                      <p className="text-sm text-[var(--nexus-text-primary)] whitespace-pre-wrap leading-relaxed">
                        {activeCard.caption}
                      </p>
                      {activeCard.hashtags && (
                        <p className="text-xs text-[var(--nexus-accent-primary)] font-medium">
                          {activeCard.hashtags}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCaption}
                      aria-label="Copy caption and hashtags to clipboard"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[var(--nexus-accent-primary)] hover:opacity-90 transition-opacity"
                    >
                      {copiedCaption ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Caption
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="text-center py-16 text-[var(--nexus-text-tertiary)]">
                No content card available for this type today.
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
