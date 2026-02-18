/**
 * Maps API customer response (snake_case, backend schema) to UI Customer format.
 * Backend returns: business_name, owner_name, engagement_score, pipeline_stage, etc.
 * UI expects: name, company, stage, engagementScore, tags (command-center types).
 */

import type { Customer as UICustomer, CustomerStage } from '@/types/command-center';

/** API customer shape from backend (Laravel model serialization) */
export interface ApiCustomer {
  id: string;
  business_name?: string;
  owner_name?: string;
  primary_contact_name?: string;
  dba_name?: string;
  email?: string;
  primary_email?: string;
  phone?: string;
  primary_phone?: string;
  engagement_score?: number;
  engagement_tier?: number;
  pipeline_stage?: string;
  tags?: string[];
  last_email_open?: string;
  last_email_click?: string;
  last_content_view?: string;
  last_approval?: string;
  [key: string]: unknown;
}

const PIPELINE_TO_STAGE: Record<string, CustomerStage> = {
  hook: 'lead',
  engagement: 'prospect',
  sales: 'customer',
  retention: 'advocate',
  churned: 'churned',
};

export function mapApiCustomerToUi(api: ApiCustomer): UICustomer {
  const name =
    api.business_name || api.owner_name || api.primary_contact_name || api.dba_name || 'Unknown';
  const email = api.email || api.primary_email || '';
  const phone = api.phone || api.primary_phone;
  const company = api.business_name;
  const engagementScore = api.engagement_score ?? 0;
  const pipelineStage = (api.pipeline_stage || 'hook').toLowerCase();
  const stage = PIPELINE_TO_STAGE[pipelineStage] ?? 'lead';
  const tags = Array.isArray(api.tags) ? api.tags : [];
  const lastInteraction =
    api.last_email_open || api.last_email_click || api.last_content_view || api.last_approval;

  return {
    id: api.id,
    name,
    email,
    phone,
    company,
    stage,
    engagementScore,
    predictiveScore: engagementScore, // Fallback; can be fetched separately
    lastInteraction,
    tags,
  };
}
