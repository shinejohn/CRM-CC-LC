/**
 * Subscription plan-change hooks: active subscription, proration preview,
 * upgrade and downgrade mutations.
 * Backed by subscriptionApi (src/services/learning/subscription-api.ts).
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  subscriptionApi,
  type ActiveSubscription,
  type ProrationPreview,
  type SubscriptionPlan,
} from '@/services/learning/subscription-api';

export const useActiveSubscription = () =>
  useQuery<ActiveSubscription | null>({
    queryKey: ['subscription', 'active'],
    queryFn: () => subscriptionApi.active(),
  });

export const useSubscriptionPlans = () =>
  useQuery<SubscriptionPlan[]>({
    queryKey: ['subscription', 'plans'],
    queryFn: () => subscriptionApi.plans(),
  });

export const useProrationPreview = (targetServiceId: string | null | undefined) =>
  useQuery<ProrationPreview>({
    queryKey: ['subscription', 'prorate', targetServiceId],
    queryFn: () => subscriptionApi.prorate(targetServiceId as string),
    enabled: !!targetServiceId,
  });

export const useUpgradeSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionId, targetServiceId }: { subscriptionId: string; targetServiceId: string }) =>
      subscriptionApi.upgrade(subscriptionId, targetServiceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription'] });
      qc.invalidateQueries({ queryKey: ['billing'] });
    },
  });
};

export const useDowngradeSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subscriptionId, targetServiceId }: { subscriptionId: string; targetServiceId: string }) =>
      subscriptionApi.downgrade(subscriptionId, targetServiceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription'] });
      qc.invalidateQueries({ queryKey: ['billing'] });
    },
  });
};
