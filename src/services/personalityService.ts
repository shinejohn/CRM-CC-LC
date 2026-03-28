/**
 * AI personality operations
 */

import { apiClient } from '@/services/api';
import type {
  AiPersonality,
  PersonalityAssignment,
  GenerateResponseParams,
  GenerateResponseResult,
} from '../types/personality';
import type { ApiResponse } from '../types/common';

export const personalityService = {
  list: () =>
    apiClient.get<ApiResponse<AiPersonality[]>>('/personalities').then((r: any) => r.data.data ?? r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<AiPersonality>>(`/personalities/${id}`).then((r: any) => r.data.data),

  getAssignments: () =>
    apiClient.get<ApiResponse<PersonalityAssignment[]>>('/personalities/assignments').then((r: any) => r.data.data ?? r.data),

  assignToCustomer: (personalityId: string, customerId: string) =>
    apiClient.post<ApiResponse<PersonalityAssignment>>('/personalities/assign', {
      personality_id: personalityId,
      customer_id: customerId,
    }).then((r: any) => r.data.data),

  getCustomerPersonality: (customerId: string) =>
    apiClient.get<ApiResponse<AiPersonality | null>>(`/personalities/customers/${customerId}/personality`).then((r: any) => r.data.data),

  /**
   * Generate AI response using personality. Uses non-streaming (backend does not support SSE yet).
   */
  generateResponse: async (
    personalityId: string,
    params: GenerateResponseParams
  ): Promise<GenerateResponseResult> => {
    const body: Record<string, unknown> = {
      message: params.message,
      conversation_context: params.conversation_context ?? [],
      customer_id: params.customer_id,
    };
    const response = await apiClient.post<ApiResponse<GenerateResponseResult>>(
      `/personalities/${personalityId}/generate-response`,
      body
    );
    const data = response.data.data ?? (response.data as unknown as GenerateResponseResult);
    return {
      response: data.response,
      personality_id: data.personality_id,
      personality_name: data.personality_name,
    };
  },

  /**
   * Stream chat response (SSE). Falls back to non-streaming if backend does not support.
   */
  streamChat: async (
    personalityId: string,
    message: string,
    onChunk: (text: string) => void,
    options?: { customerId?: string; conversationContext?: Array<{ role: string; content: string }> }
  ): Promise<string> => {
    try {
      const token = localStorage.getItem('auth_token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const response = await fetch(`${baseUrl}/personalities/${personalityId}/generate-response`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message,
          stream: true,
          customer_id: options?.customerId,
          conversation_context: options?.conversationContext ?? [],
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');
        const decoder = new TextDecoder();
        let fullText = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullText += chunk;
          onChunk(chunk);
        }
        return fullText;
      }
    } catch {
      /* fall through to non-streaming */
    }
    const result = await personalityService.generateResponse(personalityId, {
      message,
      customer_id: options?.customerId,
      conversation_context: options?.conversationContext,
    });
    onChunk(result.response);
    return result.response;
  },
};
