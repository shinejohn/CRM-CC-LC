/**
 * Customer CRUD and CRM operations
 */

import type { AxiosResponse } from 'axios';
import { apiClient } from '@/services/api';
import type { Customer, CustomerFilters, CustomerFormData } from '../types/customer';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const customerService = {
  list: (filters?: CustomerFilters) =>
    apiClient.get<PaginatedResponse<Customer>>('/v1/customers', { params: filters }).then((r: AxiosResponse<PaginatedResponse<Customer>>) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Customer>>(`/v1/customers/${id}`).then((r: AxiosResponse<ApiResponse<Customer>>) => r.data.data),

  create: (data: CustomerFormData) =>
    apiClient.post<ApiResponse<Customer>>('/v1/customers', data).then((r: AxiosResponse<ApiResponse<Customer>>) => r.data.data),

  update: (id: string, data: Partial<CustomerFormData>) =>
    apiClient.put<ApiResponse<Customer>>(`/v1/customers/${id}`, data).then((r: AxiosResponse<ApiResponse<Customer>>) => r.data.data),

  // Customer DELETE is a confirmed soft-delete — backend requires { confirm: true }.
  delete: (id: string) => apiClient.delete(`/v1/customers/${id}`, { data: { confirm: true } }),

  getEngagementScore: (id: string) =>
    apiClient.get<ApiResponse<number>>(`/v1/crm/customers/${id}/engagement-score`).then((r: AxiosResponse<ApiResponse<number>>) => r.data.data),

  getPredictiveScore: (id: string) =>
    apiClient.get<ApiResponse<number>>(`/v1/crm/customers/${id}/predictive-score`).then((r: AxiosResponse<ApiResponse<number>>) => r.data.data),
};
