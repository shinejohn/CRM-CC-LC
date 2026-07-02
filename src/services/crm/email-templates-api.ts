// ============================================
// EMAIL TEMPLATES API - Builder CRUD + preview
// Backed by /v1/outbound/email-templates
// ============================================

import { apiClient } from '../learning/api-client';

export interface EmailTemplate {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  subject: string;
  html_content: string;
  text_content: string | null;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplatePage {
  data: EmailTemplate[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface EmailTemplatePreview {
  subject: string;
  html: string;
  text: string | null;
}

export interface EmailTemplateInput {
  name: string;
  subject: string;
  html_content: string;
  text_content?: string | null;
  variables?: string[];
  is_active?: boolean;
}

const BASE = '/v1/outbound/email-templates';

export const emailTemplatesApi = {
  list: async (params?: {
    search?: string;
    is_active?: boolean;
    per_page?: number;
    page?: number;
  }): Promise<EmailTemplatePage> => {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') searchParams.set(k, String(v));
    });
    const query = searchParams.toString();
    return apiClient.get<EmailTemplatePage>(`${BASE}${query ? `?${query}` : ''}`);
  },

  get: async (id: string): Promise<EmailTemplate> => {
    const res = await apiClient.get<{ data: EmailTemplate }>(`${BASE}/${id}`);
    return res.data;
  },

  create: async (data: EmailTemplateInput): Promise<EmailTemplate> => {
    const res = await apiClient.post<{ data: EmailTemplate }>(BASE, data);
    return res.data;
  },

  update: async (id: string, data: Partial<EmailTemplateInput>): Promise<EmailTemplate> => {
    const res = await apiClient.put<{ data: EmailTemplate }>(`${BASE}/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },

  // Render a saved template with sample variables (server-side {{token}} replace).
  preview: async (id: string, variables: Record<string, string>): Promise<EmailTemplatePreview> => {
    const res = await apiClient.post<{ data: EmailTemplatePreview }>(`${BASE}/${id}/preview`, {
      variables,
    });
    return res.data;
  },

  // Render arbitrary unsaved content with sample variables (for live editing).
  previewRaw: async (
    data: { subject: string; html_content: string; text_content?: string | null },
    variables: Record<string, string>,
  ): Promise<EmailTemplatePreview> => {
    const res = await apiClient.post<{ data: EmailTemplatePreview }>(`${BASE}/preview`, {
      ...data,
      variables,
    });
    return res.data;
  },
};

// The variable tokens the campaign system populates. Mirrors the seeded
// EmailTemplate `variables` list ({{token}} syntax via str_replace).
export const KNOWN_VARIABLES: string[] = [
  'business_name',
  'community_name',
  'customer_name',
  'city',
  'listing_url',
  'founder_days_remaining',
  'unsubscribe_url',
];

// Sample values used for the live preview pane.
export const SAMPLE_VARIABLES: Record<string, string> = {
  business_name: 'Acme Coffee Co.',
  community_name: 'Springfield',
  customer_name: 'Jane Smith',
  city: 'Springfield',
  listing_url: 'https://day.news/springfield/acme-coffee',
  founder_days_remaining: '7',
  unsubscribe_url: 'https://day.news/unsubscribe/sample',
};
