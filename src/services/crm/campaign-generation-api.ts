// ============================================
// CAMPAIGN GENERATION API
// ============================================

import { apiClient } from '../learning/api-client';

export interface CampaignTemplate {
  type: 'Educational' | 'Hook' | 'HowTo';
  name: string;
  description: string;
  best_for: string;
  slides: number;
  duration: number;
}

export interface CampaignSuggestion {
  type: 'Educational' | 'Hook' | 'HowTo';
  title: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface GenerateCampaignRequest {
  type: 'Educational' | 'Hook' | 'HowTo';
  objective?: string;
  topic?: string;
  customer_id?: string;
  target_audience?: string;
  week?: number;
  day?: number;
  utm_campaign?: string;
}

export interface CampaignData {
  campaign: {
    id: string;
    week: number;
    day: number;
    type: string;
    title: string;
    subject: string;
    landing_page: string;
    template: string;
    description: string;
  };
  landing_page: {
    campaign_id: string;
    landing_page_slug: string;
    url: string;
    template_id: string;
    template_name: string;
    slide_count: number;
    duration_seconds: number;
    primary_cta: string;
    secondary_cta: string;
    ai_persona: string;
    ai_tone: string;
    ai_goal: string;
    data_capture_fields: string;
    audio_base_url: string;
    crm_tracking: boolean;
    conversion_goal: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
  };
  template: {
    template_id: string;
    name: string;
    slides: number;
    duration: number;
    purpose: string;
  };
  slides: Array<{
    template_id: string;
    slide_num: number;
    component: string;
    content_type: string;
    requires_personalization: boolean;
    audio_file: string;
  }>;
  outline?: any[];
  suggestions?: any[];
}

export interface GenerateCampaignResponse {
  data: CampaignData;
  message: string;
}

export interface TemplatesResponse {
  data: CampaignTemplate[];
}

export interface SuggestionsResponse {
  data: CampaignSuggestion[];
}

/**
 * Generate a new campaign using AI
 */
export async function generateCampaign(
  request: GenerateCampaignRequest
): Promise<CampaignData> {
  const response = await apiClient.post<GenerateCampaignResponse>(
    '/api/v1/campaigns/generate',
    request
  );
  return response.data.data;
}

/**
 * Get available campaign templates
 */
export async function getCampaignTemplates(): Promise<CampaignTemplate[]> {
  const response = await apiClient.get<TemplatesResponse>('/api/v1/campaigns/templates');
  return response.data.data;
}

/**
 * Get campaign suggestions for a customer
 */
export async function getCampaignSuggestions(
  customerId: string
): Promise<CampaignSuggestion[]> {
  const response = await apiClient.post<SuggestionsResponse>('/api/v1/campaigns/suggestions', {
    customer_id: customerId,
  });
  return response.data.data;
}
