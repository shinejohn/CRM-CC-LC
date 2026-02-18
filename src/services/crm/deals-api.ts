// ============================================
// CRM DEALS API - Pipeline, CRUD, Stage Transitions
// ============================================

import { apiClient } from '../learning/api-client';

export type DealStage = 'hook' | 'engagement' | 'sales' | 'retention' | 'won' | 'lost';

export interface Deal {
  id: string;
  tenant_id: string;
  customer_id: string;
  contact_id?: string;
  name: string;
  value: string | number;
  stage: DealStage;
  probability: number;
  loss_reason?: string;
  notes?: string;
  expected_close_at?: string;
  closed_at?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  customer?: { id: string; business_name: string };
  contact?: { id: string; name: string; email?: string };
  activities?: unknown[];
}

export interface PipelineByStage {
  hook: Deal[];
  engagement: Deal[];
  sales: Deal[];
  retention: Deal[];
  won: Deal[];
  lost: Deal[];
}

export const dealsApi = {
  /** Get deals grouped by stage for kanban pipeline */
  pipeline: async (): Promise<PipelineByStage> => {
    const res = await apiClient.get<{ data: PipelineByStage }>('/api/v1/deals/pipeline');
    return res.data;
  },

  /** List deals with filters */
  list: async (params?: {
    stage?: DealStage;
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
    return apiClient.get<{ data: Deal[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }>(
      `/api/v1/deals${query ? `?${query}` : ''}`
    );
  },

  /** Get single deal */
  get: async (id: string): Promise<Deal> => {
    const res = await apiClient.get<{ data: Deal }>(`/api/v1/deals/${id}`);
    return res.data;
  },

  /** Create deal */
  create: async (data: { customer_id: string; contact_id?: string; name: string; value?: number; stage?: DealStage; notes?: string; expected_close_at?: string }): Promise<Deal> => {
    const res = await apiClient.post<{ data: Deal }>('/api/v1/deals', data);
    return res.data;
  },

  /** Update deal */
  update: async (id: string, data: Partial<{ contact_id: string; name: string; value: number; notes: string; expected_close_at: string }>): Promise<Deal> => {
    const res = await apiClient.put<{ data: Deal }>(`/api/v1/deals/${id}`, data);
    return res.data;
  },

  /** Transition deal stage (for drag-drop, won, lost) */
  transition: async (id: string, stage: DealStage, loss_reason?: string): Promise<Deal> => {
    const res = await apiClient.post<{ data: Deal }>(`/api/v1/deals/${id}/transition`, { stage, loss_reason });
    return res.data;
  },

  /** Delete deal */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/deals/${id}`);
  },
};
