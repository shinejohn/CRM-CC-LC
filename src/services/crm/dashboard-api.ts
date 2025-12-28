import { apiClient } from '../learning/api-client';

export interface CustomerMetrics {
  total: number;
  new: number;
  by_lead_score: {
    high: number;
    medium: number;
    low: number;
    cold: number;
  };
  by_industry: Array<{
    industry: string;
    count: number;
  }>;
}

export interface ConversationMetrics {
  total: number;
  recent: number;
  by_outcome: Array<{
    outcome: string;
    count: number;
  }>;
  avg_duration_seconds: number | null;
}

export interface OrderMetrics {
  total: number;
  paid: number;
  recent: number;
  total_revenue: number;
  recent_revenue: number;
  revenue_over_time: Array<{
    date: string;
    revenue: number;
  }>;
}

export interface SubscriptionMetrics {
  active: number;
  by_tier: Array<{
    tier: string;
    count: number;
  }>;
}

export interface ConversionMetrics {
  rate: number;
  conversations_with_purchase: number;
}

export interface RecentActivity {
  customers: Array<{
    id: string;
    business_name: string;
    email: string | null;
    lead_score: number;
    created_at: string;
  }>;
  orders: Array<{
    id: string;
    order_number: string;
    customer_id: string | null;
    total: number;
    status: string;
    payment_status: string;
    created_at: string;
    customer?: {
      id: string;
      business_name: string;
    };
  }>;
  conversations: Array<{
    id: string;
    customer_id: string | null;
    outcome: string | null;
    duration_seconds: number | null;
    started_at: string;
    customer?: {
      id: string;
      business_name: string;
    };
  }>;
}

export interface CrmAnalytics {
  customers: CustomerMetrics;
  conversations: ConversationMetrics;
  orders: OrderMetrics;
  subscriptions: SubscriptionMetrics;
  conversion: ConversionMetrics;
  recent_activity: RecentActivity;
  date_range: {
    start: string;
    end: string;
    days: number;
  };
}

export interface CrmAnalyticsResponse {
  data: CrmAnalytics;
}

/**
 * Get CRM dashboard analytics
 */
export async function getCrmAnalytics(days: number = 30): Promise<CrmAnalytics> {
  const response = await apiClient.get<CrmAnalyticsResponse>('/api/v1/crm/dashboard/analytics', {
    params: { days },
  });
  return response.data.data;
}
