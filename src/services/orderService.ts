/**
 * Order and checkout operations
 */

import api from './api';
import type { Order } from '../types/service';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const orderService = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<Order>>('/orders', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<Order>>(`/orders/${id}`).then((r) => r.data.data),

  checkout: (data: { items: Array<{ service_id: string; quantity: number }> }) =>
    api.post<ApiResponse<Order>>('/orders/checkout', data).then((r) => r.data.data),
};
