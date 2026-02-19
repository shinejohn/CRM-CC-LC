/**
 * AI Chat Service - Unified service for personality-based chat
 * Wires to Publishing Platform personality generate-response API
 */

import { personalityService } from './personalityService';
import type { AiPersonality } from '../types/personality';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sender?: string;
  isAI?: boolean;
  timestamp?: string;
}

export interface SendMessageOptions {
  personalityId: string;
  customerId?: string;
  conversationContext?: Array<{ role: string; content: string }>;
  onChunk?: (text: string) => void;
}

/**
 * Send a message to the AI personality and get a response.
 * Uses streaming if backend supports it, otherwise non-streaming.
 */
export async function sendChatMessage(
  message: string,
  options: SendMessageOptions
): Promise<string> {
  const { personalityId, customerId, conversationContext, onChunk } = options;

  if (onChunk) {
    return personalityService.streamChat(
      personalityId,
      message,
      onChunk,
      { customerId, conversationContext }
    );
  }

  const result = await personalityService.generateResponse(personalityId, {
    message,
    customer_id: customerId,
    conversation_context: conversationContext,
  });
  return result.response;
}

/**
 * Build conversation context from chat messages for API
 */
export function buildConversationContext(messages: ChatMessage[]): Array<{ role: string; content: string }> {
  return messages.slice(-10).map((m) => ({
    role: m.isAI ?? m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));
}

/**
 * Get default/primary personality for chat when none specified.
 * Returns first active personality from list.
 */
export async function getDefaultPersonality(): Promise<AiPersonality | null> {
  try {
    const list = await personalityService.list();
    const personalities = Array.isArray(list) ? list : (list as { data?: AiPersonality[] })?.data ?? [];
    return personalities.find((p) => p.is_active !== false) ?? personalities[0] ?? null;
  } catch {
    return null;
  }
}
