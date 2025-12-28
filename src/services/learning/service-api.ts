// ============================================
// SERVICE API - Service Catalog
// ============================================

import { apiClient, type PaginatedResponse } from './api-client';

export interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string;
  long_description?: string;
  images?: string[];
  price: number;
  compare_at_price?: number;
  discount_percentage?: number;
  service_type?: string; // 'day.news', 'goeventcity', 'downtownsguide', 'golocalvoices', 'alphasite', 'fibonacco'
  service_tier?: string; // 'basic', 'standard', 'premium', 'enterprise'
  is_subscription: boolean;
  billing_period?: string; // 'monthly', 'annual', 'one-time'
  features?: string[];
  capabilities?: string[];
  integrations?: string[];
  is_in_stock: boolean;
  sku?: string;
  is_featured: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
}

export interface ServiceFilters {
  category_id?: string;
  service_type?: string;
  service_tier?: string;
  is_subscription?: boolean;
  search?: string;
  per_page?: number;
}

export const serviceApi = {
  /**
   * List all services
   */
  list: async (filters?: ServiceFilters): Promise<PaginatedResponse<Service>> => {
    const params = new URLSearchParams();
    if (filters?.category_id) params.append('category_id', filters.category_id);
    if (filters?.service_type) params.append('service_type', filters.service_type);
    if (filters?.service_tier) params.append('service_tier', filters.service_tier);
    if (filters?.is_subscription !== undefined) params.append('is_subscription', String(filters.is_subscription));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.per_page) params.append('per_page', String(filters.per_page));
    
    const query = params.toString();
    return apiClient.get<PaginatedResponse<Service>>(`/v1/services${query ? '?' + query : ''}`);
  },

  /**
   * Get service details
   */
  get: async (id: string): Promise<Service> => {
    const response = await apiClient.get<{ data: Service }>(`/v1/services/${id}`);
    return response.data;
  },

  /**
   * Get services by type
   */
  getByType: async (type: string): Promise<Service[]> => {
    const response = await apiClient.get<{ data: Service[] }>(`/v1/services/type/${type}`);
    return response.data;
  },

  /**
   * List service categories
   */
  categories: async (): Promise<ServiceCategory[]> => {
    const response = await apiClient.get<{ data: ServiceCategory[] }>('/v1/service-categories');
    return response.data;
  },

  /**
   * Get category with services
   */
  getCategory: async (id: string): Promise<ServiceCategory & { services: Service[] }> => {
    const response = await apiClient.get<{ data: ServiceCategory & { services: Service[] } }>(`/v1/service-categories/${id}`);
    return response.data;
  },
};
