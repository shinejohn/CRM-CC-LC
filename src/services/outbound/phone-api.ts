// ============================================
// OUTBOUND PHONE CAMPAIGN API
// ============================================

import { apiClient, type PaginatedResponse } from '../learning/api-client';

export interface PhoneScript {
  id: string;
  name: string;
  slug: string;
  script: string;
  variables: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PhoneCampaign {
  id: string;
  tenant_id: string;
  name: string;
  type: 'phone';
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  message: string; // Script content
  template_id: string | null;
  template_variables: Record<string, string> | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  recipient_segments: Record<string, any> | null;
  total_recipients: number;
  sent_count: number;
  answered_count: number;
  voicemail_count: number;
  failed_count: number;
  metadata: Record<string, any> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePhoneCampaignRequest {
  name: string;
  message: string;
  template_id?: string;
  template_variables?: Record<string, string>;
  scheduled_at?: string;
  recipient_segments?: Record<string, any>;
}

/**
 * List phone campaigns
 */
export async function listPhoneCampaigns(params?: {
  status?: string;
  per_page?: number;
  page?: number;
}): Promise<PhoneCampaign[]> {
  const response = await apiClient.get<PaginatedResponse<PhoneCampaign>>(
    '/api/v1/outbound/phone/campaigns',
    { params }
  );
  return response.data.data;
}

/**
 * Get phone campaign details
 */
export async function getPhoneCampaign(id: string): Promise<PhoneCampaign> {
  const response = await apiClient.get<{ data: PhoneCampaign }>(
    `/api/v1/outbound/campaigns/${id}`
  );
  return response.data.data;
}

/**
 * Create phone campaign
 */
export async function createPhoneCampaign(
  request: CreatePhoneCampaignRequest
): Promise<PhoneCampaign> {
  const response = await apiClient.post<{ data: PhoneCampaign }>(
    '/api/v1/outbound/phone/campaigns',
    request
  );
  return response.data.data;
}

/**
 * Get phone scripts
 */
export async function getPhoneScripts(): Promise<PhoneScript[]> {
  const response = await apiClient.get<{ data: PhoneScript[] }>(
    '/api/v1/outbound/phone/scripts'
  );
  return response.data.data;
}

/**
 * Create phone script
 */
export async function createPhoneScript(request: {
  name: string;
  script: string;
  variables?: string[];
}): Promise<PhoneScript> {
  const response = await apiClient.post<{ data: PhoneScript }>(
    '/api/v1/outbound/phone/scripts',
    request
  );
  return response.data.data;
}
