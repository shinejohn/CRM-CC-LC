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
  subscriptionId: string;
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

interface UseServicesReturn {
  subscriptions: Subscription[];
  services: Service[];
  invoices: Invoice[];
  billing: BillingSummary;
  isLoading: boolean;
  error: string | null;
  subscribe: (serviceId: string, tierId: string) => Promise<void>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  payInvoice: (invoiceId: string) => Promise<void>;
  refreshServices: () => Promise<void>;
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
        apiService.get<{ data: Service[] }>('/v1/services'),
        apiService.get<{ data: Invoice[] }>('/v1/invoices'),
        apiService.get<{ data: BillingSummary }>('/v1/billing/summary'),
      ]);

      // Handle response format: could be { data: T } or T[]
      const subscriptionsData = Array.isArray(subscriptionsRes.data) 
        ? subscriptionsRes.data 
        : (subscriptionsRes.data?.data || []);
      const servicesData = Array.isArray(servicesRes.data)
        ? servicesRes.data
        : (servicesRes.data?.data || []);
      const invoicesData = Array.isArray(invoicesRes.data)
        ? invoicesRes.data
        : (invoicesRes.data?.data || []);
      const billingData = billingRes.data?.data || billingRes.data || billing;
      
      setSubscriptions(Array.isArray(subscriptionsData) ? subscriptionsData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      // Ensure billingData is the correct type
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

  const subscribe = useCallback(async (serviceId: string, tierId: string) => {
    try {
      await apiService.post('/v1/subscriptions', { serviceId, tierId });
      await fetchServicesData();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to subscribe');
    }
  }, [fetchServicesData]);

  const cancelSubscription = useCallback(async (subscriptionId: string) => {
    try {
      await apiService.delete(`/v1/subscriptions/${subscriptionId}`);
      await fetchServicesData();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to cancel subscription');
    }
  }, [fetchServicesData]);

  const payInvoice = useCallback(async (invoiceId: string) => {
    try {
      await apiService.post(`/v1/invoices/${invoiceId}/pay`);
      await fetchServicesData();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to pay invoice');
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

