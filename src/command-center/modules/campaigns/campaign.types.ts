// ============================================
// CAMPAIGN TYPES - Command Center
// CC-FT-05: Campaigns Module
// ============================================

export type CampaignChannel = 'email' | 'sms' | 'phone' | 'rvm';
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
export type CampaignTemplateCategory = 'EDU' | 'HOOK' | 'HOWTO';

export interface Campaign {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  audience: number;
  sent: number;
  opened: number;
  clicked: number;
  replied?: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  templateId?: string;
  templateName?: string;
  templateCategory?: CampaignTemplateCategory;
  subject?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  category: CampaignTemplateCategory;
  description: string;
  channel: CampaignChannel;
  defaultSubject?: string;
  defaultContent: string;
  preview?: string;
}

export interface CampaignStats {
  active: number;
  scheduled: number;
  totalReach: number;
  avgOpenRate: number;
  avgClickRate: number;
  avgReplyRate: number;
}

export interface CampaignCreateData {
  name: string;
  channel: CampaignChannel;
  templateId?: string;
  audience: string[]; // Customer IDs or segment IDs
  subject?: string;
  content: string;
  scheduledAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CampaignUpdateData {
  name?: string;
  subject?: string;
  content?: string;
  scheduledAt?: string;
  status?: CampaignStatus;
  metadata?: Record<string, unknown>;
}

// Timeline types for the 90-day drip campaign system
export interface TimelineProgress {
  id: string;
  customer: {
    id: string;
    business_name: string;
    email: string;
    pipeline_stage: string;
  };
  timeline: {
    id: string;
    name: string;
    duration_days: number;
    pipeline_stage: string;
  };
  current_day: number;
  status: 'active' | 'paused' | 'completed';
  started_at: string;
  last_action_at: string | null;
  completed_at: string | null;
  paused_at: string | null;
  completed_actions_count: number;
  skipped_actions_count: number;
}

export interface AvailableTimeline {
  id: string;
  name: string;
  slug: string;
  pipeline_stage: string;
  duration_days: number;
  active_enrollments: number;
}

