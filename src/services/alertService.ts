/**
 * Alert operations
 */

import { apiClient } from '@/services/api';
import type { Alert, AlertCategory } from '../types/alert';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const alertService = {
  list: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<Alert>>('/alerts', { params }).then((r: any) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Alert>>(`/alerts/${id}`).then((r: any) => r.data.data),

  create: (data: Partial<Alert>) =>
    apiClient.post<ApiResponse<Alert>>('/alerts', data).then((r: any) => r.data.data),

  update: (id: string, data: Partial<Alert>) =>
    apiClient.put<ApiResponse<Alert>>(`/alerts/${id}`, data).then((r: any) => r.data.data),

  delete: (id: string) => apiClient.delete(`/alerts/${id}`),

  send: (id: string) =>
    apiClient.post<ApiResponse<Alert>>(`/alerts/${id}/send`).then((r: any) => r.data.data),

  getCategories: () =>
    apiClient.get<ApiResponse<AlertCategory[]>>('/alerts/categories').then((r: any) => r.data.data ?? r.data),
};
