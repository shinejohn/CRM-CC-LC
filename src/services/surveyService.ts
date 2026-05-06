/**
 * Survey operations
 */

import type { AxiosResponse } from 'axios';
import { apiClient } from '@/services/api';
import type { SurveySection, SurveyQuestion } from '../types/survey';
import type { ApiResponse } from '../types/common';

export const surveyService = {
  getSections: () =>
    apiClient.get<ApiResponse<SurveySection[]>>('/survey/sections').then((r: AxiosResponse<ApiResponse<SurveySection[]>>) => r.data.data ?? r.data),

  getSection: (id: string) =>
    apiClient.get<ApiResponse<SurveySection>>(`/survey/sections/${id}`).then((r: AxiosResponse<ApiResponse<SurveySection>>) => r.data.data),

  getQuestions: (sectionId: string) =>
    apiClient.get<ApiResponse<SurveyQuestion[]>>(`/survey/sections/${sectionId}/questions`).then((r: AxiosResponse<ApiResponse<SurveyQuestion[]>>) => r.data.data ?? r.data),

  createSection: (data: Partial<SurveySection>) =>
    apiClient.post<ApiResponse<SurveySection>>('/survey/sections', data).then((r: AxiosResponse<ApiResponse<SurveySection>>) => r.data.data),

  createQuestion: (data: Partial<SurveyQuestion>) =>
    apiClient.post<ApiResponse<SurveyQuestion>>('/survey/questions', data).then((r: AxiosResponse<ApiResponse<SurveyQuestion>>) => r.data.data),
};
