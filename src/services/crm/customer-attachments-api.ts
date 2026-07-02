// ============================================
// CUSTOMER ATTACHMENTS API - Notes & Files
// Backs /v1/customers/{id}/notes and /files
// ============================================

import { apiClient } from '../learning/api-client';
import { getAuthToken } from '@/services/api';

export interface CustomerNoteAuthor {
  id: string;
  name: string;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  body: string;
  author: CustomerNoteAuthor | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerFile {
  id: string;
  customer_id: string;
  original_name: string;
  mime_type: string | null;
  size: number | null;
  uploaded_by: CustomerNoteAuthor | null;
  created_at: string;
  updated_at: string;
}

export const customerNotesApi = {
  list: async (customerId: string): Promise<CustomerNote[]> => {
    const res = await apiClient.get<{ data: CustomerNote[] }>(
      `/v1/customers/${customerId}/notes`,
    );
    return res.data;
  },

  create: async (customerId: string, body: string): Promise<CustomerNote> => {
    const res = await apiClient.post<{ data: CustomerNote }>(
      `/v1/customers/${customerId}/notes`,
      { body },
    );
    return res.data;
  },

  delete: async (customerId: string, noteId: string): Promise<void> => {
    await apiClient.delete(`/v1/customers/${customerId}/notes/${noteId}`);
  },
};

export const customerFilesApi = {
  list: async (customerId: string): Promise<CustomerFile[]> => {
    const res = await apiClient.get<{ data: CustomerFile[] }>(
      `/v1/customers/${customerId}/files`,
    );
    return res.data;
  },

  upload: async (customerId: string, file: File): Promise<CustomerFile> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.upload<{ data: CustomerFile }>(
      `/v1/customers/${customerId}/files`,
      formData,
    );
    return res.data;
  },

  delete: async (customerId: string, fileId: string): Promise<void> => {
    await apiClient.delete(`/v1/customers/${customerId}/files/${fileId}`);
  },

  /**
   * Fetch the file as a blob, carrying the Bearer auth + tenant headers
   * (a plain anchor link would not include these), then trigger a browser
   * download via an object URL.
   */
  download: async (customerId: string, fileId: string, fileName: string): Promise<void> => {
    const baseUrl = import.meta.env.VITE_API_ENDPOINT || '';
    const headers: Record<string, string> = {};

    const token = getAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(
      `${baseUrl}/v1/customers/${customerId}/files/${fileId}/download`,
      { method: 'GET', headers },
    );

    if (!response.ok) {
      throw new Error(`Failed to download file (${response.status})`);
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(objectUrl);
  },
};
