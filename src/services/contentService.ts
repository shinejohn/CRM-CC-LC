/**
 * Content generation and management
 */

import type { AxiosResponse } from 'axios';
import { apiClient } from '@/services/api';
import type { GeneratedContent, ContentTemplate } from '../types/content';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const contentService = {
  list: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<GeneratedContent>>('/content', { params }).then((r: AxiosResponse<PaginatedResponse<GeneratedContent>>) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<GeneratedContent>>(`/content/${id}`).then((r: AxiosResponse<ApiResponse<GeneratedContent>>) => r.data.data),

  generate: (data: { template_id?: string; campaign_id?: string; prompt?: string }) =>
    apiClient.post<ApiResponse<GeneratedContent>>('/content/generate', data).then((r: AxiosResponse<ApiResponse<GeneratedContent>>) => r.data.data),

  update: (id: string, data: Partial<{ title: string; body: string; status: string }>) =>
    apiClient.put<ApiResponse<GeneratedContent>>(`/content/${id}`, data).then((r: AxiosResponse<ApiResponse<GeneratedContent>>) => r.data.data),

  getTemplates: () =>
    apiClient.get<ApiResponse<ContentTemplate[]>>('/content/templates').then((r: AxiosResponse<ApiResponse<ContentTemplate[]>>) => r.data.data ?? r.data),
};
