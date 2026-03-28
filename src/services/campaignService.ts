/**
 * Campaign operations
 */

import { apiClient } from '@/services/api';
import type { Campaign, CampaignRecipient, CampaignSend } from '../types/campaign';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const campaignService = {
  list: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<Campaign>>('/campaigns', { params }).then((r: any) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Campaign>>(`/campaigns/${id}`).then((r: any) => r.data.data),

  getRecipients: (id: string) =>
    apiClient.get<ApiResponse<CampaignRecipient[]>>(`/outbound/campaigns/${id}/recipients`).then((r: any) => r.data.data),

  start: (id: string) =>
    apiClient.post<ApiResponse<Campaign>>(`/outbound/campaigns/${id}/start`).then((r: any) => r.data.data),

  getAnalytics: (id: string) =>
    apiClient.get<ApiResponse<Record<string, unknown>>>(`/outbound/campaigns/${id}/analytics`).then((r: any) => r.data.data),
};
