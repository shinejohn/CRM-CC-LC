export interface Campaign {
    id: string;
    slug: string;
    title: string;
    description: string;
    target_audience: string;
    primary_objective: string;
    estimated_duration_weeks: number;
    expected_outcomes: string[];
    theme?: {
        primary_color: string;
        secondary_color: string;
        tone: string;
    };
    slides?: CampaignSlide[];
    [key: string]: any; // Allow fallback for other json properties
}

export interface CampaignSlide {
    id: string;
    type: "hero" | "content" | "video" | "interactive" | "cta" | "timeline";
    title: string;
    content?: string;
    media_url?: string;
    cta_text?: string;
    cta_link?: string;
    interactive_elements?: any[];
    [key: string]: any;
}

/**
 * Matches the actual JSON structure in public/campaigns/*.json
 * Each campaign file contains nested objects for campaign, landing_page, template, and slides.
 */
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
    landing_page: {
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
        data_capture_fields: string;
        audio_base_url: string;
        crm_tracking: boolean;
        conversion_goal: string;
        utm_source: string;
        utm_medium: string;
        utm_campaign: string;
        utm_content: string;
    };
    template: {
        template_id: string;
        name: string;
        slides: number;
        duration: number;
        purpose: string;
        audio_required: boolean;
    };
    slides: CampaignDataSlide[];
}

export interface CampaignDataSlide {
    slide_num: number;
    component: string;
    title: string;
    content: Record<string, any>;
    narration: string;
    duration_seconds: number;
    audio_file: string;
}
