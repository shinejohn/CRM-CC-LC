// ============================================
// OUTBOUND SMS CAMPAIGN API
// ============================================

import { apiClient, type PaginatedResponse } from '../learning/api-client';

export interface SmsTemplate {
  id: string;
  name: string;
  slug: string;
  message: string;
  variables: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SmsCampaign {
  id: string;
  tenant_id: string;
  name: string;
  type: 'sms';
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  message: string;
  template_id: string | null;
  template_variables: Record<string, string> | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  recipient_segments: Record<string, any> | null;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  replied_count: number;
  metadata: Record<string, any> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSmsCampaignRequest {
  name: string;
  message: string;
  template_id?: string;
  template_variables?: Record<string, string>;
  scheduled_at?: string;
  recipient_segments?: Record<string, any>;
}

/**
 * List SMS campaigns
 */
export async function listSmsCampaigns(params?: {
  status?: string;
  per_page?: number;
  page?: number;
}): Promise<SmsCampaign[]> {
  const response = await apiClient.get<PaginatedResponse<SmsCampaign>>(
    '/api/v1/outbound/sms/campaigns',
    { params }
  );
  return response.data.data;
}

/**
 * Get SMS campaign details
 */
export async function getSmsCampaign(id: string): Promise<SmsCampaign> {
  const response = await apiClient.get<{ data: SmsCampaign }>(
    `/api/v1/outbound/campaigns/${id}`
  );
  return response.data.data;
}

/**
 * Create SMS campaign
 */
export async function createSmsCampaign(
  request: CreateSmsCampaignRequest
): Promise<SmsCampaign> {
  const response = await apiClient.post<{ data: SmsCampaign }>(
    '/api/v1/outbound/sms/campaigns',
    request
  );
  return response.data.data;
}

/**
 * Get SMS templates
 */
export async function getSmsTemplates(): Promise<SmsTemplate[]> {
  const response = await apiClient.get<{ data: SmsTemplate[] }>(
    '/api/v1/outbound/sms/templates'
  );
  return response.data.data;
}

/**
 * Create SMS template
 */
export async function createSmsTemplate(request: {
  name: string;
  message: string;
  variables?: string[];
}): Promise<SmsTemplate> {
  const response = await apiClient.post<{ data: SmsTemplate }>(
    '/api/v1/outbound/sms/templates',
    request
  );
  return response.data.data;
}
