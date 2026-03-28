/**
 * FAQ CRUD operations
 */

import { apiClient } from '@/services/api';
import type { Knowledge, FaqCategory } from '../types/knowledge';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const faqService = {
  list: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<Knowledge>>('/knowledge', { params }).then((r: any) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Knowledge>>(`/knowledge/${id}`).then((r: any) => r.data.data),

  create: (data: Partial<Knowledge>) =>
    apiClient.post<ApiResponse<Knowledge>>('/knowledge', data).then((r: any) => r.data.data),

  update: (id: string, data: Partial<Knowledge>) =>
    apiClient.put<ApiResponse<Knowledge>>(`/knowledge/${id}`, data).then((r: any) => r.data.data),

  delete: (id: string) => apiClient.delete(`/knowledge/${id}`),

  getCategories: () =>
    apiClient.get<ApiResponse<FaqCategory[]>>('/faq-categories').then((r: any) => r.data.data ?? r.data),

  getCategory: (id: string) =>
    apiClient.get<ApiResponse<FaqCategory>>(`/faq-categories/${id}`).then((r: any) => r.data.data),
};
