// ============================================
// EMAIL ENGINE API — Postal + ZeroBounce + Inbound
// ============================================

import { apiClient } from './learning/api-client';

// ── Types ──

export interface EmailHealthStats {
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  complaint_rate: number;
}

export interface EmailDeliveryEvent {
  id: string;
  campaign_recipient_id: string;
  external_id: string;
  event_type: 'MessageSent' | 'MessageDelivered' | 'MessageLoaded' | 'MessageLinkClicked' | 'MessageDeliveryFailed' | 'MessageBounced' | 'MessageHeld';
  provider: string;
  payload: Record<string, unknown>;
  received_at: string;
  created_at: string;
}

export interface ContactHealthStats {
  total_contacts: number;
  validated_count: number;
  valid_count: number;
  invalid_count: number;
  catch_all_count: number;
  unknown_count: number;
  suppressed_count: number;
  suppression_rate: number;
  last_scrub_at: string | null;
  zerobounce_credits: number;
}

export interface InboundEmail {
  id: string;
  from_email: string;
  to_email: string;
  subject: string;
  body: string;
  body_html: string | null;
  sentiment: 'positive' | 'neutral' | 'negative';
  intent: string;
  confidence: number;
  status: 'pending' | 'responded' | 'escalated' | 'archived';
  ai_responded: boolean;
  ai_response: string | null;
  routed_to: 'ai' | 'human' | 'held' | null;
  customer_id: string | null;
  customer_name: string | null;
  campaign_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaignSummary {
  id: string;
  name: string;
  status: string;
  type: string;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  failed_count: number;
  started_at: string | null;
  completed_at: string | null;
}

// ── Email Health Dashboard API ──

export async function getEmailHealthStats(): Promise<EmailHealthStats> {
  const response = await apiClient.get<{ data: EmailHealthStats }>(
    '/api/v1/email/health/stats'
  );
  return response.data;
}

export async function getRecentEmailEvents(params?: {
  limit?: number;
  event_type?: string;
}): Promise<EmailDeliveryEvent[]> {
  const response = await apiClient.get<{ data: EmailDeliveryEvent[] }>(
    '/api/v1/email/health/events',
    { params }
  );
  return response.data;
}

export async function getEmailCampaignSummaries(params?: {
  status?: string;
  limit?: number;
}): Promise<EmailCampaignSummary[]> {
  const response = await apiClient.get<{ data: EmailCampaignSummary[] }>(
    '/api/v1/outbound/campaigns',
    { params: { ...params, type: 'email' } }
  );
  return response.data;
}

// ── Contact Health API ──

export async function getContactHealthStats(): Promise<ContactHealthStats> {
  const response = await apiClient.get<{ data: ContactHealthStats }>(
    '/api/v1/email/contacts/health'
  );
  return response.data;
}

export async function triggerListRevalidation(): Promise<{ message: string; job_id: string }> {
  const response = await apiClient.post<{ data: { message: string; job_id: string } }>(
    '/api/v1/email/contacts/revalidate'
  );
  return response.data;
}

// ── Inbound Inbox API ──

export async function getInboundEmails(params?: {
  status?: string;
  sentiment?: string;
  page?: number;
  per_page?: number;
}): Promise<InboundEmail[]> {
  const response = await apiClient.get<{ data: InboundEmail[] }>(
    '/api/v1/email/inbound',
    { params }
  );
  return response.data;
}

export async function getInboundEmail(id: string): Promise<InboundEmail> {
  const response = await apiClient.get<{ data: InboundEmail }>(
    `/api/v1/email/inbound/${id}`
  );
  return response.data;
}

export async function updateInboundEmailStatus(
  id: string,
  status: 'responded' | 'escalated' | 'archived'
): Promise<InboundEmail> {
  const response = await apiClient.post<{ data: InboundEmail }>(
    `/api/v1/email/inbound/${id}/status`,
    { status }
  );
  return response.data;
}

export async function overrideAIResponse(
  id: string,
  response_text: string
): Promise<InboundEmail> {
  const response = await apiClient.post<{ data: InboundEmail }>(
    `/api/v1/email/inbound/${id}/override`,
    { response: response_text }
  );
  return response.data;
}

export async function escalateInboundEmail(
  id: string,
  note?: string
): Promise<InboundEmail> {
  const response = await apiClient.post<{ data: InboundEmail }>(
    `/api/v1/email/inbound/${id}/escalate`,
    { note }
  );
  return response.data;
}
