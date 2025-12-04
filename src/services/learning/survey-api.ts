// ============================================
// SURVEY API SERVICE
// ============================================

import { apiClient, PaginatedResponse } from './api-client';
import type { SurveySection, SurveyQuestion } from '@/types/learning';

export const surveyApi = {
  // Sections
  getSections: async (): Promise<SurveySection[]> => {
    return apiClient.get<SurveySection[]>('/learning/survey/sections');
  },

  createSection: async (data: Partial<SurveySection>): Promise<SurveySection> => {
    return apiClient.post<SurveySection>('/learning/survey/sections', data);
  },

  updateSection: async (id: string, data: Partial<SurveySection>): Promise<SurveySection> => {
    return apiClient.put<SurveySection>(`/learning/survey/sections/${id}`, data);
  },

  deleteSection: async (id: string): Promise<void> => {
    return apiClient.delete(`/learning/survey/sections/${id}`);
  },

  reorderSections: async (sectionIds: string[]): Promise<void> => {
    return apiClient.post('/learning/survey/sections/reorder', { section_ids: sectionIds });
  },

  // Questions
  getQuestions: async (sectionId?: string): Promise<SurveyQuestion[]> => {
    const url = sectionId
      ? `/learning/survey/questions?section_id=${sectionId}`
      : '/learning/survey/questions';
    return apiClient.get<SurveyQuestion[]>(url);
  },

  createQuestion: async (data: Partial<SurveyQuestion>): Promise<SurveyQuestion> => {
    return apiClient.post<SurveyQuestion>('/learning/survey/questions', data);
  },

  updateQuestion: async (id: string, data: Partial<SurveyQuestion>): Promise<SurveyQuestion> => {
    return apiClient.put<SurveyQuestion>(`/learning/survey/questions/${id}`, data);
  },

  deleteQuestion: async (id: string): Promise<void> => {
    return apiClient.delete(`/learning/survey/questions/${id}`);
  },

  reorderQuestions: async (questionIds: string[]): Promise<void> => {
    return apiClient.post('/learning/survey/questions/reorder', { question_ids: questionIds });
  },

  // Analytics
  getAnalytics: async (): Promise<{
    avg_completion: number;
    section_completion: Array<{ section_id: string; completion: number }>;
    most_completed: string[];
    least_completed: string[];
  }> => {
    return apiClient.get('/learning/survey/analytics');
  },
};


