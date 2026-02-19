// ============================================
// BILLING API - Payment history, invoices
// ============================================

import { apiClient, type PaginatedResponse } from './api-client';

export interface BillingSummary {
  monthlyCost: number;
  usagePercent: number;
  outstanding: number;
  nextBillingDate: string;
}

export interface Invoice {
  id: string;
  subscriptionId: string | null;
  serviceName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  invoiceNumber: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export const billingApi = {
  summary: async (): Promise<BillingSummary> => {
    const response = await apiClient.get<{ data: BillingSummary }>('/v1/billing/summary');
    return (response as { data: BillingSummary }).data;
  },

  invoices: async (params?: { per_page?: number }): Promise<PaginatedResponse<Invoice>> => {
    const query = params?.per_page ? `?per_page=${params.per_page}` : '';
    const response = await apiClient.get<PaginatedResponse<Invoice>>(`/v1/invoices${query}`);
    return response as PaginatedResponse<Invoice>;
  },

  payInvoice: async (invoiceId: string): Promise<{ url: string; session_id?: string }> => {
    return apiClient.post<{ url: string; session_id?: string }>(`/v1/invoices/${invoiceId}/pay`, {});
  },
};
