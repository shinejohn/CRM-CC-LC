// ============================================
// CRM ADVANCED ANALYTICS API
// ============================================

import { apiClient } from '../learning/api-client';

export interface EngagementScore {
  customer_id: string;
  engagement_score: number;
}

export interface CampaignROI {
  campaign_id: string;
  conversations: number;
  conversions: number;
  conversion_rate: number;
  revenue: number;
  cost: number;
  roi: number;
  roas: number;
  profit: number;
  period_days: number | null;
}

export interface PredictiveScore {
  current_score: number;
  predicted_score: number;
  score_change: number;
  confidence: number;
  factors: Array<{
    factor: string;
    impact: string;
    details: string;
  }>;
}

/**
 * Get customer engagement score
 */
export async function getEngagementScore(
  customerId: string
): Promise<EngagementScore> {
  const response = await apiClient.get<{ data: EngagementScore }>(
    `/api/v1/crm/customers/${customerId}/engagement-score`
  );
  return response.data.data;
}

/**
 * Get campaign ROI
 */
export async function getCampaignROI(
  campaignId: string,
  days: number = 30
): Promise<CampaignROI> {
  const response = await apiClient.get<{ data: CampaignROI }>(
    `/api/v1/crm/campaigns/${campaignId}/roi`,
    { params: { days } }
  );
  return response.data.data;
}

/**
 * Get predictive lead score
 */
export async function getPredictiveScore(
  customerId: string
): Promise<PredictiveScore> {
  const response = await apiClient.get<{ data: PredictiveScore }>(
    `/api/v1/crm/customers/${customerId}/predictive-score`
  );
  return response.data.data;
}
