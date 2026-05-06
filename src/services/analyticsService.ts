/**
 * Analytics endpoints
 */

import type { AxiosResponse } from 'axios';
import { apiClient } from '@/services/api';
import type { DashboardAnalytics } from '../types/analytics';
import type { ApiResponse } from '../types/common';

type AnalyticsRecommendation = { priority: string; category: string; title: string; impact: string; description: string; actions: string[] };

export const analyticsService = {
  getDashboard: (params?: { start_date?: string; end_date?: string }) =>
    apiClient.get<ApiResponse<DashboardAnalytics>>('/crm/dashboard/analytics', { params }).then((r: AxiosResponse<ApiResponse<DashboardAnalytics>>) => r.data.data ?? r.data),

  getInterest: () =>
    apiClient.get<ApiResponse<Record<string, unknown>>>('/crm/analytics/interest').then((r: AxiosResponse<ApiResponse<Record<string, unknown>>>) => r.data.data ?? r.data),

  getPurchases: () =>
    apiClient.get<ApiResponse<Record<string, unknown>>>('/crm/analytics/purchases').then((r: AxiosResponse<ApiResponse<Record<string, unknown>>>) => r.data.data ?? r.data),

  getLearning: () =>
    apiClient.get<ApiResponse<Record<string, unknown>>>('/crm/analytics/learning').then((r: AxiosResponse<ApiResponse<Record<string, unknown>>>) => r.data.data ?? r.data),

  getCampaignPerformance: () =>
    apiClient.get<ApiResponse<Record<string, unknown>>>('/crm/analytics/campaign-performance').then((r: AxiosResponse<ApiResponse<Record<string, unknown>>>) => r.data.data ?? r.data),

  getRecommendations: () =>
    apiClient.get<ApiResponse<AnalyticsRecommendation[]>>('/crm/recommendations').then((r: AxiosResponse<ApiResponse<AnalyticsRecommendation[]>>) => r.data.data ?? r.data ?? []),
};
