// ============================================
// ORDER API - Order Management
// ============================================

import { apiClient, type PaginatedResponse } from './api-client';

export interface OrderItem {
  id: string;
  service_id?: string;
  service_name: string;
  service_description?: string;
  price: number;
  quantity: number;
  total: number;
  service?: {
    id: string;
    name: string;
    slug: string;
    images?: string[];
  };
}

export interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  shipping_address?: Record<string, unknown>;
  billing_address?: Record<string, unknown>;
  notes?: string;
  paid_at?: string;
  created_at: string;
  items: OrderItem[];
}

export interface CheckoutRequest {
  services: Array<{
    service_id: string;
    quantity: number;
  }>;
  customer_email: string;
  customer_name?: string;
  customer_id?: string;
  success_url?: string;
  cancel_url?: string;
}

export interface CheckoutResponse {
  session_id: string;
  url: string;
  order_id: string;
}

export const orderApi = {
  /**
   * List orders
   */
  list: async (filters?: {
    status?: string;
    payment_status?: string;
    per_page?: number;
  }): Promise<PaginatedResponse<Order>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.payment_status) params.append('payment_status', filters.payment_status);
    if (filters?.per_page) params.append('per_page', String(filters.per_page));
    
    const query = params.toString();
    return apiClient.get<PaginatedResponse<Order>>(`/v1/orders${query ? '?' + query : ''}`);
  },

  /**
   * Get order details
   */
  get: async (id: string): Promise<Order> => {
    const response = await apiClient.get<{ data: Order }>(`/v1/orders/${id}`);
    return response.data;
  },

  /**
   * Create checkout session
   */
  checkout: async (request: CheckoutRequest): Promise<CheckoutResponse> => {
    return apiClient.post<CheckoutResponse>('/v1/orders/checkout', request);
  },
};
