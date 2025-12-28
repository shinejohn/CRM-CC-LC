// ============================================
// OUTBOUND EMAIL CAMPAIGN API
// ============================================

import { apiClient, type PaginatedResponse } from '../learning/api-client';

export interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  html_content: string;
  text_content: string | null;
  variables: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  tenant_id: string;
  name: string;
  type: 'email';
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  subject: string;
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
  opened_count: number;
  clicked_count: number;
  replied_count: number;
  metadata: Record<string, any> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailCampaignRequest {
  name: string;
  subject: string;
  message: string;
  template_id?: string;
  template_variables?: Record<string, string>;
  scheduled_at?: string;
  recipient_segments?: Record<string, any>;
}

/**
 * List email campaigns
 */
export async function listEmailCampaigns(params?: {
  status?: string;
  per_page?: number;
  page?: number;
}): Promise<EmailCampaign[]> {
  const response = await apiClient.get<PaginatedResponse<EmailCampaign>>(
    '/api/v1/outbound/email/campaigns',
    { params }
  );
  return response.data.data;
}

/**
 * Get email campaign details
 */
export async function getEmailCampaign(id: string): Promise<EmailCampaign> {
  const response = await apiClient.get<{ data: EmailCampaign }>(
    `/api/v1/outbound/campaigns/${id}`
  );
  return response.data.data;
}

/**
 * Create email campaign
 */
export async function createEmailCampaign(
  request: CreateEmailCampaignRequest
): Promise<EmailCampaign> {
  const response = await apiClient.post<{ data: EmailCampaign }>(
    '/api/v1/outbound/email/campaigns',
    request
  );
  return response.data.data;
}

/**
 * Get email templates
 */
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const response = await apiClient.get<{ data: EmailTemplate[] }>(
    '/api/v1/outbound/email/templates'
  );
  return response.data.data;
}

/**
 * Create email template
 */
export async function createEmailTemplate(request: {
  name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables?: string[];
}): Promise<EmailTemplate> {
  const response = await apiClient.post<{ data: EmailTemplate }>(
    '/api/v1/outbound/email/templates',
    request
  );
  return response.data.data;
}
