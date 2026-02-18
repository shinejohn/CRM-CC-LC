/**
 * FAQ CRUD operations
 */

import api from './api';
import type { Knowledge, FaqCategory } from '../types/knowledge';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const faqService = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<Knowledge>>('/knowledge', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<Knowledge>>(`/knowledge/${id}`).then((r) => r.data.data),

  create: (data: Partial<Knowledge>) =>
    api.post<ApiResponse<Knowledge>>('/knowledge', data).then((r) => r.data.data),

  update: (id: string, data: Partial<Knowledge>) =>
    api.put<ApiResponse<Knowledge>>(`/knowledge/${id}`, data).then((r) => r.data.data),

  delete: (id: string) => api.delete(`/knowledge/${id}`),

  getCategories: () =>
    api.get<ApiResponse<FaqCategory[]>>('/faq-categories').then((r) => r.data.data ?? r.data),

  getCategory: (id: string) =>
    api.get<ApiResponse<FaqCategory>>(`/faq-categories/${id}`).then((r) => r.data.data),
};
