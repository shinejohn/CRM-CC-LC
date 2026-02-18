/**
 * Customer types for CRM
 */

export interface Customer {
  id: string;
  smb_id: string;
  name: string;
  email: string;
  phone?: string;
  tier: 'lead' | 'prospect' | 'customer' | 'vip';
  engagement_score: number;
  predictive_score?: number;
  campaign_id?: string;
  community_id?: string;
  business_context?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CustomerFilters {
  page?: number;
  per_page?: number;
  search?: string;
  tier?: string;
  community_id?: string;
  campaign_id?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone?: string;
  tier?: string;
  community_id?: string;
  business_context?: Record<string, unknown>;
}
