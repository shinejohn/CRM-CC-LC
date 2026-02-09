// ============================================
// CRM API SERVICE
// ============================================

import { apiClient, type PaginatedResponse } from '../learning/api-client';

// Export helper functions for use in other files
export async function listCustomers(params?: {
  search?: string;
  industry_category?: string;
  lead_score_min?: number;
  per_page?: number;
  page?: number;
}): Promise<Customer[]> {
  const response = await customerApi.list(
    params || {},
    params?.page || 1,
    params?.per_page || 20
  );
  return response.data;
}

export async function getCustomer(id: string): Promise<Customer> {
  return customerApi.get(id);
}

// ============================================
// TYPES
// ============================================

export type PipelineStage = 'hook' | 'engagement' | 'sales' | 'retention' | 'churned';

export interface Customer {
  id: string;
  tenant_id: string;
  slug: string;
  external_id?: string;
  business_name: string;
  owner_name?: string;
  industry_id?: string;
  sub_category?: string;
  phone?: string;
  email?: string;
  website?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  timezone?: string;
  hours?: Record<string, string>;
  services?: string[];
  social_media?: Record<string, string>;
  pos_system?: string;
  current_integrations?: string[];
  google_rating?: number;
  google_review_count?: number;
  yelp_rating?: number;
  yelp_review_count?: number;
  established_year?: number;
  employee_count?: number;
  annual_revenue_range?: string;
  challenges?: string[];
  goals?: string[];
  competitors?: string[];
  unique_selling_points?: string[];
  unknown_fields?: Record<string, unknown>;
  lead_source?: string;
  lead_score: number;
  subscription_tier?: string;
  first_contact_at?: string;
  onboarded_at?: string;
  assigned_rep?: string;
  notes?: string;
  tags?: string[];
  // AI-First CRM fields
  industry_category?: string;
  industry_subcategory?: string;
  business_description?: string;
  products_services?: Record<string, unknown>;
  target_audience?: Record<string, unknown>;
  business_hours?: Record<string, unknown>;
  service_area?: string;
  brand_voice?: Record<string, unknown>;
  content_preferences?: Record<string, unknown>;
  contact_preferences?: Record<string, unknown>;
  // Pipeline stage fields
  pipeline_stage?: PipelineStage;
  stage_entered_at?: string;
  trial_started_at?: string;
  trial_ends_at?: string;
  days_in_stage?: number;
  stage_history?: Array<{
    from?: string;
    to: string;
    at: string;
    days_in_previous: number;
    trigger?: string;
  }>;
  engagement_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  customer_id?: string;
  session_id: string;
  entry_point?: string;
  template_id?: string;
  slide_at_start?: number;
  presenter_id?: string;
  human_rep_id?: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
  }>;
  topics_discussed?: string[];
  questions_asked?: Record<string, unknown>;
  objections_raised?: Record<string, unknown>;
  sentiment_trajectory?: Record<string, unknown>;
  new_data_collected?: Record<string, unknown>;
  faqs_generated?: string[];
  outcome?: string;
  outcome_details?: string;
  followup_needed: boolean;
  followup_scheduled_at?: string;
  followup_notes?: string;
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used?: number;
  model_used?: string;
  response_time_ms?: number;
  actions_triggered?: Record<string, unknown>;
  timestamp: string;
}

export interface CustomerFilters {
  industry_category?: string;
  lead_score_min?: number;
  search?: string;
}

export interface ConversationFilters {
  customer_id?: string;
  outcome?: string;
  start_date?: string;
  end_date?: string;
}

// ============================================
// CUSTOMER API
// ============================================

