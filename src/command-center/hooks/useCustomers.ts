import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.service';
import { Customer, CustomerStage } from '@/types/command-center';

interface CustomerFilters {
  stage: CustomerStage | null;
  tags: string[];
  engagementMin: number;
  engagementMax: number;
}

export function useCustomers(filters: CustomerFilters) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = { page: String(page), per_page: '20' };
      if (filters.stage) params.stage = filters.stage;
      if (filters.tags.length) params.tags = filters.tags.join(',');
      if (filters.engagementMin > 0) params.engagement_min = String(filters.engagementMin);
      if (filters.engagementMax < 100) params.engagement_max = String(filters.engagementMax);

      const response = await apiService.get<Customer[]>('/v1/customers', { params });
      if (response.success && response.data) {
        setCustomers(Array.isArray(response.data) ? response.data : []);
        setTotalCount(response.meta?.total || 0);
      } else {
        setError(response.error?.message || 'Failed to load customers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const createCustomer = useCallback(async (data: Partial<Customer>) => {
    const response = await apiService.post<Customer>('/v1/customers', data);
    if (response.success && response.data) {
      setCustomers(prev => [response.data!, ...prev]);
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to create customer');
  }, []);

  const updateCustomer = useCallback(async (id: string, data: Partial<Customer>) => {
    const response = await apiService.put<Customer>(`/v1/customers/${id}`, data);
    if (response.success && response.data) {
      setCustomers(prev => prev.map(c => c.id === id ? response.data! : c));
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to update customer');
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    const response = await apiService.delete(`/v1/customers/${id}`);
    if (response.success) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    } else {
      throw new Error(response.error?.message || 'Failed to delete customer');
    }
  }, []);

  return {
    customers,
    isLoading,
    error,
    totalCount,
    page,
    setPage,
    refreshCustomers: fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
}

export function useCustomer(id: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [customerRes, timelineRes] = await Promise.all([
        apiService.get<Customer>(`/v1/customers/${id}`),
        apiService.get<any[]>(`/v1/customers/${id}/timeline`),
      ]);
      
      if (customerRes.success && customerRes.data) {
        setCustomer(customerRes.data);
      } else {
        setError(customerRes.error?.message || 'Failed to load customer');
      }
      
      if (timelineRes.success && timelineRes.data) {
        setTimeline(Array.isArray(timelineRes.data) ? timelineRes.data : []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [fetchCustomer, id]);

  return {
    customer,
    timeline,
    isLoading,
    error,
    refreshCustomer: fetchCustomer,
  };
}

