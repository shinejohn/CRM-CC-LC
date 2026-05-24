// ============================================
// AI ACTION REGISTRY
// Defines all actions the AI can perform on behalf of the user
// CC-SVC-AI-ACTIONS: Frontend action registry
// ============================================

import { apiService } from './api.service';

export interface AIActionParam {
  type: string;
  description: string;
  required: boolean;
}

export interface AIAction {
  name: string;
  label: string;
  description: string;
  parameters: Record<string, AIActionParam>;
  requiresConfirmation: boolean;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
}

// ── Action Implementations ────────────────────────────────────────────────────

async function callActionEndpoint(
  action: string,
  arguments_: Record<string, unknown>,
  taskId?: string
): Promise<unknown> {
  const response = await apiService.post<{ task_id: string; result: unknown }>('/v1/ai/actions/execute', {
    action,
    arguments: arguments_,
    confirmed: true,
    task_id: taskId,
  });

  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? `Action ${action} failed`);
  }

  return response.data.result;
}

// ── Registry ──────────────────────────────────────────────────────────────────

export const AI_ACTIONS: Record<string, AIAction> = {
  lookup_customer: {
    name: 'lookup_customer',
    label: 'Look Up Customer',
    description: 'Search for a customer by name or ID and return their profile',
    requiresConfirmation: false,
    parameters: {
      name: { type: 'string', description: 'Business or owner name to search for', required: false },
      customer_id: { type: 'string', description: 'Customer UUID', required: false },
    },
    execute: (params) => callActionEndpoint('lookup_customer', params),
  },

  create_followup_task: {
    name: 'create_followup_task',
    label: 'Create Follow-Up Task',
    description: 'Create a follow-up task for a customer',
    requiresConfirmation: true,
    parameters: {
      customer_id: { type: 'string', description: 'Customer UUID', required: false },
      title: { type: 'string', description: 'Task title', required: true },
      due_date: { type: 'string', description: 'Due date (ISO 8601)', required: false },
      notes: { type: 'string', description: 'Additional notes', required: false },
    },
    execute: (params) => callActionEndpoint('create_followup_task', params),
  },

  draft_email: {
    name: 'draft_email',
    label: 'Draft Email',
    description: 'Draft an outbound email to a customer',
    requiresConfirmation: true,
    parameters: {
      customer_id: { type: 'string', description: 'Customer UUID', required: false },
      subject: { type: 'string', description: 'Email subject line', required: true },
      purpose: { type: 'string', description: 'Purpose of the email', required: false },
      tone: { type: 'string', description: 'Email tone (professional/friendly/urgent)', required: false },
    },
    execute: (params) => callActionEndpoint('draft_email', params),
  },

  update_deal_stage: {
    name: 'update_deal_stage',
    label: 'Update Deal Stage',
    description: 'Move a deal to a new pipeline stage',
    requiresConfirmation: true,
    parameters: {
      deal_id: { type: 'string', description: 'Deal UUID', required: true },
      stage: { type: 'string', description: 'New deal stage (e.g., proposal, negotiation, closed)', required: true },
    },
    execute: (params) => callActionEndpoint('update_deal_stage', params),
  },

  generate_pitch: {
    name: 'generate_pitch',
    label: 'Generate Sales Pitch',
    description: 'Generate a sales pitch for a specific product/customer combination',
    requiresConfirmation: false,
    parameters: {
      customer_name: { type: 'string', description: 'Customer or business name', required: true },
      product_tier: { type: 'string', description: 'Fibonacco product tier (basic/professional/enterprise)', required: false },
      pain_points: { type: 'string', description: 'Known customer pain points', required: false },
      industry: { type: 'string', description: 'Customer industry', required: false },
    },
    execute: (params) => callActionEndpoint('generate_pitch', params),
  },

  get_pipeline_summary: {
    name: 'get_pipeline_summary',
    label: 'Get Pipeline Summary',
    description: 'Return current pipeline stats and deal counts by stage',
    requiresConfirmation: false,
    parameters: {},
    execute: (params) => callActionEndpoint('get_pipeline_summary', params),
  },

  lookup_product_pricing: {
    name: 'lookup_product_pricing',
    label: 'Look Up Product Pricing',
    description: 'Return pricing details for a Fibonacco product tier',
    requiresConfirmation: false,
    parameters: {
      tier: { type: 'string', description: 'Product tier name (basic/professional/enterprise/community_influencer/all)', required: false },
    },
    execute: (params) => callActionEndpoint('lookup_product_pricing', params),
  },

  schedule_callback: {
    name: 'schedule_callback',
    label: 'Schedule Callback',
    description: 'Schedule a callback or reminder for a customer',
    requiresConfirmation: true,
    parameters: {
      customer_id: { type: 'string', description: 'Customer UUID', required: false },
      scheduled_at: { type: 'string', description: 'Scheduled date/time (ISO 8601)', required: false },
      notes: { type: 'string', description: 'Callback notes', required: false },
    },
    execute: (params) => callActionEndpoint('schedule_callback', params),
  },

  generate_social_post: {
    name: 'generate_social_post',
    label: 'Generate Social Post',
    description: 'Draft a social media post for a customer\'s business',
    requiresConfirmation: true,
    parameters: {
      business_name: { type: 'string', description: 'Business name', required: true },
      platform: { type: 'string', description: 'Platform (facebook/instagram/twitter/linkedin)', required: false },
      topic: { type: 'string', description: 'Post topic or theme', required: true },
      tone: { type: 'string', description: 'Post tone (friendly/professional/exciting)', required: false },
    },
    execute: (params) => callActionEndpoint('generate_social_post', params),
  },

  run_diagnostic: {
    name: 'run_diagnostic',
    label: 'Run Marketing Diagnostic',
    description: 'Run a marketing diagnostic on a customer\'s current services and opportunities',
    requiresConfirmation: false,
    parameters: {
      customer_id: { type: 'string', description: 'Customer UUID', required: true },
    },
    execute: (params) => callActionEndpoint('run_diagnostic', params),
  },
};

/** Human-readable parameter summary for the confirmation dialog */
export function formatActionParams(action: AIAction, params: Record<string, unknown>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${String(v)}`)
    .join('\n');
}
