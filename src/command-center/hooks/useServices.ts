import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.service';

export interface Subscription {
  id: string;
  serviceId: string;
  serviceName: string;
  status: 'active' | 'pending' | 'cancelled' | 'past_due';
  tier: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  usage: {
    current: number;
    limit: number;
    unit: string;
  };
  nextBillingDate: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  tiers: ServiceTier[];
}

export interface ServiceTier {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  features: string[];
  popular?: boolean;
}

export interface Invoice {
  id: string;
  subscriptionId: string | null;
  serviceName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  invoiceNumber: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BillingSummary {
  monthlyCost: number;
  usagePercent: number;
  outstanding: number;
  nextBillingDate: string;
}

interface CheckoutResponse {
  session_id: string;
  url: string;
  order_id: string;
}

interface UseServicesReturn {
  subscriptions: Subscription[];
  services: Service[];
  invoices: Invoice[];
  billing: BillingSummary;
  isLoading: boolean;
  error: string | null;
  subscribe: (serviceId: string, tierId: string, customerEmail: string) => Promise<void>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  payInvoice: (invoiceId: string) => Promise<void>;
  refreshServices: () => Promise<void>;
}

/** Map backend service (flat) to frontend Service (with tiers) */
function mapBackendServiceToFrontend(raw: {
  id: string;
  name: string;
  description?: string;
  price: number;
  service_tier?: string;
  billing_period?: string;
  category?: { id: string; name: string; slug: string } | null;
  features?: string[] | null;
}): Service {
  const billingCycle = (raw.billing_period === 'annual' ? 'annual' : 'monthly') as 'monthly' | 'annual';
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? '',
    category: raw.category?.name ?? 'General',
    tiers: [
      {
        id: raw.id,
        name: raw.service_tier ? String(raw.service_tier).charAt(0).toUpperCase() + String(raw.service_tier).slice(1) : 'Standard',
        price: Number(raw.price),
        billingCycle,
        features: Array.isArray(raw.features) ? raw.features : [],
        popular: raw.service_tier === 'premium',
      },
    ],
  };
}

export function useServices(): UseServicesReturn {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billing, setBilling] = useState<BillingSummary>({
    monthlyCost: 0,
    usagePercent: 0,
    outstanding: 0,
    nextBillingDate: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServicesData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [subscriptionsRes, servicesRes, invoicesRes, billingRes] = await Promise.all([
        apiService.get<{ data: Subscription[] }>('/v1/subscriptions'),
        apiService.get<{ data: unknown[]; meta?: unknown }>('/v1/services'),
        apiService.get<{ data: Invoice[] }>('/v1/invoices'),
        apiService.get<{ data: BillingSummary }>('/v1/billing/summary'),
      ]);

      const subscriptionsData = Array.isArray(subscriptionsRes.data)
        ? subscriptionsRes.data
        : (subscriptionsRes.data as { data?: Subscription[] })?.data ?? [];
      const rawServices = Array.isArray(servicesRes.data)
        ? servicesRes.data
        : (servicesRes.data as { data?: unknown[] })?.data ?? [];
      const invoicesData = Array.isArray(invoicesRes.data)
        ? invoicesRes.data
        : (invoicesRes.data as { data?: Invoice[] })?.data ?? [];
      const billingData = (billingRes.data as { data?: BillingSummary })?.data ?? billingRes.data;

      setSubscriptions(Array.isArray(subscriptionsData) ? subscriptionsData : []);
      setServices(
        rawServices.map((s: Record<string, unknown>) =>
          mapBackendServiceToFrontend({
            id: String(s.id),
            name: String(s.name),
            description: s.description as string | undefined,
            price: Number(s.price),
            service_tier: s.service_tier as string | undefined,
            billing_period: s.billing_period as string | undefined,
            category: s.category as { id: string; name: string; slug: string } | null | undefined,
            features: s.features as string[] | null | undefined,
          })
        )
      );
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      if (billingData && typeof billingData === 'object' && 'monthlyCost' in billingData) {
        setBilling(billingData as BillingSummary);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services data');
      console.error('Error loading services:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServicesData();
  }, [fetchServicesData]);

  const subscribe = useCallback(
    async (serviceId: string, _tierId: string, customerEmail: string) => {
      const res = await apiService.post<CheckoutResponse>('/v1/orders/checkout', {
        services: [{ service_id: serviceId, quantity: 1 }],
        customer_email: customerEmail,
      });
      if (!res.success || !res.data) {
        throw new Error((res as { error?: { message?: string } }).error?.message ?? 'Checkout failed');
      }
      const data = res.data as CheckoutResponse;
      if (data.url) {
        window.location.href = data.url;
      } else {
        await fetchServicesData();
      }
    },
    [fetchServicesData]
  );

  const cancelSubscription = useCallback(async (subscriptionId: string) => {
    await apiService.delete(`/v1/subscriptions/${subscriptionId}`);
    await fetchServicesData();
  }, [fetchServicesData]);

  const payInvoice = useCallback(async (invoiceId: string) => {
    const res = await apiService.post<{ url?: string }>(`/v1/invoices/${invoiceId}/pay`);
    if (res.success && res.data?.url) {
      window.location.href = (res.data as { url: string }).url;
    } else {
      await fetchServicesData();
    }
  }, [fetchServicesData]);

  return {
    subscriptions,
    services,
    invoices,
    billing,
    isLoading,
    error,
    subscribe,
    cancelSubscription,
    payInvoice,
    refreshServices: fetchServicesData,
  };
}
