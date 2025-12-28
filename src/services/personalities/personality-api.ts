// ============================================
// AI PERSONALITIES API
// ============================================

import { apiClient, type PaginatedResponse } from '../learning/api-client';

export interface AiPersonality {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  identity: string;
  persona_description: string;
  communication_style: string;
  traits: string[] | null;
  expertise_areas: string[] | null;
  can_email: boolean;
  can_call: boolean;
  can_sms: boolean;
  can_chat: boolean;
  contact_email: string | null;
  contact_phone: string | null;
  system_prompt: string;
  greeting_message: string | null;
  custom_instructions: string[] | null;
  ai_model: string;
  temperature: number;
  active_hours: Record<string, number> | null;
  working_days: string[] | null;
  timezone: string;
  is_active: boolean;
  priority: number;
  metadata: Record<string, any> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonalityAssignment {
  id: string;
  personality_id: string;
  customer_id: string;
  tenant_id: string;
  status: 'active' | 'inactive' | 'archived';
  assigned_at: string;
  last_interaction_at: string | null;
  assignment_rules: Record<string, any> | null;
  context: Record<string, any> | null;
  interaction_count: number;
  conversation_count: number;
  average_rating: number | null;
  performance_metrics: Record<string, any> | null;
  notes: string | null;
  personality?: AiPersonality;
  customer?: any;
  created_at: string;
  updated_at: string;
}

export interface CreatePersonalityRequest {
  name: string;
  identity: string;
  persona_description: string;
  communication_style: string;
  system_prompt: string;
  description?: string;
  traits?: string[];
  expertise_areas?: string[];
  can_email?: boolean;
  can_call?: boolean;
  can_sms?: boolean;
  can_chat?: boolean;
  contact_email?: string;
  contact_phone?: string;
  greeting_message?: string;
  custom_instructions?: string[];
  ai_model?: string;
  temperature?: number;
  active_hours?: Record<string, number>;
  working_days?: string[];
  timezone?: string;
  priority?: number;
}

/**
 * List personalities
 */
export async function listPersonalities(params?: {
  is_active?: boolean;
  per_page?: number;
  page?: number;
}): Promise<AiPersonality[]> {
  const response = await apiClient.get<PaginatedResponse<AiPersonality>>(
    '/api/v1/personalities',
    { params }
  );
  return response.data.data;
}

/**
 * Get personality details
 */
export async function getPersonality(id: string): Promise<AiPersonality> {
  const response = await apiClient.get<{ data: AiPersonality }>(
    `/api/v1/personalities/${id}`
  );
  return response.data.data;
}

/**
 * Create personality
 */
export async function createPersonality(
  request: CreatePersonalityRequest
): Promise<AiPersonality> {
  const response = await apiClient.post<{ data: AiPersonality }>(
    '/api/v1/personalities',
    request
  );
  return response.data.data;
}

/**
 * Update personality
 */
export async function updatePersonality(
  id: string,
  updates: Partial<CreatePersonalityRequest & { is_active?: boolean }>
): Promise<AiPersonality> {
  const response = await apiClient.put<{ data: AiPersonality }>(
    `/api/v1/personalities/${id}`,
    updates
  );
  return response.data.data;
}

/**
 * Delete personality
 */
export async function deletePersonality(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/personalities/${id}`);
}

/**
 * Assign personality to customer
 */
export async function assignToCustomer(request: {
  customer_id: string;
  personality_id?: string;
  rules?: Record<string, any>;
}): Promise<PersonalityAssignment> {
  const response = await apiClient.post<{ data: PersonalityAssignment }>(
    '/api/v1/personalities/assign',
    request
  );
  return response.data.data;
}

/**
 * Get customer's assigned personality
 */
export async function getCustomerPersonality(
  customerId: string
): Promise<PersonalityAssignment | null> {
  const response = await apiClient.get<{ data: PersonalityAssignment | null }>(
    `/api/v1/personalities/customers/${customerId}/personality`
  );
  return response.data.data;
}

/**
 * List personality assignments
 */
export async function listAssignments(params?: {
  personality_id?: string;
  status?: string;
  per_page?: number;
  page?: number;
}): Promise<PersonalityAssignment[]> {
  const response = await apiClient.get<PaginatedResponse<PersonalityAssignment>>(
    '/api/v1/personalities/assignments',
    { params }
  );
  return response.data.data;
}

/**
 * Generate response using personality
 */
export async function generateResponse(
  personalityId: string,
  request: {
    message: string;
    conversation_context?: Array<{ role: string; content: string }>;
    customer_id?: string;
  }
): Promise<{ response: string; personality_id: string; personality_name: string }> {
  const response = await apiClient.post<{
    data: { response: string; personality_id: string; personality_name: string };
  }>(`/api/v1/personalities/${personalityId}/generate-response`, request);
  return response.data.data;
}
