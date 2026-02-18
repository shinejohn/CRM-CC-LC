/**
 * Content generation and management
 */

import api from './api';
import type { GeneratedContent, ContentTemplate } from '../types/content';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const contentService = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<GeneratedContent>>('/content', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<GeneratedContent>>(`/content/${id}`).then((r) => r.data.data),

  generate: (data: { template_id?: string; campaign_id?: string; prompt?: string }) =>
    api.post<ApiResponse<GeneratedContent>>('/content/generate', data).then((r) => r.data.data),

  update: (id: string, data: Partial<{ title: string; body: string; status: string }>) =>
    api.put<ApiResponse<GeneratedContent>>(`/content/${id}`, data).then((r) => r.data.data),

  getTemplates: () =>
    api.get<ApiResponse<ContentTemplate[]>>('/content/templates').then((r) => r.data.data ?? r.data),
};
