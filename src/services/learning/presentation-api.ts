// ============================================
// PRESENTATION API SERVICE
// ============================================

import { apiClient } from './api-client';
import type { Presentation } from '@/types/learning';

export const presentationApi = {
  getPresentations: async (): Promise<Presentation[]> => {
    return apiClient.get<Presentation[]>('/learning/presentations');
  },

  getPresentation: async (id: string): Promise<Presentation> => {
    return apiClient.get<Presentation>(`/learning/presentations/${id}`);
  },

  createPresentation: async (data: Partial<Presentation>): Promise<Presentation> => {
    return apiClient.post<Presentation>('/learning/presentations', data);
  },

  generateAudio: async (id: string): Promise<{ job_id: string; status: string }> => {
    return apiClient.post<{ job_id: string; status: string }>(
      `/learning/presentations/${id}/generate-audio`
    );
  },
};


