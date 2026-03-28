/**
 * Subscriber management
 */

import { apiClient } from '@/services/api';
import type { Subscriber, SubscriberPreference } from '../types/subscriber';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const subscriberService = {
  list: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<Subscriber>>('/admin/subscribers', { params }).then((r: any) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Subscriber>>(`/admin/subscribers/${id}`).then((r: any) => r.data.data),

  getPreferences: (customerId: string) =>
    apiClient.get<ApiResponse<SubscriberPreference>>(`/personality-contacts/customers/${customerId}/preferences`).then((r: any) => r.data.data),

  updatePreferences: (customerId: string, data: Partial<SubscriberPreference>) =>
    apiClient.put<ApiResponse<SubscriberPreference>>(`/personality-contacts/customers/${customerId}/preferences`, data).then((r: any) => r.data.data),
};
