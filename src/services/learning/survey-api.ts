// ============================================
// SURVEY API SERVICE
// ============================================
// Wires to /v1/survey/*

import { apiClient } from './api-client';
import type { SurveySection, SurveyQuestion } from '@/types/learning';

function unwrapData<T>(res: { data?: T } | T): T {
  if (res && typeof res === 'object' && 'data' in res && res.data !== undefined) {
    return res.data as T;
  }
  return res as T;
}

export const surveyApi = {
  // Sections
  getSections: async (): Promise<SurveySection[]> => {
    const res = await apiClient.get<{ data: SurveySection[] }>('/v1/survey/sections');
    return unwrapData(res) ?? [];
  },

  createSection: async (data: Partial<SurveySection>): Promise<SurveySection> => {
    const res = await apiClient.post<{ data: SurveySection }>('/v1/survey/sections', data);
    return unwrapData(res) as SurveySection;
  },

  updateSection: async (id: string, data: Partial<SurveySection>): Promise<SurveySection> => {
    const res = await apiClient.put<{ data: SurveySection }>(`/v1/survey/sections/${id}`, data);
    return unwrapData(res) as SurveySection;
  },

  deleteSection: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/survey/sections/${id}`);
  },

  reorderSections: async (_sectionIds: string[]): Promise<void> => {
    // Backend has no reorder endpoint; no-op
  },

  // Questions
  getQuestions: async (sectionId?: string): Promise<SurveyQuestion[]> => {
    if (!sectionId) {
      const sections = await surveyApi.getSections();
      const allQuestions: SurveyQuestion[] = [];
      for (const s of sections) {
        const res = await apiClient.get<{ data: SurveyQuestion[] }>(`/v1/survey/sections/${s.id}/questions`);
        allQuestions.push(...(unwrapData(res) ?? []));
      }
      return allQuestions;
    }
    const res = await apiClient.get<{ data: SurveyQuestion[] }>(`/v1/survey/sections/${sectionId}/questions`);
    return unwrapData(res) ?? [];
  },

  createQuestion: async (data: Partial<SurveyQuestion>): Promise<SurveyQuestion> => {
    const res = await apiClient.post<{ data: SurveyQuestion }>('/v1/survey/questions', data);
    return unwrapData(res) as SurveyQuestion;
  },

  updateQuestion: async (id: string, data: Partial<SurveyQuestion>): Promise<SurveyQuestion> => {
    const res = await apiClient.put<{ data: SurveyQuestion }>(`/v1/survey/questions/${id}`, data);
    return unwrapData(res) as SurveyQuestion;
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/survey/questions/${id}`);
  },

  reorderQuestions: async (_questionIds: string[]): Promise<void> => {
    // Backend has no reorder endpoint; no-op
  },

  // Analytics (stub - backend may not have this)
  getAnalytics: async (): Promise<{
    avg_completion: number;
    section_completion: Array<{ section_id: string; completion: number }>;
    most_completed: string[];
    least_completed: string[];
  }> => {
    return {
      avg_completion: 0,
      section_completion: [],
      most_completed: [],
      least_completed: [],
    };
  },
};


