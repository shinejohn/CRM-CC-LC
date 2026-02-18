/**
 * Survey types
 */

export interface SurveySection {
  id: string;
  name: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface SurveyQuestion {
  id: string;
  section_id: string;
  question: string;
  type: string;
  order: number;
  created_at: string;
}

export interface SurveyResponse {
  id: string;
  question_id: string;
  response: string | number | boolean;
  created_at: string;
}
