/**
 * Customer (SMB) AI Recommendations Service
 * GET /v1/customers/{id}/recommendations
 */

import api from './api';
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
    api
      .get<ApiResponse<AIRecommendation[]>>(`/customers/${customerId}/recommendations`)
      .then((r) => r.data.data ?? r.data ?? []),
};
