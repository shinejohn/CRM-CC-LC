/**
 * Customer CRUD and CRM operations
 */

import api from './api';
import type { Customer, CustomerFilters, CustomerFormData } from '../types/customer';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const customerService = {
  list: (filters?: CustomerFilters) =>
    api.get<PaginatedResponse<Customer>>('/customers', { params: filters }).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<Customer>>(`/customers/${id}`).then((r) => r.data.data),

  create: (data: CustomerFormData) =>
    api.post<ApiResponse<Customer>>('/customers', data).then((r) => r.data.data),

  update: (id: string, data: Partial<CustomerFormData>) =>
    api.put<ApiResponse<Customer>>(`/customers/${id}`, data).then((r) => r.data.data),

  delete: (id: string) => api.delete(`/customers/${id}`),

  getEngagementScore: (id: string) =>
    api.get<ApiResponse<number>>(`/crm/customers/${id}/engagement-score`).then((r) => r.data.data),

  getPredictiveScore: (id: string) =>
    api.get<ApiResponse<number>>(`/crm/customers/${id}/predictive-score`).then((r) => r.data.data),
};
