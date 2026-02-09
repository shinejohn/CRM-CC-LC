// ============================================
// CAMPAIGN LANDING PAGE API SERVICE
// ============================================

import { apiClient } from './api-client';
import { generateCampaignSlides } from '@/utils/campaign-content-generator';
import type { Presentation } from '@/types/learning';

/**
 * Generate narration text for a slide based on its content
 */
function generateNarrationText(
  slide: { id: number; component: string; content: Record<string, any> },
  campaign: CampaignData['campaign'],
  landingPage: CampaignLandingPage
): string {
  const { component, content } = slide;
  
  // Generate narration based on component type and content
  switch (component) {
    case 'HeroSlide':
      return content.headline 
        ? `${content.headline}. ${content.subheadline || ''}`
        : `Welcome to ${campaign.title || 'this presentation'}`;
    
    case 'ProblemSlide':
      return content.problem || `Let's talk about the challenges facing ${campaign.type || 'businesses'} today.`;
    
    case 'SolutionSlide':
      if (content.benefits && content.benefits.length > 0) {
        return `${content.title || 'The Solution'}. ${content.solution || ''} ${content.benefits.join('. ')}`;
      }
      return content.solution || `Here's how we can help solve these challenges.`;
    
    case 'StatsSlide':
      if (content.stats && content.stats.length > 0) {
        const statsText = content.stats.map((s: any) => `${s.value} ${s.label}`).join(', ');
        return `${content.headline || 'Here are some important statistics'}. ${statsText}`;
      }
      return content.headline || 'Let me share some important statistics with you.';
    
    case 'ComparisonSlide':
      return content.headline || 'Let me show you the difference between the old way and the new way.';
    
    case 'ProcessSlide':
      if (content.steps && content.steps.length > 0) {
        const stepsText = content.steps.map((s: any) => `Step ${s.number}: ${s.title}`).join('. ');
        return `${content.headline || 'Here\'s how it works'}. ${stepsText}`;
      }
      return content.headline || 'Let me walk you through the process.';
    
    case 'CTASlide':
      return content.headline || `Ready to get started? ${content.subheadline || 'Take action today.'}`;
    
    default:
      return `Slide ${slide.id}: ${campaign.title || 'Continuing the presentation'}`;
  }
}

export interface CampaignLandingPage {
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
  data_capture_fields: string; // Comma-separated string
  audio_base_url: string;
  crm_tracking: boolean;
  conversion_goal: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
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
  landing_page: CampaignLandingPage;
  template: {
    template_id: string;
    name: string;
    slides: number;
    duration: number;
    purpose: string;
    audio_required: boolean;
  };
  slides: Array<{
    template_id?: string;
    slide_num: number;
    component: string;
    content_type?: string;
    requires_personalization?: boolean;
    audio_file: string;
    content?: Record<string, any>;
    narration?: string;
    duration_seconds?: number;
    title?: string;
  }>;
  presentation?: {
    id: string;
    audio: {
      baseUrl: string;
      format: string;
    };
    slides: Array<{
      id: number;
      component: string;
      audioFile: string;
      requiresPersonalization: boolean;
    }>;
  };
  article?: {
    title: string;
    subtitle?: string;
    content: string;
    word_count?: number;
  };
  emails?: Record<string, {
    subject: string;
    preview_text?: string;
    body: string;
  }>;
  personalization?: {
    required_fields?: string[];
    optional_fields?: string[];
    auto_generated?: string[];
  };
  connections?: {
    leads_to?: string[];
    follows?: string | null;
    related?: string[];
  };
}

// Static JSON loading has been removed in favor of API-backed campaigns.
// The old mock data fetches are intentionally commented out to avoid regressions.
// const response = await fetch('/campaigns/landing_pages_master.json');
// const response = await fetch(`/campaigns/campaign_${campaignId}.json`);

