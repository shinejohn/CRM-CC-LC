/**
 * Customer (SMB) AI Recommendations Service
 * GET /v1/customers/{id}/recommendations
 */

import { apiClient } from '@/services/api';
import type { ApiResponse } from '../types/common';

export interface AIRecommendation {
  priority: 'high' | 'medium' | 'opportunity';
  category: string;
  title: string;
  impact: string;
  description: string;
  actions: string[];
}

export const customerRecommendationsService = {
  getForCustomer: (customerId: string) =>
    apiClient
      .get<ApiResponse<AIRecommendation[]>>(`/customers/${customerId}/recommendations`)
      .then((r: any) => r.data.data ?? r.data ?? []),
};
