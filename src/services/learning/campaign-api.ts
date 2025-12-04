// ============================================
// CAMPAIGN LANDING PAGE API SERVICE
// ============================================

import { apiClient } from './api-client';
import { generateCampaignSlides } from '@/utils/campaign-content-generator';
import type { Presentation } from '@/types/learning';

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
    template_id: string;
    slide_num: number;
    component: string;
    content_type: string;
    requires_personalization: boolean;
    audio_file: string;
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
}

// For now, load from static JSON files
// Later this can be migrated to API/database

// Load master JSON for slug-to-campaign-id mapping
let campaignMasterData: { landing_pages: CampaignLandingPage[] } | null = null;

async function loadMasterData(): Promise<{ landing_pages: CampaignLandingPage[] }> {
  if (campaignMasterData) return campaignMasterData;
  
  try {
    const response = await fetch('/campaigns/landing_pages_master.json');
    if (response.ok) {
      campaignMasterData = await response.json();
      return campaignMasterData!;
    }
  } catch (error) {
    console.error('Failed to load master campaign data:', error);
  }
  
  return { landing_pages: [] };
}

export const campaignApi = {
  // Get campaign by slug
  getCampaignBySlug: async (slug: string): Promise<CampaignData | null> => {
    try {
      // Load master data to find campaign_id from slug
      const masterData = await loadMasterData();
      const landingPage = masterData.landing_pages.find(lp => lp.landing_page_slug === slug);
      
      if (!landingPage) {
        console.error(`Campaign with slug "${slug}" not found`);
        return null;
      }

      const campaignId = landingPage.campaign_id;
      
      // Try to load from static JSON file (campaign_HOOK-001.json format)
      const response = await fetch(`/campaigns/campaign_${campaignId}.json`);
      if (response.ok) {
        return await response.json();
      }
      
      // If individual JSON doesn't exist, create CampaignData from master metadata
      console.log(`Individual campaign file not found for ${campaignId}, creating from metadata`);
      return {
        campaign: {
          id: campaignId,
          week: 1,
          day: 1,
          type: landingPage.campaign_id.split('-')[0],
          title: landingPage.template_name,
          subject: landingPage.template_name,
          landing_page: slug,
          template: landingPage.template_id,
          description: `${landingPage.template_name} - ${landingPage.ai_goal || 'Educational content'}`,
        },
        landing_page: landingPage,
        template: {
          template_id: landingPage.template_id,
          name: landingPage.template_name,
          slides: landingPage.slide_count,
          duration: landingPage.duration_seconds,
          purpose: landingPage.ai_goal || 'Educational content',
          audio_required: true,
        },
        slides: Array.from({ length: landingPage.slide_count }, (_, index) => ({
          template_id: landingPage.template_id,
          slide_num: index + 1,
          component: index === 0 ? 'HeroSlide' : index === landingPage.slide_count - 1 ? 'CTASlide' : 'SolutionSlide',
          content_type: 'mixed',
          requires_personalization: false,
          audio_file: `slide-${String(index + 1).padStart(2, '0')}.mp3`,
        })),
      };
      
      // Final fallback: try API endpoint
      // return await apiClient.get<CampaignData>(`/learning/campaigns/${slug}`);
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
      mappedSlides = slides.map((slide, index) => ({
        id: slide.slide_num || index + 1,
        component: slide.component,
        content: (slide as any).content || {},
        audioUrl: landing_page.audio_base_url 
          ? `${landing_page.audio_base_url}${slide.audio_file || `slide-${String(index + 1).padStart(2, '0')}.mp3`}`
          : undefined,
        requiresPersonalization: slide.requires_personalization || false,
      }));
    }
    
    // If no slides with content, generate them from campaign metadata
    if (mappedSlides.length === 0 || mappedSlides.every(s => !s.content || Object.keys(s.content).length === 0)) {
      const generatedSlides = generateCampaignSlides(campaignData);
      mappedSlides = generatedSlides.map(slide => ({
        id: slide.id,
        component: slide.component as any,
        content: slide.content,
        audio_url: slide.audioUrl,
        audioUrl: slide.audioUrl, // Support both formats
        requiresPersonalization: slide.requiresPersonalization,
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
      // Try static file first
      const response = await fetch('/campaigns/landing_pages_master.json');
      if (response.ok) {
        const data = await response.json();
        return data.landing_pages || [];
      }
      
      // Fallback to API
      return await apiClient.get<CampaignLandingPage[]>('/learning/campaigns');
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      return [];
    }
  },
};

