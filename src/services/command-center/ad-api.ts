// ============================================
// COMMAND CENTER - AD GENERATION API
// ============================================

import { apiClient, type PaginatedResponse } from '../learning/api-client';

export interface AdTemplate {
  id: string;
  name: string;
  slug: string;
  platform: 'facebook' | 'google' | 'instagram' | 'linkedin' | 'twitter' | 'display';
  ad_type: 'image' | 'video' | 'carousel' | 'text' | 'story';
  description: string | null;
  structure: Record<string, any> | null;
  prompt_template: string | null;
  variables: string[] | null;
  specs: Record<string, any> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneratedAd {
  id: string;
  tenant_id: string;
  name: string;
  platform: 'facebook' | 'google' | 'instagram' | 'linkedin' | 'twitter' | 'display';
  ad_type: 'image' | 'video' | 'carousel' | 'text' | 'story';
  status: 'draft' | 'review' | 'approved' | 'scheduled' | 'active' | 'paused' | 'archived';
  headline: string | null;
  description: string | null;
  call_to_action: string | null;
  destination_url: string | null;
  media_urls: string[] | null;
  content: Record<string, any> | null;
  metadata: Record<string, any> | null;
  campaign_id: string | null;
  content_id: string | null;
  template_id: string | null;
  generation_params: Record<string, any> | null;
  targeting: Record<string, any> | null;
  budget: Record<string, any> | null;
  schedule: Record<string, any> | null;
  scheduled_start_at: string | null;
  scheduled_end_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  external_ad_id: string | null;
  external_campaign_id: string | null;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  analytics_data: Record<string, any> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateFromCampaignRequest {
  campaign_id: string;
  platform: 'facebook' | 'google' | 'instagram' | 'linkedin' | 'twitter' | 'display';
  ad_type: 'image' | 'video' | 'carousel' | 'text' | 'story';
  template_id?: string;
  parameters?: Record<string, any>;
}

export interface GenerateFromContentRequest {
  content_id: string;
  platform: 'facebook' | 'google' | 'instagram' | 'linkedin' | 'twitter' | 'display';
  ad_type: 'image' | 'video' | 'carousel' | 'text' | 'story';
  template_id?: string;
  parameters?: Record<string, any>;
}

/**
 * List generated ads
 */
export async function listAds(params?: {
  platform?: string;
  status?: string;
  campaign_id?: string;
  per_page?: number;
  page?: number;
}): Promise<GeneratedAd[]> {
  const response = await apiClient.get<PaginatedResponse<GeneratedAd>>(
    '/api/v1/ads',
    { params }
  );
  return response.data.data;
}

/**
 * Get ad details
 */
export async function getAd(id: string): Promise<GeneratedAd> {
  const response = await apiClient.get<{ data: GeneratedAd }>(
    `/api/v1/ads/${id}`
  );
  return response.data.data;
}

/**
 * Generate ad from campaign
 */
export async function generateFromCampaign(
  request: GenerateFromCampaignRequest
): Promise<GeneratedAd> {
  const response = await apiClient.post<{ data: GeneratedAd }>(
    '/api/v1/ads/generate-from-campaign',
    request
  );
  return response.data.data;
}

/**
 * Generate ad from content
 */
export async function generateFromContent(
  request: GenerateFromContentRequest
): Promise<GeneratedAd> {
  const response = await apiClient.post<{ data: GeneratedAd }>(
    '/api/v1/ads/generate-from-content',
    request
  );
  return response.data.data;
}

/**
 * Update ad
 */
export async function updateAd(
  id: string,
  updates: {
    name?: string;
    headline?: string;
    description?: string;
    call_to_action?: string;
    destination_url?: string;
    status?: string;
    scheduled_start_at?: string;
    scheduled_end_at?: string;
    targeting?: Record<string, any>;
    budget?: Record<string, any>;
    notes?: string;
  }
): Promise<GeneratedAd> {
  const response = await apiClient.put<{ data: GeneratedAd }>(
    `/api/v1/ads/${id}`,
    updates
  );
  return response.data.data;
}

/**
 * Get ad templates
 */
export async function getAdTemplates(params?: {
  platform?: string;
  ad_type?: string;
}): Promise<AdTemplate[]> {
  const response = await apiClient.get<{ data: AdTemplate[] }>(
    '/api/v1/ads/templates',
    { params }
  );
  return response.data.data;
}

/**
 * Create ad template
 */
export async function createAdTemplate(request: {
  name: string;
  platform: 'facebook' | 'google' | 'instagram' | 'linkedin' | 'twitter' | 'display';
  ad_type: 'image' | 'video' | 'carousel' | 'text' | 'story';
  structure?: Record<string, any>;
  prompt_template?: string;
  description?: string;
  variables?: string[];
  specs?: Record<string, any>;
}): Promise<AdTemplate> {
  const response = await apiClient.post<{ data: AdTemplate }>(
    '/api/v1/ads/templates',
    request
  );
  return response.data.data;
}
