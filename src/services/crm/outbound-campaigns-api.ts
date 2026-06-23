// ============================================
// OUTBOUND CAMPAIGNS API
// Email / phone / SMS broadcast campaigns
// Backend: /api/v1/outbound/campaigns
// ============================================

import { apiClient } from '../learning/api-client';

export type OutboundCampaignType = 'email' | 'phone' | 'sms';
export type OutboundCampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'completed'
  | 'cancelled';

/**
 * Segment filters the backend understands (buildRecipientList in
 * OutboundCampaignController). All optional; only provided keys are applied.
 */
export interface RecipientSegments {
  state?: string;
  city?: string;
  pipeline_stage?: string;
  community_id?: string;
  category?: string;
  campaign_status?: string;
  profile_completeness_min?: number;
  industry_category?: string;
  industry_subcategory?: string;
  lead_score_min?: number;
  lead_score_max?: number;
  tags?: string[];
  has_email?: boolean;
  has_phone?: boolean;
}

export interface OutboundCampaign {
  id: string;
  tenant_id: string;
  name: string;
  type: OutboundCampaignType;
  status: OutboundCampaignStatus;
  subject?: string | null;
  message: string;
  template_id?: string | null;
  template_variables?: Record<string, unknown>;
  scheduled_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  recipient_segments?: RecipientSegments;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  opened_count: number;
  clicked_count: number;
  replied_count: number;
  answered_count: number;
  voicemail_count: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type AbWinnerMetric = 'open_rate' | 'click_rate';

export interface CampaignVariantInput {
  label?: string;
  subject?: string;
  message?: string;
  template_id?: string;
  /** Split percentage 0-100. */
  weight?: number;
}

export interface CampaignVariantStats {
  id: string;
  label: string;
  subject: string | null;
  weight: number;
  recipients_count: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  open_rate: number;
  click_rate: number;
  is_winner: boolean;
}

export interface OutboundCampaignAnalytics {
  campaign_id: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  opened_count: number;
  clicked_count: number;
  replied_count: number;
  answered_count: number;
  voicemail_count: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  status_breakdown: Record<string, number>;
  ab_test_enabled: boolean;
  ab_winner_metric: AbWinnerMetric | null;
  variants: CampaignVariantStats[];
}

export interface CreateOutboundCampaignInput {
  name: string;
  type: OutboundCampaignType;
  message: string;
  /** Required by the API when type === 'email'. */
  subject?: string;
  scheduled_at?: string;
  recipient_segments?: RecipientSegments;
  template_id?: string;
  template_variables?: Record<string, unknown>;
  /** When true with variants[], the campaign runs as an A/B split. */
  ab_test_enabled?: boolean;
  ab_winner_metric?: AbWinnerMetric;
  /** Optional % of audience to include in the A/B test. */
  ab_test_size?: number;
  /** Two or more variants; only used when ab_test_enabled is true. */
  variants?: CampaignVariantInput[];
}

export type UpdateOutboundCampaignInput = Partial<{
  name: string;
  message: string;
  subject: string;
  scheduled_at: string | null;
  status: OutboundCampaignStatus;
  recipient_segments: RecipientSegments;
  template_id: string | null;
  template_variables: Record<string, unknown>;
}>;

export interface OutboundCampaignListParams {
  type?: OutboundCampaignType;
  status?: OutboundCampaignStatus;
  per_page?: number;
  page?: number;
}

interface PaginatedCampaigns {
  data: OutboundCampaign[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export const outboundCampaignsApi = {
  list: (params?: OutboundCampaignListParams): Promise<PaginatedCampaigns> => {
    const searchParams = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') searchParams.set(k, String(v));
    });
    const query = searchParams.toString();
    return apiClient.get<PaginatedCampaigns>(
      `/api/v1/outbound/campaigns${query ? `?${query}` : ''}`,
    );
  },

  get: async (id: string): Promise<OutboundCampaign> => {
    const res = await apiClient.get<{ data: OutboundCampaign }>(
      `/api/v1/outbound/campaigns/${id}`,
    );
    return res.data;
  },

  create: async (data: CreateOutboundCampaignInput): Promise<OutboundCampaign> => {
    const res = await apiClient.post<{ data: OutboundCampaign }>(
      '/api/v1/outbound/campaigns',
      data,
    );
    return res.data;
  },

  update: async (
    id: string,
    data: UpdateOutboundCampaignInput,
  ): Promise<OutboundCampaign> => {
    const res = await apiClient.put<{ data: OutboundCampaign }>(
      `/api/v1/outbound/campaigns/${id}`,
      data,
    );
    return res.data;
  },

  start: async (id: string): Promise<OutboundCampaign> => {
    const res = await apiClient.post<{ data: OutboundCampaign }>(
      `/api/v1/outbound/campaigns/${id}/start`,
      {},
    );
    return res.data;
  },

  analytics: async (id: string): Promise<OutboundCampaignAnalytics> => {
    const res = await apiClient.get<{ data: OutboundCampaignAnalytics }>(
      `/api/v1/outbound/campaigns/${id}/analytics`,
    );
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/outbound/campaigns/${id}`);
  },

  declareWinner: async (
    id: string,
    metric?: AbWinnerMetric,
  ): Promise<CampaignVariantStats> => {
    const res = await apiClient.post<{ data: CampaignVariantStats }>(
      `/api/v1/outbound/campaigns/${id}/variants/winner`,
      metric ? { metric } : {},
    );
    return res.data;
  },
};
