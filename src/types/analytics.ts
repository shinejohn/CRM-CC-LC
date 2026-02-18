/**
 * Analytics and dashboard types
 */

export interface DashboardAnalytics {
  total_customers?: number;
  total_campaigns?: number;
  total_content?: number;
  engagement_metrics?: Record<string, number>;
}

export interface EngagementScore {
  customer_id: string;
  score: number;
  factors?: Record<string, number>;
}

export interface PredictiveScore {
  customer_id: string;
  score: number;
  factors?: Record<string, number>;
}
