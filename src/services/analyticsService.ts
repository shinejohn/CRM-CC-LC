/**
 * Analytics endpoints
 */

import api from './api';
import type { DashboardAnalytics } from '../types/analytics';
import type { ApiResponse } from '../types/common';

export const analyticsService = {
  getDashboard: (params?: { start_date?: string; end_date?: string }) =>
    api.get<ApiResponse<DashboardAnalytics>>('/crm/dashboard/analytics', { params }).then((r) => r.data.data ?? r.data),

  getInterest: () =>
    api.get<ApiResponse<Record<string, unknown>>>('/crm/analytics/interest').then((r) => r.data.data ?? r.data),

  getPurchases: () =>
    api.get<ApiResponse<Record<string, unknown>>>('/crm/analytics/purchases').then((r) => r.data.data ?? r.data),

  getLearning: () =>
    api.get<ApiResponse<Record<string, unknown>>>('/crm/analytics/learning').then((r) => r.data.data ?? r.data),

  getCampaignPerformance: () =>
    api.get<ApiResponse<Record<string, unknown>>>('/crm/analytics/campaign-performance').then((r) => r.data.data ?? r.data),

  getRecommendations: () =>
    api.get<ApiResponse<Array<{ priority: string; category: string; title: string; impact: string; description: string; actions: string[] }>>>('/crm/recommendations').then((r) => r.data.data ?? r.data ?? []),
};
