/**
 * Subscriber management
 */

import api from './api';
import type { Subscriber, SubscriberPreference } from '../types/subscriber';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const subscriberService = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<Subscriber>>('/admin/subscribers', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<Subscriber>>(`/admin/subscribers/${id}`).then((r) => r.data.data),

  getPreferences: (customerId: string) =>
    api.get<ApiResponse<SubscriberPreference>>(`/personality-contacts/customers/${customerId}/preferences`).then((r) => r.data.data),

  updatePreferences: (customerId: string, data: Partial<SubscriberPreference>) =>
    api.put<ApiResponse<SubscriberPreference>>(`/personality-contacts/customers/${customerId}/preferences`, data).then((r) => r.data.data),
};
