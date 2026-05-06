/**
 * Subscriber management
 */

import type { AxiosResponse } from 'axios';
import { apiClient } from '@/services/api';
import type { Subscriber, SubscriberPreference } from '../types/subscriber';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const subscriberService = {
  list: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<Subscriber>>('/admin/subscribers', { params }).then((r: AxiosResponse<PaginatedResponse<Subscriber>>) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Subscriber>>(`/admin/subscribers/${id}`).then((r: AxiosResponse<ApiResponse<Subscriber>>) => r.data.data),

  getPreferences: (customerId: string) =>
    apiClient.get<ApiResponse<SubscriberPreference>>(`/personality-contacts/customers/${customerId}/preferences`).then((r: AxiosResponse<ApiResponse<SubscriberPreference>>) => r.data.data),

  updatePreferences: (customerId: string, data: Partial<SubscriberPreference>) =>
    apiClient.put<ApiResponse<SubscriberPreference>>(`/personality-contacts/customers/${customerId}/preferences`, data).then((r: AxiosResponse<ApiResponse<SubscriberPreference>>) => r.data.data),
};
