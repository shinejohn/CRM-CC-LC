/**
 * Service catalog operations
 */

import api from './api';
import type { Service, ServiceCategory } from '../types/service';
import type { ApiResponse } from '../types/common';

export const serviceService = {
  list: (params?: { type?: string }) =>
    api.get<ApiResponse<Service[]>>('/services', { params }).then((r) => r.data.data ?? r.data),

  get: (id: string) =>
    api.get<ApiResponse<Service>>(`/services/${id}`).then((r) => r.data.data),

  getCategories: () =>
    api.get<ApiResponse<ServiceCategory[]>>('/service-categories').then((r) => r.data.data ?? r.data),

  getCategory: (id: string) =>
    api.get<ApiResponse<ServiceCategory>>(`/service-categories/${id}`).then((r) => r.data.data),
};
