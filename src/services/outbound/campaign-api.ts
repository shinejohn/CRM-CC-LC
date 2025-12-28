// ============================================
// OUTBOUND CAMPAIGN API (Generic)
// ============================================

import { apiClient } from '../learning/api-client';

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  customer_id: string | null;
  email: string | null;
  phone: string | null;
  name: string | null;
  status: string;
  sent_at: string | null;
  delivered_at: string | null;
  error_message: string | null;
}

export interface CampaignAnalytics {
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
}

export interface RecipientList {
  total: number;
  recipients: Array<{
    customer_id: string;
    name: string;
    email?: string;
    phone?: string;
  }>;
}

/**
 * Get campaign recipients
 */
export async function getCampaignRecipients(campaignId: string): Promise<RecipientList> {
  const response = await apiClient.get<{ data: RecipientList }>(
    `/api/v1/outbound/campaigns/${campaignId}/recipients`
  );
  return response.data.data;
}

/**
 * Start campaign
 */
export async function startCampaign(campaignId: string): Promise<void> {
  await apiClient.post(`/api/v1/outbound/campaigns/${campaignId}/start`);
}

/**
 * Get campaign analytics
 */
export async function getCampaignAnalytics(campaignId: string): Promise<CampaignAnalytics> {
  const response = await apiClient.get<{ data: CampaignAnalytics }>(
    `/api/v1/outbound/campaigns/${campaignId}/analytics`
  );
  return response.data.data;
}
