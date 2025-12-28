// ============================================
// COMMAND CENTER - CONTENT GENERATION API
// ============================================

import { apiClient, type PaginatedResponse } from '../learning/api-client';

export interface ContentTemplate {
  id: string;
  name: string;
  slug: string;
  type: 'article' | 'blog' | 'social' | 'email' | 'landing_page';
  description: string | null;
  prompt_template: string;
  variables: string[] | null;
  structure: Record<string, any> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneratedContent {
  id: string;
  tenant_id: string;
  title: string;
  slug: string | null;
  type: 'article' | 'blog' | 'social' | 'email' | 'landing_page';
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  content: string;
  excerpt: string | null;
  metadata: Record<string, any> | null;
  campaign_id: string | null;
  template_id: string | null;
  generation_params: Record<string, any> | null;
  assigned_to: string | null;
  scheduled_publish_at: string | null;
  published_at: string | null;
  published_by: string | null;
  published_channels: string[] | null;
  publishing_metadata: Record<string, any> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateContentRequest {
  type: 'article' | 'blog' | 'social' | 'email' | 'landing_page';
  template_id?: string;
  parameters: {
    title: string;
    topic?: string;
    tags?: string[];
    category?: string;
    [key: string]: any;
  };
}

export interface GenerateFromCampaignRequest {
  campaign_id: string;
  type: 'article' | 'blog' | 'social' | 'email' | 'landing_page';
  template_id?: string;
  parameters?: Record<string, any>;
}

/**
 * List generated content
 */
export async function listContent(params?: {
  type?: string;
  status?: string;
  campaign_id?: string;
  per_page?: number;
  page?: number;
}): Promise<GeneratedContent[]> {
  const response = await apiClient.get<PaginatedResponse<GeneratedContent>>(
    '/api/v1/content',
    { params }
  );
  return response.data.data;
}

/**
 * Get content details
 */
export async function getContent(id: string): Promise<GeneratedContent> {
  const response = await apiClient.get<{ data: GeneratedContent }>(
    `/api/v1/content/${id}`
  );
  return response.data.data;
}

/**
 * Generate content from scratch
 */
export async function generateContent(
  request: GenerateContentRequest
): Promise<GeneratedContent> {
  const response = await apiClient.post<{ data: GeneratedContent }>(
    '/api/v1/content/generate',
    request
  );
  return response.data.data;
}

/**
 * Generate content from campaign
 */
export async function generateFromCampaign(
  request: GenerateFromCampaignRequest
): Promise<GeneratedContent> {
  const response = await apiClient.post<{ data: GeneratedContent }>(
    '/api/v1/content/generate-from-campaign',
    request
  );
  return response.data.data;
}

/**
 * Update content
 */
export async function updateContent(
  id: string,
  updates: {
    title?: string;
    content?: string;
    excerpt?: string;
    metadata?: Record<string, any>;
    status?: string;
    scheduled_publish_at?: string;
    notes?: string;
    change_notes?: string;
    workflow_notes?: string;
  }
): Promise<GeneratedContent> {
  const response = await apiClient.put<{ data: GeneratedContent }>(
    `/api/v1/content/${id}`,
    updates
  );
  return response.data.data;
}

/**
 * Update content status
 */
export async function updateContentStatus(
  id: string,
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived',
  notes?: string
): Promise<GeneratedContent> {
  const response = await apiClient.post<{ data: GeneratedContent }>(
    `/api/v1/content/${id}/status`,
    { status, notes }
  );
  return response.data.data;
}

/**
 * Get content templates
 */
export async function getContentTemplates(params?: {
  type?: string;
}): Promise<ContentTemplate[]> {
  const response = await apiClient.get<{ data: ContentTemplate[] }>(
    '/api/v1/content/templates',
    { params }
  );
  return response.data.data;
}

/**
 * Create content template
 */
export async function createContentTemplate(request: {
  name: string;
  type: 'article' | 'blog' | 'social' | 'email' | 'landing_page';
  prompt_template: string;
  description?: string;
  variables?: string[];
  structure?: Record<string, any>;
}): Promise<ContentTemplate> {
  const response = await apiClient.post<{ data: ContentTemplate }>(
    '/api/v1/content/templates',
    request
  );
  return response.data.data;
}
