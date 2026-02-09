// ============================================
// LEARNING CENTER CONTENT API SERVICE
// ============================================

import { apiClient } from './api-client';

export interface Content {
  id: number;
  slug: string;
  type: 'edu' | 'hook' | 'howto' | 'article';
  title: string;
  campaign_id: string | null;
  slides: Array<{
    id: number;
    component: string;
    headline?: string;
    subheadline?: string;
    content?: string;
    [key: string]: any;
  }>;
  article_body?: string;
  audio_base_url?: string;
  duration_seconds: number;
  service_type?: string;
  approval_button_text?: string;
  personalization_fields: string[];
  metadata: Record<string, any>;
  is_active: boolean;
  approval_url?: string;
  personalization?: {
    business_name: string;
    community: string;
    first_name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface ContentStats {
  total_views: number;
  unique_smb_views: number;
  completions: number;
  completion_rate: number;
  avg_time_on_page: number | null;
  approval_clicks: number;
  downloads: number;
  by_source: Record<string, number>;
}

export interface Article {
  title: string;
  body: string;
  related_content: Array<{
    slug: string;
    title: string;
    type: string;
    duration_seconds: number;
  }>;
  approval_url?: string;
}

export interface TrackStartData {
  smb_id?: number;
  source_campaign_id?: string;
  source_url?: string;
}

export interface TrackSlideData {
  view_id: number;
  slide_number: number;
}

export interface TrackCompleteData {
  view_id: number;
  time_on_page_seconds?: number;
}

export const contentApi = {
  /**
   * Get all content (paginated)
   */
  getContent: async (params?: {
    type?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    data: Content[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  }> => {
    return apiClient.get('/v1/content', { params });
  },

  /**
   * Get content by slug
   */
  getContentBySlug: async (slug: string, smbId?: number): Promise<Content> => {
    const params = smbId ? { smb_id: smbId } : {};
    return apiClient.get(`/v1/content/${slug}`, { params });
  },

  /**
   * Get personalized content
   */
  getPersonalizedContent: async (slug: string, smbId: number): Promise<Content> => {
    return apiClient.get(`/v1/content/${slug}/personalized/${smbId}`);
  },

  /**
   * Get content statistics
   */
  getStats: async (slug: string): Promise<ContentStats> => {
    return apiClient.get(`/v1/content/${slug}/stats`);
  },

  /**
   * Track view start
   */
  trackStart: async (slug: string, data: TrackStartData): Promise<{ view_id: number }> => {
    return apiClient.post(`/v1/content/${slug}/track/start`, data);
  },

  /**
   * Track slide view
   */
  trackSlide: async (slug: string, data: TrackSlideData): Promise<{ completion: number }> => {
    return apiClient.post(`/v1/content/${slug}/track/slide`, data);
  },

  /**
   * Track completion
   */
  trackComplete: async (slug: string, data: TrackCompleteData): Promise<{ success: boolean }> => {
    return apiClient.post(`/v1/content/${slug}/track/complete`, data);
  },

  /**
   * Track approval click
   */
  trackApprovalClick: async (slug: string, viewId: number): Promise<{ success: boolean }> => {
    return apiClient.post(`/v1/content/${slug}/track/approval-click`, { view_id: viewId });
  },

  /**
   * Track PDF download
   */
  trackDownload: async (slug: string, viewId: number): Promise<{ success: boolean }> => {
    return apiClient.post(`/v1/content/${slug}/track/download`, { view_id: viewId });
  },

  /**
   * Get article content
   */
  getArticle: async (slug: string, smbId?: number): Promise<Article> => {
    const params = smbId ? { smb_id: smbId } : {};
    return apiClient.get(`/v1/content/${slug}/article`, { params });
  },

  /**
   * Download PDF
   */
  downloadPdf: async (slug: string, viewId?: number): Promise<Blob> => {
    const params = viewId ? { view_id: viewId } : {};
    const response = await fetch(
      `${import.meta.env.VITE_API_ENDPOINT || ''}/v1/content/${slug}/article/pdf?${new URLSearchParams(params as any).toString()}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'X-Tenant-ID': localStorage.getItem('tenant_id') || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    return response.blob();
  },
};



