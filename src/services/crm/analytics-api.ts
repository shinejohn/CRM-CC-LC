// ============================================
// CRM ANALYTICS API
// ============================================

import { apiClient } from '../learning/api-client';

export interface InterestAnalytics {
  interest_by_topic: Array<{ topic: string; count: number }>;
  questions_by_type: Array<{ question: string; count: number }>;
  customer_engagement: Array<{
    customer_id: string;
    customer_name: string;
    customer_email: string | null;
    lead_score: number;
    conversation_count: number;
    avg_duration: number | null;
  }>;
  interest_over_time: Array<{ date: string; count: number }>;
  date_range: {
    start: string;
    end: string;
    days: number;
  };
}

export interface PurchaseAnalytics {
  summary: {
    total_purchases: number;
    recent_purchases: number;
    total_revenue: number;
    recent_revenue: number;
    conversion_rate: number;
  };
  purchases_by_service: Array<{ service_type: string; count: number }>;
  customer_purchases: Array<{
    customer_id: string;
    customer_name: string;
    customer_email: string | null;
    lead_score: number;
    purchase_count: number;
    total_spent: number;
  }>;
  purchase_timeline: Array<{ date: string; count: number; revenue: number }>;
  conversion_funnel: {
    conversations: number;
    conversions: number;
    rate: number;
  };
  date_range: {
    start: string;
    end: string;
    days: number;
  };
}

export interface LearningAnalytics {
  knowledge_base: {
    total: number;
    recent: number;
  };
  presentations: {
    total: number;
    recent: number;
  };
  engagement: {
    conversations_with_questions: number;
    total_questions: number;
    avg_questions_per_session: number;
  };
  customer_learning: Array<{
    customer_id: string;
    customer_name: string;
    customer_email: string | null;
    session_count: number;
    sessions_with_questions: number;
    avg_duration: number | null;
  }>;
  learning_over_time: Array<{
    date: string;
    sessions: number;
    sessions_with_questions: number;
  }>;
  date_range: {
    start: string;
    end: string;
    days: number;
  };
}

export interface CampaignPerformance {
  campaign_performance: Array<{
    campaign_type: string;
    total_sessions: number;
    conversions: number;
    conversion_rate: number;
    avg_duration: number | null;
    engagement_rate: number;
  }>;
  date_range: {
    start: string;
    end: string;
    days: number;
  };
}

/**
 * Get interest monitoring analytics
 */
export async function getInterestAnalytics(days: number = 30): Promise<InterestAnalytics> {
  const response = await apiClient.get<{ data: InterestAnalytics }>('/api/v1/crm/analytics/interest', {
    params: { days },
  });
  return response.data.data;
}

/**
 * Get purchase tracking analytics
 */
export async function getPurchaseAnalytics(days: number = 30): Promise<PurchaseAnalytics> {
  const response = await apiClient.get<{ data: PurchaseAnalytics }>('/api/v1/crm/analytics/purchases', {
    params: { days },
  });
  return response.data.data;
}

/**
 * Get learning analytics
 */
export async function getLearningAnalytics(days: number = 30): Promise<LearningAnalytics> {
  const response = await apiClient.get<{ data: LearningAnalytics }>('/api/v1/crm/analytics/learning', {
    params: { days },
  });
  return response.data.data;
}

/**
 * Get campaign performance metrics
 */
export async function getCampaignPerformance(days: number = 30): Promise<CampaignPerformance> {
  const response = await apiClient.get<{ data: CampaignPerformance }>('/api/v1/crm/analytics/campaign-performance', {
    params: { days },
  });
  return response.data.data;
}
