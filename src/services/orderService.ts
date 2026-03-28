/**
 * Order and checkout operations
 */

import { apiClient } from '@/services/api';
import type { Order } from '../types/service';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const orderService = {
  list: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<Order>>('/orders', { params }).then((r: any) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/orders/${id}`).then((r: any) => r.data.data),

  checkout: (data: { items: Array<{ service_id: string; quantity: number }> }) =>
    apiClient.post<ApiResponse<Order>>('/orders/checkout', data).then((r: any) => r.data.data),
};
