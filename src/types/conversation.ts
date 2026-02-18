/**
 * Conversation and messaging types
 */

export interface Conversation {
  id: string;
  customer_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface PendingQuestion {
  id: string;
  customer_id: string;
  question: string;
  status: string;
  created_at: string;
}
