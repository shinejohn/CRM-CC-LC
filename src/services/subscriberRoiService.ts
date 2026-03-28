import { apiClient } from "@/services/api";

export interface SubscriberROIReport {
  customer_id: string;
  business_name: string | null;
  month: string;
  billing: {
    amount_charged: number;
    payment_status: string;
    invoices_paid_in_month: number;
  };
  subscription: {
    tier: string;
    monthly_rate: number;
    is_founder_pricing: boolean;
    months_active: number;
  };
  content_delivery: {
    story_mentions: number;
    story_mention_target: number;
    articles_featuring_business: number;
  };
  advertising: {
    ad_impressions: number;
    ad_clicks: number;
    ad_ctr: number;
    newsletter_impressions: number;
  };
  listing_performance: {
    profile_views: number;
    search_appearances: number;
    website_clicks: number;
    phone_clicks: number;
    direction_requests: number;
  };
  commerce: {
    coupons_created: number;
    coupons_claimed: number;
    coupon_redemptions: number;
    events_promoted: number;
    tickets_sold: number;
  };
  engagement: {
    engagement_score: number | null;
    engagement_tier: number | null;
    tier_name: string;
    emails_sent: number;
    emails_opened: number;
    email_open_rate: number;
  };
  estimated_value: {
    total_estimated_value: number;
    breakdown: Record<string, number>;
  };
}

export interface SubscriberROIMonthSnapshot {
  month: string;
  estimated_value_total: number;
  story_mentions: number;
  ad_impressions: number;
  profile_views: number;
  coupon_redemptions: number;
  engagement_score: number | null;
  email_open_rate: number;
}

export interface TrendMetric {
  current: number;
  previous: number;
  delta: number;
  delta_percent: number;
  direction: "up" | "down" | "flat";
}

export interface SubscriberROISummary {
  customer_id: string;
  business_name: string | null;
  months: SubscriberROIMonthSnapshot[];
  trends: Record<string, TrendMetric>;
}

export async function fetchSubscriberRoiCurrent(customerId: string): Promise<SubscriberROIReport> {
  const res = await apiClient.get<{ data: SubscriberROIReport }>(
    `/subscriber-roi/${encodeURIComponent(customerId)}`
  );
  return res.data.data;
}

export async function fetchSubscriberRoiSummary(customerId: string): Promise<SubscriberROISummary> {
  const res = await apiClient.get<{ data: SubscriberROISummary }>(
    `/subscriber-roi/${encodeURIComponent(customerId)}/summary`
  );
  return res.data.data;
}
