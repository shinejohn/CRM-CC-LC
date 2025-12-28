// ============================================
// COMMAND CENTER - PUBLISHING API
// ============================================

import { apiClient } from '../learning/api-client';

export interface PublishingDashboard {
  content_stats: {
    total: number;
    published: number;
    draft: number;
    review: number;
    articles: number;
    blogs: number;
    social: number;
  };
  ad_stats: {
    total: number;
    active: number;
    scheduled: number;
    total_impressions: number;
    total_clicks: number;
    total_spend: number;
  };
  recent_content: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    created_at: string;
  }>;
  recent_ads: Array<{
    id: string;
    name: string;
    platform: string;
    status: string;
    created_at: string;
  }>;
}

export interface CalendarItem {
  id: string;
  title?: string;
  name?: string;
  type?: string;
  platform?: string;
  status: string;
  scheduled_publish_at?: string;
  scheduled_start_at?: string;
  scheduled_end_at?: string;
}

export interface PublishingCalendar {
  content: CalendarItem[];
  ads: CalendarItem[];
}

export interface PublishingAnalytics {
  content_over_time: Array<{
    date: string;
    count: number;
  }>;
  ad_performance: Array<{
    platform: string;
    ad_count: number;
    impressions: number;
    clicks: number;
    spend: number;
    avg_ctr: number;
    avg_cpc: number;
  }>;
}

/**
 * Get publishing dashboard data
 */
export async function getPublishingDashboard(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<PublishingDashboard> {
  const response = await apiClient.get<{ data: PublishingDashboard }>(
    '/api/v1/publishing/dashboard',
    { params }
  );
  return response.data.data;
}

/**
 * Get content calendar
 */
export async function getPublishingCalendar(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<PublishingCalendar> {
  const response = await apiClient.get<{ data: PublishingCalendar }>(
    '/api/v1/publishing/calendar',
    { params }
  );
  return response.data.data;
}

/**
 * Get publishing analytics
 */
export async function getPublishingAnalytics(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<PublishingAnalytics> {
  const response = await apiClient.get<{ data: PublishingAnalytics }>(
    '/api/v1/publishing/analytics',
    { params }
  );
  return response.data.data;
}

/**
 * Publish content
 */
export async function publishContent(
  id: string,
  options?: {
    channels?: string[];
    publishing_metadata?: Record<string, any>;
    notes?: string;
  }
): Promise<void> {
  await apiClient.post(`/api/v1/publishing/content/${id}/publish`, options || {});
}
