/**
 * Survey hooks
 */

import { useQuery } from '@tanstack/react-query';
import { surveyService } from '../services/surveyService';

export const useSurveySections = () =>
  useQuery({
    queryKey: ['survey-sections'],
    queryFn: () => surveyService.getSections(),
  });

export const useSurveyQuestions = (sectionId: string) =>
  useQuery({
    queryKey: ['survey-questions', sectionId],
    queryFn: () => surveyService.getQuestions(sectionId),
    enabled: !!sectionId,
  });
