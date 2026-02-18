/**
 * Survey operations
 */

import api from './api';
import type { SurveySection, SurveyQuestion } from '../types/survey';
import type { ApiResponse } from '../types/common';

export const surveyService = {
  getSections: () =>
    api.get<ApiResponse<SurveySection[]>>('/survey/sections').then((r) => r.data.data ?? r.data),

  getSection: (id: string) =>
    api.get<ApiResponse<SurveySection>>(`/survey/sections/${id}`).then((r) => r.data.data),

  getQuestions: (sectionId: string) =>
    api.get<ApiResponse<SurveyQuestion[]>>(`/survey/sections/${sectionId}/questions`).then((r) => r.data.data ?? r.data),

  createSection: (data: Partial<SurveySection>) =>
    api.post<ApiResponse<SurveySection>>('/survey/sections', data).then((r) => r.data.data),

  createQuestion: (data: Partial<SurveyQuestion>) =>
    api.post<ApiResponse<SurveyQuestion>>('/survey/questions', data).then((r) => r.data.data),
};
