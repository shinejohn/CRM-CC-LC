/**
 * Campaign operations
 */

import api from './api';
import type { Campaign, CampaignRecipient, CampaignSend } from '../types/campaign';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const campaignService = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<Campaign>>('/campaigns', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<Campaign>>(`/campaigns/${id}`).then((r) => r.data.data),

  getRecipients: (id: string) =>
    api.get<ApiResponse<CampaignRecipient[]>>(`/outbound/campaigns/${id}/recipients`).then((r) => r.data.data),

  start: (id: string) =>
    api.post<ApiResponse<Campaign>>(`/outbound/campaigns/${id}/start`).then((r) => r.data.data),

  getAnalytics: (id: string) =>
    api.get<ApiResponse<Record<string, unknown>>>(`/outbound/campaigns/${id}/analytics`).then((r) => r.data.data),
};
