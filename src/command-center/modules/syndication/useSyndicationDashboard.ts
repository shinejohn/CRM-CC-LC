import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SyndicationTier {
  name: 'bronze' | 'silver' | 'gold' | 'platinum';
  revenue_share_pct: number;
  threshold: number;
}

export interface SyndicationDashboardData {
  partner: {
    id: string;
    name: string;
    email: string;
    tier: SyndicationTier;
    total_earned: number;
    this_month_earned: number;
    community_count: number;
    active_sponsor_count: number;
  };
  earnings_history: EarningsMonth[];
}

export interface EarningsMonth {
  month: string;
  earned: number;
  posts: number;
  clicks: number;
}

export type ContentType =
  | 'sponsored_post'
  | 'article'
  | 'event'
  | 'deal'
  | 'poll'
  | 'community_update';

export interface QueueCard {
  id: string;
  content_type: ContentType;
  preview_text: string;
  caption_text: string;
  is_sponsored: boolean;
  sponsor_name?: string;
  earnings_amount?: number;
  posted: boolean;
  scheduled_at: string;
}

export type CommunityPlatform =
  | 'facebook_group'
  | 'facebook_page'
  | 'instagram'
  | 'twitter'
  | 'tiktok'
  | 'nextdoor'
  | 'newsletter'
  | 'whatsapp'
  | 'telegram'
  | 'reddit'
  | 'other';

export interface SyndicationCommunity {
  id: string;
  platform: CommunityPlatform;
  name: string;
  url: string;
  member_count: number;
  posts_this_month: number;
  clicks_this_month: number;
  earned_this_month: number;
}

export interface SyndicationSponsor {
  id: string;
  smb_name: string;
  monthly_budget: number;
  partner_cut: number;
  posts_delivered: number;
  clicks: number;
}

export interface SyndicationEarnings {
  period: string;
  months: EarningsMonth[];
  total: number;
}

export interface CurrentEarnings {
  month: string;
  earned: number;
  pending: number;
  projected: number;
}

export interface RegisterPartnerPayload {
  name: string;
  email: string;
}

export interface AddCommunityPayload {
  platform: CommunityPlatform;
  name: string;
  url: string;
  member_count: number;
}

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const keys = {
  all: ['syndication'] as const,
  dashboard: () => [...keys.all, 'dashboard'] as const,
  queue: () => [...keys.all, 'queue'] as const,
  communities: () => [...keys.all, 'communities'] as const,
  sponsors: () => [...keys.all, 'sponsors'] as const,
  earnings: (period?: string) => [...keys.all, 'earnings', period ?? 'all'] as const,
  currentEarnings: () => [...keys.all, 'earnings', 'current'] as const,
};

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

export function useSyndicationDashboard() {
  return useQuery({
    queryKey: keys.dashboard(),
    queryFn: async () => {
      const { data } = await apiClient.get<SyndicationDashboardData>(
        '/syndication/dashboard',
      );
      return data;
    },
    retry: false,
  });
}

export function useSyndicationQueue() {
  return useQuery({
    queryKey: keys.queue(),
    queryFn: async () => {
      const { data } = await apiClient.get<QueueCard[]>('/syndication/queue');
      return data;
    },
  });
}

export function useSyndicationCommunities() {
  return useQuery({
    queryKey: keys.communities(),
    queryFn: async () => {
      const { data } = await apiClient.get<SyndicationCommunity[]>(
        '/syndication/communities',
      );
      return data;
    },
  });
}

export function useSyndicationSponsors() {
  return useQuery({
    queryKey: keys.sponsors(),
    queryFn: async () => {
      const { data } = await apiClient.get<SyndicationSponsor[]>(
        '/syndication/sponsors',
      );
      return data;
    },
  });
}

export function useSyndicationEarnings(period?: string) {
  return useQuery({
    queryKey: keys.earnings(period),
    queryFn: async () => {
      const params = period ? { period } : undefined;
      const { data } = await apiClient.get<SyndicationEarnings>(
        '/syndication/earnings',
        { params },
      );
      return data;
    },
  });
}

export function useCurrentEarnings() {
  return useQuery({
    queryKey: keys.currentEarnings(),
    queryFn: async () => {
      const { data } = await apiClient.get<CurrentEarnings>(
        '/syndication/earnings/current',
      );
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

export function useRegisterPartner() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RegisterPartnerPayload) => {
      const { data } = await apiClient.post<SyndicationDashboardData>(
        '/syndication/register',
        payload,
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useAddCommunity() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddCommunityPayload) => {
      const { data } = await apiClient.post<SyndicationCommunity>(
        '/syndication/communities',
        payload,
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.communities() });
      void qc.invalidateQueries({ queryKey: keys.dashboard() });
    },
  });
}

export function useRemoveCommunity() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/syndication/communities/${id}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.communities() });
      void qc.invalidateQueries({ queryKey: keys.dashboard() });
    },
  });
}

export function useMarkPosted() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (cardId: string) => {
      const { data } = await apiClient.post<QueueCard>(
        `/syndication/posted/${cardId}`,
      );
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.queue() });
      void qc.invalidateQueries({ queryKey: keys.dashboard() });
    },
  });
}
