import { useAuthStore } from '@/stores/authStore';

type Feature =
  | 'article_creation'
  | 'event_creation'
  | 'campaign_builder'
  | 'ai_employees'
  | 'advanced_analytics'
  | 'social_posting'
  | 'email_campaigns'
  | 'sms_campaigns'
  | 'voice_campaigns'
  | 'competitor_reports'
  | 'priority_listing'
  | 'newsletter_placement'
  | 'weekly_article';

type Tier = 'free' | 'influencer' | 'expert' | 'sponsor';

interface FeatureAccess {
  visible: boolean;
  enabled: boolean;
  requiredTier: Tier;
  upgradeLabel?: string;
}

const TIER_LABELS: Record<Tier, string> = {
  free: 'Free',
  influencer: 'Community Influencer',
  expert: 'Community Expert',
  sponsor: 'Community Sponsor',
};

const TIER_HIERARCHY: Record<Tier, number> = {
  free: 0,
  influencer: 1,
  expert: 2,
  sponsor: 3,
};

const FEATURE_REQUIREMENTS: Record<Feature, Tier> = {
  // Free tier: basic profile, dashboards, learning center (no feature gates)

  // Influencer tier
  article_creation: 'influencer',
  event_creation: 'influencer',
  campaign_builder: 'influencer',
  priority_listing: 'influencer',
  newsletter_placement: 'influencer',
  ai_employees: 'influencer',

  // Expert tier
  weekly_article: 'expert',
  advanced_analytics: 'expert',
  competitor_reports: 'expert',

  // Sponsor tier
  social_posting: 'sponsor',
  email_campaigns: 'sponsor',
  sms_campaigns: 'sponsor',
  voice_campaigns: 'sponsor',
};

export function useFeatureAccess(feature: Feature): FeatureAccess {
  const user = useAuthStore((s) => s.user);
  const userTier: Tier = user?.subscription_tier ?? 'free';

  const requiredTier = FEATURE_REQUIREMENTS[feature];
  const userLevel = TIER_HIERARCHY[userTier];
  const requiredLevel = TIER_HIERARCHY[requiredTier];
  const enabled = userLevel >= requiredLevel;

  return {
    visible: true,
    enabled,
    requiredTier,
    upgradeLabel: enabled ? undefined : `Upgrade to ${TIER_LABELS[requiredTier]}`,
  };
}
