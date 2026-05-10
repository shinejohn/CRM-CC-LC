// ---------------------------------------------------------------------------
// Manifest Destiny Journey Simulator — Types
// ---------------------------------------------------------------------------

export interface TimelineListItem {
  name: string;
  slug: string;
  pipeline_stage: string;
  duration_days: number;
  action_count: number;
}

export interface TimelinesResponse {
  timelines: TimelineListItem[];
}

export interface SimulationParams {
  timeline: string;
  profile: EngagementProfile;
  business_name?: string;
  community_name?: string;
}

export type EngagementProfile = 'engaged' | 'passive' | 'cold';

export interface SimulationResult {
  timeline: {
    name: string;
    slug: string;
    pipeline_stage: string;
    duration_days: number;
  };
  business: {
    business_name: string;
    community_name: string;
    contact_name: string;
    city: string;
  };
  engagement_profile: EngagementProfile;
  days: SimulationDay[];
  summary: SimulationSummary;
}

export interface SimulationDay {
  day: number;
  actions: SimulationAction[];
  stage_transition: StageTransition | null;
}

export interface StageTransition {
  from: string;
  to: string;
}

export interface SimulationAction {
  action_type: string;
  channel: string;
  fires: boolean;
  skip_reason: string | null;
  conditions: Record<string, unknown> | null;
  template: SimulationTemplate | null;
  campaign: SimulationCampaign | null;
}

export interface SimulationTemplate {
  name: string;
  slug: string;
  subject: string;
  body_preview: string;
  body_html: string;
}

export interface SimulationCampaign {
  id: string;
  title: string;
  landing_page_slug: string;
  slide_count: number;
  slides: SimulationSlide[];
  cta_primary: string;
}

export interface SimulationSlide {
  slide_num: number;
  component: string;
  title: string;
  content: Record<string, unknown>;
  narration?: string;
}

export interface SimulationSummary {
  total_days_with_actions: number;
  total_actions: number;
  emails_fired: number;
  emails_skipped: number;
  sms_fired: number;
  engagement_checks: number;
  stage_transitions: number;
}
