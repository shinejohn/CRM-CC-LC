/**
 * Newsletter operations
 */

import api from './api';
import type { Newsletter, NewsletterSchedule } from '../types/newsletter';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const newsletterService = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<Newsletter>>('/newsletters', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<Newsletter>>(`/newsletters/${id}`).then((r) => r.data.data),

  create: (data: Partial<Newsletter>) =>
    api.post<ApiResponse<Newsletter>>('/newsletters', data).then((r) => r.data.data),

  update: (id: string, data: Partial<Newsletter>) =>
    api.put<ApiResponse<Newsletter>>(`/newsletters/${id}`, data).then((r) => r.data.data),

  delete: (id: string) => api.delete(`/newsletters/${id}`),

  build: (id: string) =>
    api.post<ApiResponse<Newsletter>>(`/newsletters/${id}/build`).then((r) => r.data.data),

  schedule: (id: string, data: { scheduled_at: string }) =>
    api.post<ApiResponse<NewsletterSchedule>>(`/newsletters/${id}/schedule`, data).then((r) => r.data.data),

  send: (id: string) =>
    api.post<ApiResponse<Newsletter>>(`/newsletters/${id}/send`).then((r) => r.data.data),
};
