// ============================================
// SUBSCRIPTION API - Active plan, proration, upgrade/downgrade
// ============================================

import { apiClient } from './api-client';

export interface ActiveSubscription {
  id: string;
  serviceId: string;
  serviceName: string;
  status: string;
  tier: string;
  price: number;
  billingCycle: string;
  stripeManaged: boolean;
  nextBillingDate: string;
  createdAt: string;
}

export interface ProrationPlanSummary {
  service_id: string | null;
  name: string;
  tier: string | null;
  amount_cents: number;
  billing_cycle: string;
}

export interface ProrationPreview {
  current_plan: ProrationPlanSummary;
  target_plan: ProrationPlanSummary;
  proration_amount_cents: number;
  next_invoice_total_cents: number;
  effective_date: string;
  stripe_preview: boolean;
  direction: 'upgrade' | 'downgrade' | 'unchanged';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  service_tier?: string;
  billing_period?: string;
  is_subscription?: boolean;
  is_featured?: boolean;
  features?: string[] | null;
}

interface RawPlan {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  price?: number | string;
  service_tier?: string;
  billing_period?: string;
  is_subscription?: boolean;
  is_featured?: boolean;
  features?: string[] | null;
}

export const subscriptionApi = {
  active: async (): Promise<ActiveSubscription | null> => {
    const response = await apiClient.get<{ data: ActiveSubscription | null }>('/v1/subscriptions/active');
    return response.data;
  },

  /** Subscription-type plans from the service catalog. */
  plans: async (): Promise<SubscriptionPlan[]> => {
    const response = await apiClient.get<{ data: RawPlan[] }>('/v1/services', {
      params: { is_subscription: true, per_page: 50 },
    });
    return (response.data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: typeof p.price === 'string' ? parseFloat(p.price) : p.price ?? 0,
      service_tier: p.service_tier,
      billing_period: p.billing_period,
      is_subscription: p.is_subscription,
      is_featured: p.is_featured,
      features: p.features,
    }));
  },

  prorate: async (targetServiceId: string): Promise<ProrationPreview> => {
    const response = await apiClient.get<{ data: ProrationPreview }>('/v1/billing/prorate', {
      params: { target_service_id: targetServiceId },
    });
    return response.data;
  },

  upgrade: async (subscriptionId: string, targetServiceId: string): Promise<ActiveSubscription> => {
    const response = await apiClient.post<{ data: ActiveSubscription }>(
      `/v1/subscriptions/${subscriptionId}/upgrade`,
      { target_service_id: targetServiceId },
    );
    return response.data;
  },

  downgrade: async (subscriptionId: string, targetServiceId: string): Promise<ActiveSubscription> => {
    const response = await apiClient.post<{ data: ActiveSubscription }>(
      `/v1/subscriptions/${subscriptionId}/downgrade`,
      { target_service_id: targetServiceId },
    );
    return response.data;
  },
};
