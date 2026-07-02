/**
 * Alert operations
 */

import type { AxiosResponse } from 'axios';
import { apiClient } from '@/services/api';
import type { Alert, AlertCategory } from '../types/alert';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const alertService = {
  list: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<Alert>>('/v1/alerts', { params }).then((r: AxiosResponse<PaginatedResponse<Alert>>) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Alert>>(`/v1/alerts/${id}`).then((r: AxiosResponse<ApiResponse<Alert>>) => r.data.data),

  create: (data: Partial<Alert>) =>
    apiClient.post<ApiResponse<Alert>>('/v1/alerts', data).then((r: AxiosResponse<ApiResponse<Alert>>) => r.data.data),

  update: (id: string, data: Partial<Alert>) =>
    apiClient.put<ApiResponse<Alert>>(`/v1/alerts/${id}`, data).then((r: AxiosResponse<ApiResponse<Alert>>) => r.data.data),

  delete: (id: string) => apiClient.delete(`/v1/alerts/${id}`),

  send: (id: string) =>
    apiClient.post<ApiResponse<Alert>>(`/v1/alerts/${id}/send`).then((r: AxiosResponse<ApiResponse<Alert>>) => r.data.data),

  getCategories: () =>
    apiClient.get<ApiResponse<AlertCategory[]>>('/v1/alerts/categories').then((r: AxiosResponse<ApiResponse<AlertCategory[]>>) => r.data.data ?? r.data),
};
