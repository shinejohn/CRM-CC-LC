// ============================================
// USE AI HOOK - Command Center
// CC-SVC-06: AI Assistant Service
// ============================================

import { useState, useCallback, useRef, useEffect } from 'react';
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

  // Update personality ref when prop changes
  useEffect(() => {
    personalityIdRef.current = options.personalityId;
  }, [options.personalityId]);

  // Load personality if ID provided
  useEffect(() => {
    if (options.personalityId && !currentPersonality) {
      aiService.getPersonality(options.personalityId)
        .then(setCurrentPersonality)
        .catch(err => console.error('Failed to load personality:', err));
    }
  }, [options.personalityId, currentPersonality]);

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

