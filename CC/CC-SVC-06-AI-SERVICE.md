# CC-SVC-06: AI Assistant Service

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-SVC-06 |
| Name | AI Assistant Service |
| Phase | 2 - Core Services |
| Dependencies | CC-CORE-03 (Auth Context) |
| Estimated Time | 3 hours |
| Agent Assignment | Agent 9 |

---

## Purpose

Create a comprehensive AI service layer that handles all AI-related functionality including chat conversations, content generation, tool calling, and personality management. This is the backbone of the "Personal Assistant" (PA) mode in the Command Center.

---

## UI Pattern References

**Primary Reference:** `/magic/patterns/AIInterfacePage.tsx`

Key patterns to extract:
- Chat message structure
- Streaming response handling
- Loading states

**Secondary Reference:** `/magic/patterns/AIWorkflowPanel.tsx`

Key patterns to extract:
- Tool call UI patterns
- Workflow orchestration
- Multi-step AI interactions

**Tertiary Reference:** `/magic/patterns/AccountManagerAI.tsx`

Key patterns to extract:
- AI personality integration
- Contextual suggestions

---

## API Endpoints Used

```
POST   /v1/ai/chat                           # Main chat endpoint
POST   /v1/ai/generate                       # Content generation
GET    /v1/ai/personalities                  # List available personalities
GET    /v1/ai/personalities/{id}             # Get personality details
POST   /v1/ai/personalities/{id}/generate-response  # Personality-specific response
POST   /v1/search/semantic                   # Semantic search for context
```

---

## Deliverables

### 1. AI Service Types

```typescript
// src/command-center/services/ai.types.ts

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
  arguments: Record<string, any>;
  result?: any;
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
  businessContext?: Record<string, any>;
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
```

### 2. AI Service Implementation

