/**
 * Newsletter operations
 */

import type { AxiosResponse } from 'axios';
import { apiClient } from '@/services/api';
import type { Newsletter, NewsletterSchedule } from '../types/newsletter';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const newsletterService = {
  list: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<Newsletter>>('/newsletters', { params }).then((r: AxiosResponse<PaginatedResponse<Newsletter>>) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Newsletter>>(`/newsletters/${id}`).then((r: AxiosResponse<ApiResponse<Newsletter>>) => r.data.data),

  create: (data: Partial<Newsletter>) =>
    apiClient.post<ApiResponse<Newsletter>>('/newsletters', data).then((r: AxiosResponse<ApiResponse<Newsletter>>) => r.data.data),

  update: (id: string, data: Partial<Newsletter>) =>
    apiClient.put<ApiResponse<Newsletter>>(`/newsletters/${id}`, data).then((r: AxiosResponse<ApiResponse<Newsletter>>) => r.data.data),

  delete: (id: string) => apiClient.delete(`/newsletters/${id}`),

  build: (id: string) =>
    apiClient.post<ApiResponse<Newsletter>>(`/newsletters/${id}/build`).then((r: AxiosResponse<ApiResponse<Newsletter>>) => r.data.data),

  schedule: (id: string, data: { scheduled_at: string }) =>
    apiClient.post<ApiResponse<NewsletterSchedule>>(`/newsletters/${id}/schedule`, data).then((r: AxiosResponse<ApiResponse<NewsletterSchedule>>) => r.data.data),

  send: (id: string) =>
    apiClient.post<ApiResponse<Newsletter>>(`/newsletters/${id}/send`).then((r: AxiosResponse<ApiResponse<Newsletter>>) => r.data.data),
};
