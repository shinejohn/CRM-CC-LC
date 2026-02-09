// ============================================
// INTERACTION API SERVICE
// ============================================

import { apiClient } from './api-client';

export interface Interaction {
  id: string;
  tenant_id: string;
  customer_id: string;
  type: string;
  title: string;
  description?: string;
  notes?: string;
  scheduled_at?: string;
  completed_at?: string;
  due_at?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'skipped';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  template_id?: string;
  next_interaction_id?: string;
  previous_interaction_id?: string;
  entry_point?: string;
  campaign_id?: string;
  conversation_id?: string;
  outcome?: string;
  outcome_details?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  customer?: any;
  template?: InteractionTemplate;
  next_interaction?: Interaction;
  previous_interaction?: Interaction;
}

export interface InteractionTemplate {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description?: string;
  steps: Array<{
    step_number: number;
    type: string;
    title: string;
    description?: string;
    scheduled_offset_days?: number;
    due_offset_days?: number;
    next_step?: number;
    metadata?: Record<string, any>;
  }>;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInteractionData {
  customer_id: string;
  type: string;
  title: string;
  description?: string;
  notes?: string;
  scheduled_at?: string;
  due_at?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'skipped';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  template_id?: string;
  campaign_id?: string;
  conversation_id?: string;
  entry_point?: string;
  metadata?: Record<string, any>;
}

export interface StartWorkflowData {
  customer_id: string;
  template_id: string;
  start_date?: string;
  campaign_id?: string;
}

export const interactionApi = {
  /**
   * Get all interactions
   */
  getInteractions: async (params?: {
    customer_id?: string;
    status?: string;
    type?: string;
    overdue?: boolean;
    due_soon?: boolean;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
  }): Promise<{
    data: Interaction[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> => {
    return apiClient.get('/v1/interactions', { params });
  },

  /**
   * Get interaction by ID
   */
  getInteraction: async (id: string): Promise<Interaction> => {
    return apiClient.get(`/v1/interactions/${id}`);
  },

  /**
   * Create a new interaction
   */
  createInteraction: async (data: CreateInteractionData): Promise<Interaction> => {
    return apiClient.post('/v1/interactions', data);
  },

  /**
   * Update an interaction
   */
  updateInteraction: async (
    id: string,
    data: Partial<CreateInteractionData>
  ): Promise<Interaction> => {
    return apiClient.put(`/v1/interactions/${id}`, data);
  },

  /**
   * Complete an interaction (triggers next step creation)
   */
  completeInteraction: async (
    id: string,
    outcome?: string,
    outcomeDetails?: string
  ): Promise<{
    data: Interaction;
    next_interaction?: Interaction;
    message: string;
  }> => {
    return apiClient.post(`/v1/interactions/${id}/complete`, {
      outcome,
      outcome_details: outcomeDetails,
    });
  },

  /**
   * Cancel an interaction
   */
  cancelInteraction: async (id: string): Promise<Interaction> => {
    return apiClient.post(`/v1/interactions/${id}/cancel`);
  },

  /**
   * Start a workflow from a template
   */
  startWorkflow: async (data: StartWorkflowData): Promise<Interaction> => {
    return apiClient.post('/v1/interactions/workflow/start', data);
  },

  /**
   * Get next pending interaction for a customer
   */
  getNextPending: async (customerId: string): Promise<Interaction | null> => {
    return apiClient.get(`/v1/interactions/customers/${customerId}/next`);
  },

  /**
   * Get all pending interactions for a customer
   */
  getPending: async (customerId: string): Promise<Interaction[]> => {
    return apiClient.get(`/v1/interactions/customers/${customerId}/pending`);
  },

  /**
   * Get overdue interactions for a customer
   */
  getOverdue: async (customerId: string): Promise<Interaction[]> => {
    return apiClient.get(`/v1/interactions/customers/${customerId}/overdue`);
  },

  /**
   * Get interaction templates
   */
  getTemplates: async (activeOnly?: boolean): Promise<InteractionTemplate[]> => {
    return apiClient.get('/v1/interactions/templates', {
      params: { active_only: activeOnly },
    });
  },

  /**
   * Create interaction template
   */
  createTemplate: async (data: {
    name: string;
    description?: string;
    steps: InteractionTemplate['steps'];
    is_active?: boolean;
    is_default?: boolean;
  }): Promise<InteractionTemplate> => {
    return apiClient.post('/v1/interactions/templates', data);
  },
};

