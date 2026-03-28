/**
 * Customer CRUD and CRM operations
 */

import { apiClient } from '@/services/api';
import type { Customer, CustomerFilters, CustomerFormData } from '../types/customer';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const customerService = {
  list: (filters?: CustomerFilters) =>
    apiClient.get<PaginatedResponse<Customer>>('/customers', { params: filters }).then((r: any) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Customer>>(`/customers/${id}`).then((r: any) => r.data.data),

  create: (data: CustomerFormData) =>
    apiClient.post<ApiResponse<Customer>>('/customers', data).then((r: any) => r.data.data),

  update: (id: string, data: Partial<CustomerFormData>) =>
    apiClient.put<ApiResponse<Customer>>(`/customers/${id}`, data).then((r: any) => r.data.data),

  delete: (id: string) => apiClient.delete(`/customers/${id}`),

  getEngagementScore: (id: string) =>
    apiClient.get<ApiResponse<number>>(`/crm/customers/${id}/engagement-score`).then((r: any) => r.data.data),

  getPredictiveScore: (id: string) =>
    apiClient.get<ApiResponse<number>>(`/crm/customers/${id}/predictive-score`).then((r: any) => r.data.data),
};
