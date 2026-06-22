/**
 * Onboarding hooks: fetch the post-purchase checklist + mark a step complete.
 * Backed by onboardingApi (src/services/crm/onboarding-api.ts) → /api/v1/onboarding.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingApi, type OnboardingSummary } from '../services/crm/onboarding-api';

export const useOnboarding = () =>
  useQuery({
    queryKey: ['onboarding'],
    queryFn: () => onboardingApi.get(),
  });

export const useCompleteOnboardingStep = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (step: string): Promise<OnboardingSummary> => onboardingApi.completeStep(step),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['onboarding'] }),
  });
};
