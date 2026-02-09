// ============================================
// AI SERVICE TYPES - Command Center
// CC-SVC-06: AI Assistant Service
// ============================================

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    toolCalls?: ToolCall[];
    citations?: Citation[];
    model?: string;
    tokens?: { input: number; output: number };
  };
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export interface Citation {
  source: string;
  url?: string;
  excerpt: string;
  relevance: number;
}

export interface AIPersonality {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  systemPrompt: string;
  traits: string[];
  capabilities: string[];
}

export interface ChatContext {
  customerId?: string;
  customerName?: string;
  businessContext?: Record<string, unknown>;
  currentPage?: string;
  selectedContent?: string;
}

export interface GenerationRequest {
  type: 'email' | 'sms' | 'social' | 'article' | 'ad';
  prompt: string;
  context?: ChatContext;
  personalityId?: string;
  template?: string;
}

export interface GenerationResponse {
  id: string;
  content: string;
  metadata: {
    type: string;
    tokens: number;
    model: string;
  };
}

export interface StreamingChunk {
  type: 'text' | 'tool_call' | 'tool_result' | 'done' | 'error';
  content?: string;
  toolCall?: Partial<ToolCall>;
  error?: string;
}

