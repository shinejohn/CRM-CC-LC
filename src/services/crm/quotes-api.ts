// ============================================
// CRM QUOTES API - Proposals
// ============================================

import { apiClient } from '../learning/api-client';

export interface QuoteItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
  sort_order?: number;
}

export interface Quote {
  id: string;
  tenant_id: string;
  customer_id: string;
  deal_id?: string;
  quote_number: string;
  status: string;
  subtotal: string | number;
  tax: string | number;
  discount: string | number;
  total: string | number;
  tax_rate?: string | number;
  valid_until?: string;
  sent_at?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  customer?: { id: string; business_name: string };
  deal?: { id: string; name: string };
  items?: QuoteItem[];
}

export const quotesApi = {
  list: async (params?: {
    status?: string;
    customer_id?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') searchParams.set(k, String(v));
    });
    const query = searchParams.toString();
    return apiClient.get<{ data: Quote[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }>(
      `/api/v1/quotes${query ? `?${query}` : ''}`
    );
  },

  get: async (id: string): Promise<Quote> => {
    const res = await apiClient.get<{ data: Quote }>(`/api/v1/quotes/${id}`);
    return res.data;
  },

  create: async (data: {
    customer_id: string;
    deal_id?: string;
    tax_rate?: number;
    discount?: number;
    valid_until?: string;
    notes?: string;
    items: { description: string; quantity: number; unit_price: number }[];
  }): Promise<Quote> => {
    const res = await apiClient.post<{ data: Quote }>('/api/v1/quotes', data);
    return res.data;
  },

  update: async (id: string, data: Partial<{
    customer_id: string;
    deal_id: string;
    tax_rate: number;
    discount: number;
    valid_until: string;
    notes: string;
    items: { description: string; quantity: number; unit_price: number }[];
  }>): Promise<Quote> => {
    const res = await apiClient.put<{ data: Quote }>(`/api/v1/quotes/${id}`, data);
    return res.data;
  },

  send: async (id: string): Promise<Quote> => {
    const res = await apiClient.post<{ data: Quote }>(`/api/v1/quotes/${id}/send`, {});
    return res.data;
  },

  convertToInvoice: async (id: string): Promise<unknown> => {
    const res = await apiClient.post<{ data: unknown }>(`/api/v1/quotes/${id}/convert-to-invoice`, {});
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/quotes/${id}`);
  },
};
