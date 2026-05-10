import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Calendar,
  Users,
  Handshake,
  Copy,
  CheckCircle2,
  Plus,
  Trash2,
  FileText,
  Megaphone,
  CalendarDays,
  Tag,
  BarChart3,
  MessageCircle,
  Video,
  Home,
  Mail,
  MessageSquare,
  Globe,
  Camera,
  Award,
  TrendingUp,
  Send,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader, DataCard, TabNav } from '@/components/shared';
import {
  useSyndicationDashboard,
  useSyndicationQueue,
  useSyndicationCommunities,
  useSyndicationSponsors,
  useSyndicationEarnings,
  useRegisterPartner,
  useAddCommunity,
  useRemoveCommunity,
  useMarkPosted,
} from './useSyndicationDashboard';
import type {
  CommunityPlatform,
  ContentType,
  SyndicationTier,
  AddCommunityPayload,
  QueueCard,
  SyndicationCommunity,
  SyndicationSponsor,
  EarningsMonth,
} from './useSyndicationDashboard';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type SectionId = 'overview' | 'content' | 'communities' | 'sponsors' | 'performance';

const SECTION_TABS: { id: SectionId; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'content', label: "Today's Content", icon: FileText },
  { id: 'communities', label: 'My Communities', icon: Users },
  { id: 'sponsors', label: 'My Sponsors', icon: Handshake },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
];

const TIER_CONFIG: Record<SyndicationTier['name'], { label: string; pct: number; color: string }> = {
  bronze: { label: 'Bronze', pct: 20, color: 'bg-amber-600' },
  silver: { label: 'Silver', pct: 25, color: 'bg-gray-400' },
  gold: { label: 'Gold', pct: 30, color: 'bg-yellow-400' },
  platinum: { label: 'Platinum', pct: 35, color: 'bg-cyan-300' },
};

const TIER_ORDER: SyndicationTier['name'][] = ['bronze', 'silver', 'gold', 'platinum'];

const PLATFORM_ICONS: Record<CommunityPlatform, LucideIcon> = {
  facebook_group: Users,
  facebook_page: Users,
  instagram: Camera,
  twitter: MessageCircle,
  tiktok: Video,
  nextdoor: Home,
  newsletter: Mail,
  whatsapp: MessageSquare,
  telegram: MessageSquare,
  reddit: Globe,
  other: Globe,
};

const CONTENT_TYPE_CONFIG: Record<ContentType, { label: string; icon: LucideIcon }> = {
  sponsored_post: { label: 'Sponsored Post', icon: Megaphone },
  article: { label: 'Article', icon: FileText },
  event: { label: 'Event', icon: CalendarDays },
  deal: { label: 'Deal', icon: Tag },
  poll: { label: 'Poll', icon: BarChart3 },
  community_update: { label: 'Community Update', icon: Users },
};

const PLATFORM_OPTIONS: { value: CommunityPlatform; label: string }[] = [
  { value: 'facebook_group', label: 'Facebook Group' },
  { value: 'facebook_page', label: 'Facebook Page' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'nextdoor', label: 'Nextdoor' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'other', label: 'Other' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-xl border border-[var(--nexus-card-border)] bg-[var(--nexus-card-bg)] p-5 shadow-[var(--nexus-card-shadow)]"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-[var(--nexus-bg-secondary)] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[var(--nexus-accent-primary)]" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--nexus-text-tertiary)]">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-[var(--nexus-text-primary)]">{value}</p>
    </motion.div>
  );
}

