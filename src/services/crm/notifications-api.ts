// ============================================
// CRM NOTIFICATIONS API
// ============================================

import { apiClient } from '../learning/api-client';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'message';

export interface Notification {
  id: string;
  tenant_id: string;
  user_id?: string;
  type: NotificationType;
  category?: string;
  title: string;
  message: string;
  read: boolean;
  read_at?: string;
  important: boolean;
  archived: boolean;
  action_label?: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const notificationsApi = {
  list: async (params?: {
    unread_only?: boolean;
    important_only?: boolean;
    archived_only?: boolean;
    per_page?: number;
    page?: number;
  }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') searchParams.set(k, String(v));
    });
    const query = searchParams.toString();
    return apiClient.get<{
      data: Notification[];
      meta: { current_page: number; last_page: number; per_page: number; total: number; unread_count: number };
    }>(`/api/v1/notifications${query ? `?${query}` : ''}`);
  },

  markRead: async (id: string): Promise<Notification> => {
    const res = await apiClient.post<{ data: Notification }>(`/api/v1/notifications/${id}/mark-read`, {});
    return res.data;
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.post('/api/v1/notifications/mark-all-read', {});
  },

  toggleImportant: async (id: string): Promise<Notification> => {
    const res = await apiClient.post<{ data: Notification }>(`/api/v1/notifications/${id}/toggle-important`, {});
    return res.data;
  },

  archive: async (id: string): Promise<Notification> => {
    const res = await apiClient.post<{ data: Notification }>(`/api/v1/notifications/${id}/archive`, {});
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/notifications/${id}`);
  },
};