export const campaignApi = {
  // Get campaign by slug
  getCampaignBySlug: async (slug: string): Promise<CampaignData | null> => {
    try {
      const response = await apiClient.get<{ data: CampaignData }>(`/v1/campaigns/${slug}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to load campaign ${slug}:`, error);
      return null;
    }
  },

  // Convert campaign data to Presentation format
  convertToPresentation: (campaignData: CampaignData): Presentation => {
    const { landing_page, presentation, template, slides, campaign } = campaignData;
    
    // Map slides - use presentation slides if available, otherwise generate from metadata
    let mappedSlides: Array<{
      id: number;
      component: string;
      content: Record<string, unknown>;
      audioUrl?: string;
      requiresPersonalization: boolean;
    }> = [];
    
    // Try presentation slides first (if they have actual content)
    if (presentation?.slides && presentation.slides.length > 0) {
      // Check if slides have content or are just empty placeholders
      const hasContent = presentation.slides.some(s => s.component && s.component !== '');
      
      if (hasContent) {
        mappedSlides = presentation.slides.map((slide, index) => ({
          id: slide.id || index + 1,
          component: slide.component,
          content: (slide as any).content || {},
          audioUrl: presentation.audio?.baseUrl 
            ? `${presentation.audio.baseUrl}${slide.audioFile || ''}`
            : landing_page.audio_base_url 
            ? `${landing_page.audio_base_url}slide-${String(index + 1).padStart(2, '0')}.mp3`
            : undefined,
          requiresPersonalization: slide.requiresPersonalization || false,
        }));
      }
    }
    
    // Try slides array from campaign data
    if (mappedSlides.length === 0 && slides && slides.length > 0) {
      // Map invalid component names to valid ones (only for components that don't exist)
      const componentMap: Record<string, string> = {
        'DataSlide': 'StatsSlide', // DataSlide uses StatsSlide
        'ResourceSlide': 'SolutionSlide',
        'TopicSlide': 'SolutionSlide',
        'InsightSlide': 'StatsSlide',
        // ConceptSlide, ActionSlide, and other new components are now available
      };
      
      mappedSlides = slides.map((slide, index) => {
        const originalComponent = slide.component;
        const mappedComponent = componentMap[originalComponent] || originalComponent;
        
        // If component is invalid and no content exists, we'll generate it
        const hasContent = (slide as any).content && Object.keys((slide as any).content).length > 0;
        
        return {
          id: slide.slide_num || index + 1,
          component: mappedComponent,
          content: (slide as any).content || {},
          audioUrl: landing_page.audio_base_url 
            ? `${landing_page.audio_base_url}${slide.audio_file || `slide-${String(index + 1).padStart(2, '0')}.mp3`}`
            : undefined,
          requiresPersonalization: slide.requires_personalization || false,
          narration: (slide as any).narration || generateNarrationText(
            { id: slide.slide_num || index + 1, component: mappedComponent, content: (slide as any).content || {} },
            campaign,
            landing_page
          ),
        };
      });
    }
    
    // If no slides with content, generate them from campaign metadata
    // Also check if we have fewer slides than expected
    const expectedSlideCount = landing_page.slide_count || template.slides || 6;
    const needsGeneration = mappedSlides.length === 0 || 
                           mappedSlides.every(s => !s.content || Object.keys(s.content).length === 0) ||
                           mappedSlides.length < expectedSlideCount;
    
    if (needsGeneration) {
      const generatedSlides = generateCampaignSlides(campaignData);
      // Use generated slides if we have none, or merge/complete existing ones
      if (mappedSlides.length === 0 || mappedSlides.every(s => !s.content || Object.keys(s.content).length === 0)) {
        mappedSlides = generatedSlides.map(slide => ({
          id: slide.id,
          component: slide.component as any,
          content: slide.content,
          audio_url: slide.audioUrl,
          audioUrl: slide.audioUrl, // Support both formats
          requiresPersonalization: slide.requiresPersonalization,
          narration: generateNarrationText(slide, campaign, landing_page), // Add narration
        }));
      } else {
        // Complete missing slides
        const existingIds = new Set(mappedSlides.map(s => s.id));
        const missingSlides = generatedSlides.filter(s => !existingIds.has(s.id));
        mappedSlides = [
          ...mappedSlides.map(slide => ({
            ...slide,
            narration: slide.narration || generateNarrationText(
              { id: slide.id, component: slide.component, content: slide.content },
              campaign,
              landing_page
            ),
          })),
          ...missingSlides.map(slide => ({
            id: slide.id,
            component: slide.component as any,
            content: slide.content,
            audio_url: slide.audioUrl,
            audioUrl: slide.audioUrl,
            requiresPersonalization: slide.requiresPersonalization,
            narration: generateNarrationText(slide, campaign, landing_page),
          })),
        ].sort((a, b) => a.id - b.id);
      }
    } else {
      // Add narration to existing slides if missing
      mappedSlides = mappedSlides.map(slide => ({
        ...slide,
        narration: slide.narration || generateNarrationText(
          { id: slide.id, component: slide.component, content: slide.content },
          campaign,
          landing_page
        ),
      }));
    }
    
    return {
      id: landing_page.landing_page_slug,
      presentation_id: landing_page.campaign_id,
      title: campaign.title,
      description: campaign.description,
      template_id: template.template_id,
      slides: mappedSlides.map(slide => ({
        ...slide,
        audio_url: slide.audioUrl || slide.audio_url,
        narration: (slide as any).narration || '',
      })),
      presenter: {
        id: landing_page.ai_persona.toLowerCase(),
        name: landing_page.ai_persona,
        role: 'AI Assistant',
        personality: landing_page.ai_tone,
        communication_style: landing_page.ai_goal,
      },
      meta: {
        title: campaign.title,
        duration: landing_page.duration_seconds,
        slideCount: landing_page.slide_count,
        audioBaseUrl: landing_page.audio_base_url,
        theme: 'blue' as const,
      },
      theme: {
        primaryColor: '#6366f1',
        secondaryColor: '#10b981',
      },
    };
  },

  // Get all campaigns (for listing)
  getAllCampaigns: async (): Promise<CampaignLandingPage[]> => {
    try {
      const response = await apiClient.get<{ data: CampaignLandingPage[] }>('/v1/campaigns');
      return response.data;
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      return [];
    }
  },

  // Download guide for a campaign
  downloadGuide: async (campaignId: string): Promise<string> => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_ENDPOINT || '';
      // Use v1 prefix to match backend route structure
      const url = `${API_BASE_URL}/v1/learning/campaigns/${campaignId}/guide`;
      
      // Call backend API endpoint
      const token = localStorage.getItem('auth_token');
      const tenantId = localStorage.getItem('tenant_id');
      
      const headers: HeadersInit = {
        'Accept': 'application/pdf',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to download guide: ${response.statusText} (${response.status})`);
      }

      // Get the blob URL from response
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      return blobUrl;
    } catch (error) {
      console.error(`Failed to download guide for campaign ${campaignId}:`, error);
      throw error;
    }
  },
};

