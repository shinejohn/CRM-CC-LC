/**
 * FAQ CRUD operations
 */

import type { AxiosResponse } from 'axios';
import { apiClient } from '@/services/api';
import type { Knowledge, FaqCategory } from '../types/knowledge';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const faqService = {
  list: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<Knowledge>>('/v1/knowledge', { params }).then((r: AxiosResponse<PaginatedResponse<Knowledge>>) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Knowledge>>(`/v1/knowledge/${id}`).then((r: AxiosResponse<ApiResponse<Knowledge>>) => r.data.data),

  create: (data: Partial<Knowledge>) =>
    apiClient.post<ApiResponse<Knowledge>>('/v1/knowledge', data).then((r: AxiosResponse<ApiResponse<Knowledge>>) => r.data.data),

  update: (id: string, data: Partial<Knowledge>) =>
    apiClient.put<ApiResponse<Knowledge>>(`/v1/knowledge/${id}`, data).then((r: AxiosResponse<ApiResponse<Knowledge>>) => r.data.data),

  delete: (id: string) => apiClient.delete(`/v1/knowledge/${id}`),

  getCategories: () =>
    apiClient.get<ApiResponse<FaqCategory[]>>('/v1/faq-categories').then((r: AxiosResponse<ApiResponse<FaqCategory[]>>) => r.data.data ?? r.data),

  getCategory: (id: string) =>
    apiClient.get<ApiResponse<FaqCategory>>(`/v1/faq-categories/${id}`).then((r: AxiosResponse<ApiResponse<FaqCategory>>) => r.data.data),
};
