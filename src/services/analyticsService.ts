/**
 * Analytics endpoints
 */

import { apiClient } from '@/services/api';
import type { DashboardAnalytics } from '../types/analytics';
import type { ApiResponse } from '../types/common';

export const analyticsService = {
  getDashboard: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get<ApiResponse<DashboardAnalytics>>('/crm/dashboard/analytics', { params }).then((r: any) => r.data.data ?? r.data),

  getInterest: () =>
    apiClient.get<ApiResponse<Record<string, unknown>>>('/crm/analytics/interest').then((r: any) => r.data.data ?? r.data),

  getPurchases: () =>
    apiClient.get<ApiResponse<Record<string, unknown>>>('/crm/analytics/purchases').then((r: any) => r.data.data ?? r.data),

  getLearning: () =>
    apiClient.get<ApiResponse<Record<string, unknown>>>('/crm/analytics/learning').then((r: any) => r.data.data ?? r.data),

  getCampaignPerformance: () =>
    apiClient.get<ApiResponse<Record<string, unknown>>>('/crm/analytics/campaign-performance').then((r: any) => r.data.data ?? r.data),

  getRecommendations: () =>
    apiClient.get<ApiResponse<Array<{ priority: string; category: string; title: string; impact: string; description: string; actions: string[] }>>>('/crm/recommendations').then((r: any) => r.data.data ?? r.data ?? []),
};
