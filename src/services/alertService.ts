/**
 * Alert operations
 */

import api from './api';
import type { Alert, AlertCategory } from '../types/alert';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const alertService = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<Alert>>('/alerts', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<Alert>>(`/alerts/${id}`).then((r) => r.data.data),

  create: (data: Partial<Alert>) =>
    api.post<ApiResponse<Alert>>('/alerts', data).then((r) => r.data.data),

  update: (id: string, data: Partial<Alert>) =>
    api.put<ApiResponse<Alert>>(`/alerts/${id}`, data).then((r) => r.data.data),

  delete: (id: string) => api.delete(`/alerts/${id}`),

  send: (id: string) =>
    api.post<ApiResponse<Alert>>(`/alerts/${id}/send`).then((r) => r.data.data),

  getCategories: () =>
    api.get<ApiResponse<AlertCategory[]>>('/alerts/categories').then((r) => r.data.data ?? r.data),
};
