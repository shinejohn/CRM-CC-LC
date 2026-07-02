// ============================================
// PRESENTATION API SERVICE
// ============================================

import { apiClient } from './api-client';
import type { Presentation } from '@/types/learning';

export const presentationApi = {
  getPresentations: async (): Promise<Presentation[]> => {
    // Index returns the { data, meta } envelope; unwrap to the presentations array.
    const response = await apiClient.get<{ data: Presentation[] }>('/v1/presentations');
    return response.data;
  },

  getPresentation: async (id: string): Promise<Presentation> => {
    return apiClient.get<Presentation>(`/v1/presentations/${id}`);
  },

  createPresentation: async (data: Partial<Presentation>): Promise<Presentation> => {
    return apiClient.post<Presentation>('/v1/presentations/generate', data);
  },

  generateAudio: async (id: string): Promise<{ job_id: string; status: string }> => {
    return apiClient.post<{ job_id: string; status: string }>(
      `/v1/presentations/${id}/audio`
    );
  },
};


