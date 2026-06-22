// ============================================
// CRM INVOICES API - Invoices, Payments, Send
// ============================================

import { apiClient } from '../learning/api-client';

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
  sort_order?: number;
}

export interface InvoicePayment {
  id: string;
  amount: string | number;
  payment_method?: string;
  reference?: string;
  notes?: string;
  paid_at: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  customer_id: string;
  quote_id?: string;
  invoice_number: string;
  status: string;
  subtotal: string | number;
  tax: string | number;
  discount: string | number;
  total: string | number;
  amount_paid: string | number;
  balance_due: string | number;
  due_date?: string;
  sent_at?: string;
  paid_at?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  customer?: { id: string; business_name: string };
  quote?: { id: string; quote_number: string };
  items?: InvoiceItem[];
  payments?: InvoicePayment[];
}

export const invoicesApi = {
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
    return apiClient.get<{ data: Invoice[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }>(
      `/api/v1/crm-invoices${query ? `?${query}` : ''}`
    );
  },

  get: async (id: string): Promise<Invoice> => {
    const res = await apiClient.get<{ data: Invoice }>(`/api/v1/crm-invoices/${id}`);
    return res.data;
  },

  create: async (data: {
    customer_id: string;
    quote_id?: string;
    tax_rate?: number;
    discount?: number;
    due_date?: string;
    notes?: string;
    items: { description: string; quantity: number; unit_price: number }[];
  }): Promise<Invoice> => {
    const res = await apiClient.post<{ data: Invoice }>('/api/v1/crm-invoices', data);
    return res.data;
  },

  update: async (id: string, data: Partial<{
    customer_id: string;
    quote_id: string;
    tax_rate: number;
    discount: number;
    due_date: string;
    notes: string;
    items: { description: string; quantity: number; unit_price: number }[];
  }>): Promise<Invoice> => {
    const res = await apiClient.put<{ data: Invoice }>(`/api/v1/crm-invoices/${id}`, data);
    return res.data;
  },

  recordPayment: async (id: string, data: {
    amount: number;
    payment_method?: string;
    reference?: string;
    notes?: string;
  }): Promise<Invoice> => {
    const res = await apiClient.post<{ data: Invoice }>(`/api/v1/crm-invoices/${id}/record-payment`, data);
    return res.data;
  },

  send: async (id: string): Promise<Invoice> => {
    const res = await apiClient.post<{ data: Invoice }>(`/api/v1/crm-invoices/${id}/send`, {});
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/crm-invoices/${id}`);
  },

  /**
   * Fetch the invoice PDF as a blob, carrying the Bearer auth + tenant headers
   * (a plain anchor link would not include these), then trigger a browser
   * download via an object URL.
   */
  pdf: async (id: string, invoiceNumber?: string): Promise<void> => {
    const baseUrl = import.meta.env.VITE_API_ENDPOINT || '';
    const headers: Record<string, string> = { Accept: 'application/pdf' };

    const token = localStorage.getItem('auth_token');
    if (token) headers.Authorization = `Bearer ${token}`;

    const tenantId = localStorage.getItem('tenant_id');
    if (tenantId) headers['X-Tenant-ID'] = tenantId;

    const response = await fetch(`${baseUrl}/api/v1/crm-invoices/${id}/pdf`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to download invoice PDF (${response.status})`);
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `${invoiceNumber ?? id}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(objectUrl);
  },
};
