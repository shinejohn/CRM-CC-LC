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
  metadata?: Record<string, any>;
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
  metadata?: Record<string, any>;
}

export interface CampaignUpdateData {
  name?: string;
  subject?: string;
  content?: string;
  scheduledAt?: string;
  status?: CampaignStatus;
  metadata?: Record<string, any>;
}

