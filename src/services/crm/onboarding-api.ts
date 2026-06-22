// ============================================
// ONBOARDING API - Post-purchase checklist
// ============================================

import { apiClient } from '../learning/api-client';

export interface OnboardingStep {
  key: string;
  label: string;
  cta_route: string;
  completed: boolean;
  completed_at: string | null;
}

export interface OnboardingSummary {
  steps: OnboardingStep[];
  complete: boolean;
  percent: number;
}

export const onboardingApi = {
  get: (): Promise<OnboardingSummary> =>
    apiClient.get<OnboardingSummary>('/api/v1/onboarding'),

  completeStep: (step: string): Promise<OnboardingSummary> =>
    apiClient.post<OnboardingSummary>(`/api/v1/onboarding/${encodeURIComponent(step)}/complete`, {}),
};
