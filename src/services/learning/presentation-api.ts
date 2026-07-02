// ============================================
// PRESENTATION API SERVICE
// ============================================

import { apiClient } from './api-client';
import type { Presentation } from '@/types/learning';

export const presentationApi = {
  getPresentations: async (): Promise<Presentation[]> => {
    // TODO: no backend route (presentation-api getPresentations — /v1/presentations has no index, only templates/{id})
    return apiClient.get<Presentation[]>('/v1/presentations');
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


