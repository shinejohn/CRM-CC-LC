/**
 * SMB (Small/Medium Business) profile types
 */

export type BusinessMode = 'b2b' | 'b2c' | 'hybrid';

export interface SMBProfile {
  id: string;
  name: string;
  slug?: string;
  business_mode?: BusinessMode;
  industry?: string;
  settings?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SMB {
  id: string;
  name: string;
  slug?: string;
  business_mode?: BusinessMode;
  industry?: string;
  created_at: string;
  updated_at: string;
}

/** Intelligence Hub - Full evolving profile aggregated from all sources */
export interface SMBFullProfile {
  id: string;
  community_id: string;
  name: string;
  category?: string;
  mapped_category?: string;
  google_data?: {
    place_id?: string;
    rating?: number;
    review_count?: number;
    hours?: Record<string, unknown>;
    photos?: unknown[];
    address?: string;
    phone?: string;
    website?: string;
  };
  enriched_data?: {
    owner_name?: string;
    owner_email?: string;
    facebook_url?: string;
    instagram_url?: string;
    website_description?: string;
    website_services?: string[];
    sources_used?: string[];
  };
  survey_responses?: Record<string, unknown>;
  ai_context?: {
    tone_and_voice?: string[];
    always_include?: string[];
    never_fabricate?: string[];
    story_angles?: string[];
    approved_quotes?: Array<{ text: string; attribution: string; context?: string }>;
  };
  campaign_history?: {
    total_campaigns?: number;
    active_campaigns?: number;
    total_emails_sent?: number;
    avg_open_rate?: number;
    avg_click_rate?: number;
    last_campaign_at?: string;
  };
  customer_intelligence?: {
    perception_gaps?: Record<string, string>;
    common_complaints?: string[];
    top_praised_features?: string[];
    net_promoter_score?: number;
  };
  competitor_analysis?: {
    direct_competitors?: Array<{ name: string; strengths?: string[]; weaknesses?: string[] }>;
    market_position?: string;
    differentiation_opportunities?: string[];
  };
  subscription?: {
    tier?: string;
    monthly_value?: number;
    estimated_ad_value_delivered?: number;
    trial_days_remaining?: number | null;
  };
  profile_completeness?: number;
  data_sources?: string[];
  last_enriched_at?: string | null;
}

export type SMBProfileSectionKey = 'ai_context' | 'survey_responses' | 'customer_intelligence' | 'competitor_analysis';
