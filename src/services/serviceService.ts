/**
 * Service catalog operations
 */

import type { AxiosResponse } from 'axios';
import { apiClient } from '@/services/api';
import type { Service, ServiceCategory } from '../types/service';
import type { ApiResponse } from '../types/common';

export const serviceService = {
  list: (params?: { type?: string }) =>
    apiClient.get<ApiResponse<Service[]>>('/api/v1/services', { params }).then((r: AxiosResponse<ApiResponse<Service[]>>) => r.data.data ?? r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Service>>(`/api/v1/services/${id}`).then((r: AxiosResponse<ApiResponse<Service>>) => r.data.data),

  getCategories: () =>
    apiClient.get<ApiResponse<ServiceCategory[]>>('/api/v1/service-categories').then((r: AxiosResponse<ApiResponse<ServiceCategory[]>>) => r.data.data ?? r.data),

  getCategory: (id: string) =>
    apiClient.get<ApiResponse<ServiceCategory>>(`/api/v1/service-categories/${id}`).then((r: AxiosResponse<ApiResponse<ServiceCategory>>) => r.data.data),
};