export const customerApi = {
  /**
   * List customers with optional filters
   */
  list: async (
    filters: CustomerFilters = {},
    page = 1,
    perPage = 20
  ): Promise<PaginatedResponse<Customer>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...Object.fromEntries(
        Object.entries(filters)
          .filter(([_, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => [k, String(v)])
      ),
    });

    return apiClient.get<PaginatedResponse<Customer>>(
      `/api/v1/customers?${params.toString()}`
    );
  },

  /**
   * Get customer by ID
   */
  get: async (id: string): Promise<Customer> => {
    const response = await apiClient.get<{ data: Customer }>(`/api/v1/customers/${id}`);
    return response.data;
  },

  /**
   * Get customer by slug
   */
  getBySlug: async (slug: string): Promise<Customer> => {
    const response = await apiClient.get<{ data: Customer }>(`/api/v1/customers/slug/${slug}`);
    return response.data;
  },

  /**
   * Create a new customer
   */
  create: async (data: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.post<{ data: Customer; message?: string }>(
      '/api/v1/customers',
      data
    );
    return response.data;
  },

  /**
   * Update customer
   */
  update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    const response = await apiClient.put<{ data: Customer; message?: string }>(
      `/api/v1/customers/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete customer
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete<{ message: string }>(`/api/v1/customers/${id}`);
  },

  /**
   * Update business context (AI-first CRM fields)
   */
  updateBusinessContext: async (
    id: string,
    context: Partial<Customer>
  ): Promise<Customer> => {
    const response = await apiClient.put<{ data: Customer; message?: string }>(
      `/api/v1/customers/${id}/business-context`,
      context
    );
    return response.data;
  },

  /**
   * Get AI context for customer (structured data for AI)
   */
  getAiContext: async (id: string): Promise<Record<string, unknown>> => {
    const response = await apiClient.get<{ data: Record<string, unknown> }>(
      `/api/v1/customers/${id}/ai-context`
    );
    return response.data;
  },

  /**
   * Get customers by pipeline stage
   */
  getCustomersByStage: async (stage: PipelineStage): Promise<PaginatedResponse<Customer>> => {
    return apiClient.get<PaginatedResponse<Customer>>(
      `/api/v1/customers?pipeline_stage=${stage}`
    );
  },

  /**
   * Update customer pipeline stage
   */
  updatePipelineStage: async (
    id: string,
    stage: PipelineStage,
    trigger: string = 'manual'
  ): Promise<Customer> => {
    const response = await apiClient.put<{ data: Customer; message?: string }>(
      `/api/v1/customers/${id}/pipeline-stage`,
      { pipeline_stage: stage, trigger }
    );
    return response.data;
  },
};

// ============================================
// CONVERSATION API
// ============================================

export const conversationApi = {
  /**
   * List conversations with optional filters
   */
  list: async (
    filters: ConversationFilters = {},
    page = 1,
    perPage = 20
  ): Promise<PaginatedResponse<Conversation>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...Object.fromEntries(
        Object.entries(filters)
          .filter(([_, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => [k, String(v)])
      ),
    });

    return apiClient.get<PaginatedResponse<Conversation>>(
      `/api/v1/conversations?${params.toString()}`
    );
  },

  /**
   * Get conversation by ID
   */
  get: async (id: string): Promise<Conversation> => {
    const response = await apiClient.get<{ data: Conversation }>(`/api/v1/conversations/${id}`);
    return response.data;
  },

  /**
   * Create a new conversation
   */
  create: async (data: Partial<Conversation>): Promise<Conversation> => {
    const response = await apiClient.post<{ data: Conversation; message?: string }>(
      '/api/v1/conversations',
      data
    );
    return response.data;
  },

  /**
   * Update conversation
   */
  update: async (id: string, data: Partial<Conversation>): Promise<Conversation> => {
    const response = await apiClient.put<{ data: Conversation; message?: string }>(
      `/api/v1/conversations/${id}`,
      data
    );
    return response.data;
  },

  /**
   * End conversation (calculates duration)
   */
  end: async (id: string): Promise<Conversation> => {
    const response = await apiClient.post<{ data: Conversation; message?: string }>(
      `/api/v1/conversations/${id}/end`,
      {}
    );
    return response.data;
  },

  /**
   * Add message to conversation
   */
  addMessage: async (
    id: string,
    message: Partial<ConversationMessage>
  ): Promise<ConversationMessage> => {
    const response = await apiClient.post<{ data: ConversationMessage; message?: string }>(
      `/api/v1/conversations/${id}/messages`,
      message
    );
    return response.data;
  },

  /**
   * Get all messages for a conversation
   */
  getMessages: async (id: string): Promise<ConversationMessage[]> => {
    const response = await apiClient.get<{ data: ConversationMessage[] }>(
      `/api/v1/conversations/${id}/messages`
    );
    return response.data;
  },
};
