/**
 * Community operations for Command Center
 */

import api from './api';
import type { ApiResponse, PaginatedResponse } from '../types/common';

export interface Community {
  id: string;
  name: string;
  slug?: string;
  state?: string;
  county?: string;
  population?: number;
  timezone?: string;
  settings?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface CommunityBusiness {
  id: string;
  business_name: string;
  community_id: string;
  category?: string;
  campaign_status?: string;
  engagement_tier?: number;
  profile_completeness?: number;
  [key: string]: unknown;
}

export interface CommunityListFilters {
  state?: string;
  per_page?: number;
  page?: number;
}

export interface CommunityBusinessFilters {
  engagement_tier?: number;
  campaign_status?: string;
  category?: string;
  profile_completeness_min?: number;
  per_page?: number;
  page?: number;
}

export const communityService = {
  list: (filters?: CommunityListFilters) =>
    api
      .get<PaginatedResponse<Community>>('/communities', { params: filters })
      .then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<Community>>(`/communities/${id}`).then((r) => r.data.data),

  getBusinesses: (communityId: string, filters?: CommunityBusinessFilters) =>
    api
      .get<PaginatedResponse<CommunityBusiness>>(`/communities/${communityId}/businesses`, {
        params: filters,
      })
      .then((r) => r.data),
};