```typescript
// src/command-center/services/ai.service.ts

import { 
  AIMessage, 
  AIPersonality, 
  ChatContext, 
  GenerationRequest, 
  GenerationResponse,
  StreamingChunk,
  ToolCall 
} from './ai.types';

class AIService {
  private baseUrl: string;
  private getToken: () => string | null;
  
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
    this.getToken = () => localStorage.getItem('auth_token');
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`,
    };
  }

  /**
   * Send a chat message and receive streaming response
   */
  async *chat(
    messages: AIMessage[],
    context?: ChatContext,
    personalityId?: string
  ): AsyncGenerator<StreamingChunk> {
    const response = await fetch(`${this.baseUrl}/v1/ai/chat`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        context,
        personality_id: personalityId,
        stream: true,
      }),
    });

    if (!response.ok) {
      yield { type: 'error', error: `HTTP ${response.status}` };
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield { type: 'error', error: 'No response body' };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { type: 'done' };
            return;
          }
          try {
            const parsed = JSON.parse(data);
            yield this.parseStreamChunk(parsed);
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }
  }

  private parseStreamChunk(data: any): StreamingChunk {
    if (data.choices?.[0]?.delta?.content) {
      return { type: 'text', content: data.choices[0].delta.content };
    }
    if (data.choices?.[0]?.delta?.tool_calls) {
      return { 
        type: 'tool_call', 
        toolCall: data.choices[0].delta.tool_calls[0] 
      };
    }
    if (data.tool_result) {
      return { type: 'tool_result', toolCall: data.tool_result };
    }
    return { type: 'text', content: '' };
  }

  /**
   * Non-streaming chat for simple queries
   */
  async chatSync(
    messages: AIMessage[],
    context?: ChatContext,
    personalityId?: string
  ): Promise<AIMessage> {
    const response = await fetch(`${this.baseUrl}/v1/ai/chat`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        context,
        personality_id: personalityId,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI chat failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: data.content,
      timestamp: new Date().toISOString(),
      metadata: data.metadata,
    };
  }

  /**
   * Generate content using AI
   */
  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    const response = await fetch(`${this.baseUrl}/v1/ai/generate`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        type: request.type,
        prompt: request.prompt,
        context: request.context,
        personality_id: request.personalityId,
        template: request.template,
      }),
    });

    if (!response.ok) {
      throw new Error(`Content generation failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get available AI personalities
   */
  async getPersonalities(): Promise<AIPersonality[]> {
    const response = await fetch(`${this.baseUrl}/v1/ai/personalities`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch personalities: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get a specific personality
   */
  async getPersonality(id: string): Promise<AIPersonality> {
    const response = await fetch(`${this.baseUrl}/v1/ai/personalities/${id}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch personality: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Generate response with specific personality
   */
  async generateWithPersonality(
    personalityId: string,
    prompt: string,
    context?: ChatContext
  ): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/v1/ai/personalities/${personalityId}/generate-response`,
      {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ prompt, context }),
      }
    );

    if (!response.ok) {
      throw new Error(`Personality response failed: ${response.status}`);
    }

    const data = await response.json();
    return data.content;
  }

  /**
   * Semantic search for context retrieval
   */
  async semanticSearch(query: string, types?: string[]): Promise<Citation[]> {
    const params = new URLSearchParams({ q: query });
    if (types) {
      params.append('types', types.join(','));
    }

    const response = await fetch(
      `${this.baseUrl}/v1/search/semantic?${params}`,
      { headers: this.headers }
    );

    if (!response.ok) {
      throw new Error(`Semantic search failed: ${response.status}`);
    }

    const data = await response.json();
    return data.results.map((r: any) => ({
      source: r.source,
      url: r.url,
      excerpt: r.excerpt,
      relevance: r.score,
    }));
  }
}

export const aiService = new AIService();
```

### 3. useAI Hook

```typescript
// src/command-center/hooks/useAI.ts

import { useState, useCallback, useRef } from 'react';
import { aiService } from '../services/ai.service';
import { 
  AIMessage, 
  AIPersonality, 
  ChatContext, 
  StreamingChunk,
  GenerationRequest 
} from '../services/ai.types';

interface UseAIOptions {
  personalityId?: string;
  context?: ChatContext;
  onToolCall?: (toolCall: any) => void;
}

interface UseAIReturn {
  messages: AIMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  currentPersonality: AIPersonality | null;
  
  // Actions
  sendMessage: (content: string) => Promise<void>;
  regenerate: () => Promise<void>;
  clearHistory: () => void;
  setContext: (context: ChatContext) => void;
  setPersonality: (id: string) => Promise<void>;
  generate: (request: GenerationRequest) => Promise<string>;
  abortStream: () => void;
}

export function useAI(options: UseAIOptions = {}): UseAIReturn {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPersonality, setCurrentPersonality] = useState<AIPersonality | null>(null);
  const [context, setContextState] = useState<ChatContext | undefined>(options.context);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const personalityIdRef = useRef(options.personalityId);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsStreaming(true);
    setError(null);

    // Create placeholder for assistant message
    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: AIMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const allMessages = [...messages, userMessage];
      const stream = aiService.chat(
        allMessages,
        context,
        personalityIdRef.current
      );

      for await (const chunk of stream) {
        switch (chunk.type) {
          case 'text':
            setMessages(prev => 
              prev.map(m => 
                m.id === assistantMessageId
                  ? { ...m, content: m.content + (chunk.content || '') }
                  : m
              )
            );
            break;
          
          case 'tool_call':
            options.onToolCall?.(chunk.toolCall);
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      metadata: {
                        ...m.metadata,
                        toolCalls: [
                          ...(m.metadata?.toolCalls || []),
                          chunk.toolCall as any,
                        ],
                      },
                    }
                  : m
              )
            );
            break;
          
          case 'error':
            setError(chunk.error || 'Unknown error');
            break;
          
          case 'done':
            break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [messages, context, options.onToolCall]);

  const regenerate = useCallback(async () => {
    if (messages.length < 2) return;
    
    // Remove last assistant message
    const lastUserMessageIndex = messages.length - 2;
    const lastUserMessage = messages[lastUserMessageIndex];
    
    if (lastUserMessage.role !== 'user') return;
    
    setMessages(prev => prev.slice(0, -1));
    await sendMessage(lastUserMessage.content);
  }, [messages, sendMessage]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const setContext = useCallback((newContext: ChatContext) => {
    setContextState(newContext);
  }, []);

  const setPersonality = useCallback(async (id: string) => {
    personalityIdRef.current = id;
    try {
      const personality = await aiService.getPersonality(id);
      setCurrentPersonality(personality);
    } catch (err) {
      console.error('Failed to load personality:', err);
    }
  }, []);

  const generate = useCallback(async (request: GenerationRequest): Promise<string> => {
    setIsLoading(true);
    try {
      const response = await aiService.generate({
        ...request,
        context,
        personalityId: personalityIdRef.current,
      });
      return response.content;
    } finally {
      setIsLoading(false);
    }
  }, [context]);

  const abortStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    currentPersonality,
    sendMessage,
    regenerate,
    clearHistory,
    setContext,
    setPersonality,
    generate,
    abortStream,
  };
}
```

### 4. AI Store (Zustand)

```typescript
// src/command-center/stores/aiStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIMessage, AIPersonality, ChatContext } from '../services/ai.types';

interface AIState {
  // Conversation state
  conversations: Record<string, AIMessage[]>;
  activeConversationId: string | null;
  
  // Personality state
  personalities: AIPersonality[];
  activePersonalityId: string | null;
  
  // Context state
  globalContext: ChatContext;
  
  // Preferences
  preferences: {
    streamingEnabled: boolean;
    showToolCalls: boolean;
    autoSuggest: boolean;
  };
  
  // Actions
  createConversation: () => string;
  setActiveConversation: (id: string) => void;
  addMessage: (conversationId: string, message: AIMessage) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<AIMessage>) => void;
  clearConversation: (conversationId: string) => void;
  
  setPersonalities: (personalities: AIPersonality[]) => void;
  setActivePersonality: (id: string | null) => void;
  
  setGlobalContext: (context: Partial<ChatContext>) => void;
  updatePreferences: (prefs: Partial<AIState['preferences']>) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      conversations: {},
      activeConversationId: null,
      personalities: [],
      activePersonalityId: null,
      globalContext: {},
      preferences: {
        streamingEnabled: true,
        showToolCalls: true,
        autoSuggest: true,
      },

      createConversation: () => {
        const id = crypto.randomUUID();
        set(state => ({
          conversations: { ...state.conversations, [id]: [] },
          activeConversationId: id,
        }));
        return id;
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },

      addMessage: (conversationId, message) => {
        set(state => ({
          conversations: {
            ...state.conversations,
            [conversationId]: [
              ...(state.conversations[conversationId] || []),
              message,
            ],
          },
        }));
      },

      updateMessage: (conversationId, messageId, updates) => {
        set(state => ({
          conversations: {
            ...state.conversations,
            [conversationId]: state.conversations[conversationId]?.map(m =>
              m.id === messageId ? { ...m, ...updates } : m
            ) || [],
          },
        }));
      },

      clearConversation: (conversationId) => {
        set(state => ({
          conversations: {
            ...state.conversations,
            [conversationId]: [],
          },
        }));
      },

      setPersonalities: (personalities) => {
        set({ personalities });
      },

      setActivePersonality: (id) => {
        set({ activePersonalityId: id });
      },

      setGlobalContext: (context) => {
        set(state => ({
          globalContext: { ...state.globalContext, ...context },
        }));
      },

      updatePreferences: (prefs) => {
        set(state => ({
          preferences: { ...state.preferences, ...prefs },
        }));
      },
    }),
    {
      name: 'cc-ai-store',
      partialize: (state) => ({
        conversations: state.conversations,
        activePersonalityId: state.activePersonalityId,
        preferences: state.preferences,
      }),
    }
  )
);
```

### 5. AI Chat Component

```typescript
// src/command-center/components/ai/AIChat.tsx

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Paperclip, RefreshCw, StopCircle, Sparkles } from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { AIMessage } from '../../services/ai.types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AIChatProps {
  className?: string;
  context?: any;
  personalityId?: string;
  onToolCall?: (toolCall: any) => void;
}

export function AIChat({ className, context, personalityId, onToolCall }: AIChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    regenerate,
    abortStream,
  } = useAI({
    context,
    personalityId,
    onToolCall,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        
        {isLoading && !isStreaming && (
          <LoadingIndicator />
        )}
        
        {error && (
          <ErrorMessage error={error} onRetry={regenerate} />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-slate-700 p-4">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="min-h-[44px] max-h-[200px] pr-24 resize-none"
            disabled={isLoading}
          />
          
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={isLoading}
            >
              <Paperclip className="w-4 h-4 text-gray-400" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={isLoading}
            >
              <Mic className="w-4 h-4 text-gray-400" />
            </Button>
            
            {isStreaming ? (
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={abortStream}
              >
                <StopCircle className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                className="h-8 w-8 bg-purple-500 hover:bg-purple-600"
                disabled={!input.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// Sub-components
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8 text-purple-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        AI Assistant Ready
      </h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm">
        Ask me anything about your business, customers, or content. I can help you draft emails, analyze data, and more.
      </p>
    </div>
  );
}

function MessageBubble({ message }: { message: AIMessage }) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3
          ${isUser
            ? 'bg-purple-500 text-white'
            : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
          }
        `}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        {message.metadata?.toolCalls && message.metadata.toolCalls.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/20">
            {message.metadata.toolCalls.map((tool) => (
              <ToolCallIndicator key={tool.id} toolCall={tool} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ToolCallIndicator({ toolCall }: { toolCall: any }) {
  return (
    <div className="text-xs opacity-70 flex items-center gap-1">
      <span>🔧</span>
      <span>{toolCall.name}</span>
      {toolCall.status === 'running' && <span className="animate-pulse">...</span>}
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm">Thinking...</span>
    </div>
  );
}

function ErrorMessage({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
      <Button variant="ghost" size="sm" onClick={onRetry}>
        <RefreshCw className="w-4 h-4 mr-1" />
        Retry
      </Button>
    </div>
  );
}
```

---

## Testing Requirements

```typescript
// src/command-center/services/__tests__/ai.service.test.ts

import { aiService } from '../ai.service';

describe('AIService', () => {
  it('sends chat messages', async () => {
    const messages = [{ id: '1', role: 'user' as const, content: 'Hello', timestamp: '' }];
    // Mock fetch and test
  });

  it('handles streaming responses', async () => {
    // Test streaming generator
  });

  it('generates content', async () => {
    // Test content generation
  });

  it('fetches personalities', async () => {
    // Test personality fetching
  });
});
```

---

## Acceptance Criteria

- [ ] aiService singleton exports all required methods
- [ ] Streaming chat works with proper chunk parsing
- [ ] Non-streaming chat returns complete messages
- [ ] Content generation supports all types
- [ ] Personality selection works
- [ ] useAI hook manages conversation state
- [ ] AI store persists conversations
- [ ] AIChat component renders messages
- [ ] Loading and error states display correctly
- [ ] Tool calls display in UI
- [ ] Abort streaming works

---

## Handoff

When complete, this module provides:

1. `aiService` - Singleton service instance
2. `useAI` - React hook for AI interactions
3. `useAIStore` - Zustand store for AI state
4. `AIChat` - Ready-to-use chat component

Other agents import:
```typescript
import { aiService } from '@/command-center/services/ai.service';
import { useAI } from '@/command-center/hooks/useAI';
import { useAIStore } from '@/command-center/stores/aiStore';
import { AIChat } from '@/command-center/components/ai/AIChat';
```
