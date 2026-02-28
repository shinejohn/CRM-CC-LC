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
