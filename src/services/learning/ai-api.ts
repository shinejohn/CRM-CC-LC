// ============================================
// AI CONVERSATION API SERVICE
// ============================================

import { apiClient } from './api-client';

export interface AIConversationRequest {
  message: string;
  context?: {
    customer_id?: string;
    presentation_id?: string;
    conversation_id?: string;
  };
  agent_id?: string;
}

export interface AIConversationResponse {
  response: string;
  conversation_id: string;
  message_id: string;
  suggested_actions?: Array<{
    type: string;
    data: Record<string, unknown>;
  }>;
  confidence_score?: number;
}

export interface AIContextRequest {
  customer_id: string;
  template_id?: string;
}

export interface AIContextResponse {
  context: string;
  product_knowledge: string[];
  industry_knowledge: string[];
  customer_data: Record<string, unknown>;
}

export const aiApi = {
  // Send a message to the AI
  sendMessage: async (request: AIConversationRequest): Promise<AIConversationResponse> => {
    return apiClient.post<AIConversationResponse>('/learning/ai/chat', request);
  },

  // Get AI context for a customer
  getContext: async (request: AIContextRequest): Promise<AIContextResponse> => {
    return apiClient.post<AIContextResponse>('/learning/ai/context', request);
  },

  // Generate FAQ from conversation
  generateFAQ: async (conversationId: string, question: string, answer: string): Promise<{
    faq_id: string;
    success: boolean;
  }> => {
    return apiClient.post('/learning/ai/generate-faq', {
      conversation_id: conversationId,
      question,
      answer,
    });
  },

  // Process AI actions (update customer data, create FAQs, etc.)
  processActions: async (actions: Array<{
    type: string;
    data: Record<string, unknown>;
  }>): Promise<{
    success: boolean;
    results: Array<{
      action_type: string;
      success: boolean;
      result_id?: string;
    }>;
  }> => {
    return apiClient.post('/learning/ai/process-actions', { actions });
  },
};