function TierProgress({ currentTier }: { currentTier: SyndicationTier['name'] }) {
  const activeIdx = TIER_ORDER.indexOf(currentTier);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <DataCard title="Partner Tier" icon={Award} subtitle="Revenue share increases as you grow">
        <div className="space-y-4">
          <div className="flex rounded-lg overflow-hidden h-3">
            {TIER_ORDER.map((tier, idx) => {
              const cfg = TIER_CONFIG[tier];
              const isActive = idx <= activeIdx;
              return (
                <div
                  key={tier}
                  className={`flex-1 ${isActive ? cfg.color : 'bg-[var(--nexus-bg-tertiary)]'} ${
                    idx > 0 ? 'ml-0.5' : ''
                  } transition-colors`}
                />
              );
            })}
          </div>
          <div className="flex justify-between">
            {TIER_ORDER.map((tier) => {
              const cfg = TIER_CONFIG[tier];
              const isCurrent = tier === currentTier;
              return (
                <div key={tier} className="text-center flex-1">
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-[var(--nexus-accent-primary)]'
                        : 'text-[var(--nexus-text-tertiary)]'
                    }`}
                  >
                    {cfg.label}
                  </p>
                  <p
                    className={`text-xs ${
                      isCurrent
                        ? 'text-[var(--nexus-text-primary)] font-bold'
                        : 'text-[var(--nexus-text-tertiary)]'
                    }`}
                  >
                    {cfg.pct}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </DataCard>
    </motion.div>
  );
}

function EarningsTable({ rows }: { rows: EarningsMonth[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-[var(--nexus-text-tertiary)] py-4 text-center">
        No earnings history yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--nexus-divider)]">
            <th className="text-left py-2 text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider">
              Month
            </th>
            <th className="text-right py-2 text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider">
              Posts
            </th>
            <th className="text-right py-2 text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider">
              Clicks
            </th>
            <th className="text-right py-2 text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider">
              Earned
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.month} className="border-b border-[var(--nexus-divider)] last:border-0">
              <td className="py-3 text-[var(--nexus-text-primary)] font-medium">{row.month}</td>
              <td className="py-3 text-right text-[var(--nexus-text-secondary)]">{row.posts}</td>
              <td className="py-3 text-right text-[var(--nexus-text-secondary)]">{row.clicks}</td>
              <td className="py-3 text-right font-semibold text-[var(--nexus-text-primary)]">
                {formatCurrency(row.earned)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Overview
// ---------------------------------------------------------------------------

function OverviewSection() {
  const dashboardQuery = useSyndicationDashboard();
  const partner = dashboardQuery.data?.partner;
  const history = dashboardQuery.data?.earnings_history ?? [];

  if (dashboardQuery.isLoading) {
    return <SectionSkeleton />;
  }

  if (!partner) {
    return (
      <p className="text-sm text-[var(--nexus-text-tertiary)] py-8 text-center">
        Unable to load overview data.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Earned" value={formatCurrency(partner.total_earned)} icon={DollarSign} delay={0} />
        <StatCard label="This Month" value={formatCurrency(partner.this_month_earned)} icon={Calendar} delay={0.05} />
        <StatCard label="Communities" value={String(partner.community_count)} icon={Users} delay={0.1} />
        <StatCard label="Active Sponsors" value={String(partner.active_sponsor_count)} icon={Handshake} delay={0.15} />
      </div>

      <TierProgress currentTier={partner.tier.name} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <DataCard title="Earnings History" icon={DollarSign}>
          <EarningsTable rows={history} />
        </DataCard>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Today's Content
// ---------------------------------------------------------------------------

function ContentCard({ card }: { card: QueueCard }) {
  const markPosted = useMarkPosted();
  const [copied, setCopied] = useState(false);
  const typeConfig = CONTENT_TYPE_CONFIG[card.content_type] ?? CONTENT_TYPE_CONFIG.article;
  const TypeIcon = typeConfig.icon;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(card.caption_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API may fail in insecure contexts — silently degrade
    }
  }, [card.caption_text]);

  const handleMarkPosted = useCallback(() => {
    markPosted.mutate(card.id);
  }, [markPosted, card.id]);

  return (
    <div className="rounded-xl border border-[var(--nexus-card-border)] bg-[var(--nexus-card-bg)] p-5 shadow-[var(--nexus-card-shadow)]">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[var(--nexus-bg-secondary)] flex items-center justify-center shrink-0">
          <TypeIcon className="w-5 h-5 text-[var(--nexus-accent-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[var(--nexus-text-primary)]">
              {typeConfig.label}
            </span>
            {card.is_sponsored && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-3 h-3" />
                Sponsored {card.earnings_amount != null ? `- ${formatCurrency(card.earnings_amount)}` : ''}
              </span>
            )}
            {card.posted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                <CheckCircle2 className="w-3 h-3" />
                Posted
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--nexus-text-secondary)] mt-1 line-clamp-3">
            {card.preview_text}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Copied to clipboard' : 'Copy post caption'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--nexus-bg-secondary)] text-[var(--nexus-text-primary)] hover:bg-[var(--nexus-card-border)] transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Post
                </>
              )}
            </button>
            {!card.posted && (
              <button
                type="button"
                onClick={handleMarkPosted}
                disabled={markPosted.isPending}
                aria-label="Mark as posted"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--nexus-accent-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {markPosted.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Mark Posted
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TodaysContentSection() {
  const queueQuery = useSyndicationQueue();
  const cards = queueQuery.data ?? [];

  if (queueQuery.isLoading) {
    return <SectionSkeleton />;
  }

  if (cards.length === 0) {
    return (
      <DataCard title="Today's Content Queue" icon={FileText}>
        <p className="text-sm text-[var(--nexus-text-tertiary)] py-8 text-center">
          No content queued for today. Check back tomorrow!
        </p>
      </DataCard>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-[var(--nexus-text-primary)]">
        {cards.length} item{cards.length !== 1 ? 's' : ''} in today&apos;s queue
      </h2>
      {cards.map((card) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ContentCard card={card} />
        </motion.div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: My Communities
// ---------------------------------------------------------------------------

function AddCommunityForm({ onClose }: { onClose: () => void }) {
  const addCommunity = useAddCommunity();
  const [form, setForm] = useState<AddCommunityPayload>({
    platform: 'facebook_group',
    name: '',
    url: '',
    member_count: 0,
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      addCommunity.mutate(form, {
        onSuccess: () => onClose(),
      });
    },
    [addCommunity, form, onClose],
  );

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-[var(--nexus-card-border)] bg-[var(--nexus-card-bg)] p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--nexus-text-primary)]">Add Community</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add community form"
            className="p-1 rounded hover:bg-[var(--nexus-bg-secondary)] transition-colors"
          >
            <X className="w-4 h-4 text-[var(--nexus-text-tertiary)]" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="community-platform"
              className="block text-xs font-medium text-[var(--nexus-text-secondary)] mb-1"
            >
              Platform
            </label>
            <select
              id="community-platform"
              value={form.platform}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, platform: e.target.value as CommunityPlatform }))
              }
              className="w-full rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-primary)] text-[var(--nexus-text-primary)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)]"
            >
              {PLATFORM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="community-name"
              className="block text-xs font-medium text-[var(--nexus-text-secondary)] mb-1"
            >
              Group Name
            </label>
            <input
              id="community-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Abbeville Community"
              className="w-full rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-primary)] text-[var(--nexus-text-primary)] px-3 py-2 text-sm placeholder:text-[var(--nexus-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)]"
            />
          </div>

          <div>
            <label
              htmlFor="community-url"
              className="block text-xs font-medium text-[var(--nexus-text-secondary)] mb-1"
            >
              URL
            </label>
            <input
              id="community-url"
              type="url"
              required
              value={form.url}
              onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="https://..."
              className="w-full rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-primary)] text-[var(--nexus-text-primary)] px-3 py-2 text-sm placeholder:text-[var(--nexus-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)]"
            />
          </div>

          <div>
            <label
              htmlFor="community-members"
              className="block text-xs font-medium text-[var(--nexus-text-secondary)] mb-1"
            >
              Member Count
            </label>
            <input
              id="community-members"
              type="number"
              min={0}
              required
              value={form.member_count || ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, member_count: parseInt(e.target.value, 10) || 0 }))
              }
              placeholder="5000"
              className="w-full rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-primary)] text-[var(--nexus-text-primary)] px-3 py-2 text-sm placeholder:text-[var(--nexus-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)]"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--nexus-text-secondary)] hover:text-[var(--nexus-text-primary)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={addCommunity.isPending || !form.name || !form.url}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--nexus-accent-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {addCommunity.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Add Community
          </button>
        </div>

        {addCommunity.isError && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Failed to add community. Please try again.
          </p>
        )}
      </form>
    </motion.div>
  );
}

function CommunityRow({ community }: { community: SyndicationCommunity }) {
  const removeCommunity = useRemoveCommunity();
  const PlatformIcon = PLATFORM_ICONS[community.platform] ?? Globe;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-[var(--nexus-divider)] last:border-0">
      <div className="w-9 h-9 rounded-lg bg-[var(--nexus-bg-secondary)] flex items-center justify-center shrink-0">
        <PlatformIcon className="w-5 h-5 text-[var(--nexus-accent-primary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--nexus-text-primary)] truncate">
          {community.name}
        </p>
        <p className="text-xs text-[var(--nexus-text-tertiary)]">
          {community.member_count.toLocaleString()} members
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-6 text-xs text-[var(--nexus-text-secondary)]">
        <span>{community.posts_this_month} posts</span>
        <span>{community.clicks_this_month} clicks</span>
        <span className="font-semibold text-[var(--nexus-text-primary)]">
          {formatCurrency(community.earned_this_month)}
        </span>
      </div>
      <button
        type="button"
        onClick={() => removeCommunity.mutate(community.id)}
        disabled={removeCommunity.isPending}
        aria-label={`Remove ${community.name}`}
        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--nexus-text-tertiary)] hover:text-red-400 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function MyCommunitiesSection() {
  const communitiesQuery = useSyndicationCommunities();
  const communities = communitiesQuery.data ?? [];
  const [showForm, setShowForm] = useState(false);

  if (communitiesQuery.isLoading) {
    return <SectionSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--nexus-text-primary)]">
          {communities.length} connected communit{communities.length !== 1 ? 'ies' : 'y'}
        </h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            aria-label="Add community"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--nexus-accent-primary)] text-white hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Community
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && <AddCommunityForm onClose={() => setShowForm(false)} />}
      </AnimatePresence>

      <DataCard>
        {communities.length === 0 ? (
          <p className="text-sm text-[var(--nexus-text-tertiary)] py-6 text-center">
            No communities connected yet. Add your first group above.
          </p>
        ) : (
          <div>
            {communities.map((c) => (
              <CommunityRow key={c.id} community={c} />
            ))}
          </div>
        )}
      </DataCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: My Sponsors
// ---------------------------------------------------------------------------

function SponsorRow({ sponsor }: { sponsor: SyndicationSponsor }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[var(--nexus-divider)] last:border-0">
      <div className="w-9 h-9 rounded-lg bg-[var(--nexus-bg-secondary)] flex items-center justify-center shrink-0">
        <Handshake className="w-5 h-5 text-[var(--nexus-accent-primary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--nexus-text-primary)] truncate">
          {sponsor.smb_name}
        </p>
        <p className="text-xs text-[var(--nexus-text-tertiary)]">
          Budget: {formatCurrency(sponsor.monthly_budget)}/mo
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-6 text-xs text-[var(--nexus-text-secondary)]">
        <span>{sponsor.posts_delivered} posts</span>
        <span>{sponsor.clicks} clicks</span>
        <span className="font-semibold text-emerald-400">
          {formatCurrency(sponsor.partner_cut)}
        </span>
      </div>
    </div>
  );
}

function MySponsorsSection() {
  const sponsorsQuery = useSyndicationSponsors();
  const sponsors = sponsorsQuery.data ?? [];

  if (sponsorsQuery.isLoading) {
    return <SectionSkeleton />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-[var(--nexus-text-primary)]">
        {sponsors.length} active sponsor{sponsors.length !== 1 ? 's' : ''}
      </h2>

      <DataCard title="Sponsors" icon={Handshake}>
        {sponsors.length === 0 ? (
          <p className="text-sm text-[var(--nexus-text-tertiary)] py-6 text-center">
            No active sponsors yet. Sponsors are matched automatically when local businesses run
            campaigns targeting your communities.
          </p>
        ) : (
          <div>
            {sponsors.map((s) => (
              <SponsorRow key={s.id} sponsor={s} />
            ))}
          </div>
        )}
      </DataCard>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <DataCard title="Referral Program" icon={Users} subtitle="Earn more by referring local businesses">
          <div className="space-y-2">
            <p className="text-sm text-[var(--nexus-text-secondary)]">
              Know a local business that should be advertising to your audience? Refer them and earn a
              10% bonus on their first 3 months of sponsored content spend.
            </p>
            <p className="text-xs text-[var(--nexus-text-tertiary)]">
              Contact your account manager for your unique referral link.
            </p>
          </div>
        </DataCard>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: Performance
// ---------------------------------------------------------------------------

function BarChartSimple({ data }: { data: EarningsMonth[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-[var(--nexus-text-tertiary)] py-8 text-center">
        No performance data available yet.
      </p>
    );
  }

  const maxEarned = Math.max(...data.map((d) => d.earned), 1);

  return (
    <div className="space-y-3">
      {data.map((month) => {
        const pct = Math.round((month.earned / maxEarned) * 100);
        return (
          <div key={month.month} className="flex items-center gap-3">
            <span className="text-xs text-[var(--nexus-text-secondary)] w-16 shrink-0 text-right">
              {month.month}
            </span>
            <div className="flex-1 h-5 rounded bg-[var(--nexus-bg-tertiary)] overflow-hidden">
              <motion.div
                className="h-full rounded bg-[var(--nexus-accent-primary)]"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs font-semibold text-[var(--nexus-text-primary)] w-20 text-right">
              {formatCurrency(month.earned)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PerformanceSection() {
  const earningsQuery = useSyndicationEarnings();
  const months = earningsQuery.data?.months ?? [];

  // Aggregate content type stats from available data
  const totalPosts = months.reduce((sum, m) => sum + m.posts, 0);
  const totalClicks = months.reduce((sum, m) => sum + m.clicks, 0);
  const totalEarned = months.reduce((sum, m) => sum + m.earned, 0);

  if (earningsQuery.isLoading) {
    return <SectionSkeleton />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DataCard title="Monthly Earnings" icon={BarChart3} subtitle="Revenue trend over time">
          <BarChartSimple data={months} />
        </DataCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DataCard title="Engagement Breakdown" icon={TrendingUp} subtitle="Aggregate performance across all months">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center py-4">
              <p className="text-2xl font-bold text-[var(--nexus-text-primary)]">{totalPosts}</p>
              <p className="text-xs text-[var(--nexus-text-tertiary)] mt-1">Total Posts</p>
            </div>
            <div className="text-center py-4">
              <p className="text-2xl font-bold text-[var(--nexus-text-primary)]">{totalClicks.toLocaleString()}</p>
              <p className="text-xs text-[var(--nexus-text-tertiary)] mt-1">Total Clicks</p>
            </div>
            <div className="text-center py-4">
              <p className="text-2xl font-bold text-[var(--nexus-accent-primary)]">
                {formatCurrency(totalEarned)}
              </p>
              <p className="text-xs text-[var(--nexus-text-tertiary)] mt-1">Total Earned</p>
            </div>
          </div>
        </DataCard>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Registration form (shown when partner is not registered)
// ---------------------------------------------------------------------------

function RegistrationForm() {
  const register = useRegisterPartner();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      register.mutate({ name, email });
    },
    [register, name, email],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Syndication Partner Program"
        subtitle="Earn money by sharing sponsored content with your local communities"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <DataCard title="Become a Partner" icon={Handshake}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs font-medium text-[var(--nexus-text-secondary)] mb-1"
              >
                Your Name
              </label>
              <input
                id="register-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-primary)] text-[var(--nexus-text-primary)] px-3 py-2 text-sm placeholder:text-[var(--nexus-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)]"
              />
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-medium text-[var(--nexus-text-secondary)] mb-1"
              >
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full rounded-lg border border-[var(--nexus-card-border)] bg-[var(--nexus-bg-primary)] text-[var(--nexus-text-primary)] px-3 py-2 text-sm placeholder:text-[var(--nexus-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={register.isPending || !name || !email}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-[var(--nexus-accent-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {register.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Become a Partner
            </button>

            {register.isError && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Registration failed. Please try again.
              </p>
            )}
          </form>
        </DataCard>
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function SectionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-[var(--nexus-bg-tertiary)] rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-[var(--nexus-bg-tertiary)] rounded-xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="p-8 text-center text-red-400 bg-red-500/5 rounded-lg border border-red-500/20">
      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const SECTION_COMPONENTS: Record<SectionId, React.FC> = {
  overview: OverviewSection,
  content: TodaysContentSection,
  communities: MyCommunitiesSection,
  sponsors: MySponsorsSection,
  performance: PerformanceSection,
};

export function SyndicationDashboardPage() {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();

  const activeSection: SectionId =
    section && SECTION_COMPONENTS[section as SectionId] ? (section as SectionId) : 'overview';

  const dashboardQuery = useSyndicationDashboard();

  // 404 means the user is not a registered partner
  const isNotRegistered =
    dashboardQuery.isError &&
    typeof dashboardQuery.error === 'object' &&
    dashboardQuery.error !== null &&
    'status' in dashboardQuery.error &&
    (dashboardQuery.error as { status: number }).status === 404;

  // Non-404 error
  const hasFatalError = dashboardQuery.isError && !isNotRegistered;

  const handleTabChange = useCallback(
    (tabId: string) => {
      navigate(
        tabId === 'overview'
          ? '/command-center/syndication'
          : `/command-center/syndication/${tabId}`,
        { replace: true },
      );
    },
    [navigate],
  );

  if (isNotRegistered) {
    return <RegistrationForm />;
  }

  const ActiveSectionComponent = SECTION_COMPONENTS[activeSection];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Syndication Partner Dashboard"
        subtitle="Manage your communities, track sponsored content, and monitor earnings"
      />

      {hasFatalError && (
        <ErrorBanner message="Failed to load syndication dashboard. Please try again later." />
      )}

      <TabNav
        tabs={SECTION_TABS}
        activeTab={activeSection}
        onTabChange={handleTabChange}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          variants={PAGE_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          <ActiveSectionComponent />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
