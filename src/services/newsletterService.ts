/**
 * Newsletter operations
 */

import type { AxiosResponse } from 'axios';
import { apiClient } from '@/services/api';
import type { Newsletter, NewsletterSchedule } from '../types/newsletter';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const newsletterService = {
  list: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<Newsletter>>('/v1/newsletters', { params }).then((r: AxiosResponse<PaginatedResponse<Newsletter>>) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Newsletter>>(`/v1/newsletters/${id}`).then((r: AxiosResponse<ApiResponse<Newsletter>>) => r.data.data),

  create: (data: Partial<Newsletter>) =>
    apiClient.post<ApiResponse<Newsletter>>('/v1/newsletters', data).then((r: AxiosResponse<ApiResponse<Newsletter>>) => r.data.data),

  update: (id: string, data: Partial<Newsletter>) =>
    apiClient.put<ApiResponse<Newsletter>>(`/v1/newsletters/${id}`, data).then((r: AxiosResponse<ApiResponse<Newsletter>>) => r.data.data),

  delete: (id: string) => apiClient.delete(`/v1/newsletters/${id}`),

  build: (id: string) =>
    apiClient.post<ApiResponse<Newsletter>>(`/v1/newsletters/${id}/build`).then((r: AxiosResponse<ApiResponse<Newsletter>>) => r.data.data),

  schedule: (id: string, data: { scheduled_at: string }) =>
    apiClient.post<ApiResponse<NewsletterSchedule>>(`/v1/newsletters/${id}/schedule`, data).then((r: AxiosResponse<ApiResponse<NewsletterSchedule>>) => r.data.data),

  send: (id: string) =>
    apiClient.post<ApiResponse<Newsletter>>(`/v1/newsletters/${id}/send`).then((r: AxiosResponse<ApiResponse<Newsletter>>) => r.data.data),
};
