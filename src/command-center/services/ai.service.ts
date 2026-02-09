// ============================================
// AI SERVICE - Command Center
// CC-SVC-06: AI Assistant Service
// ============================================

import { apiService } from './api.service';
import {
  AIMessage,
  AIPersonality,
  ChatContext,
  GenerationRequest,
  GenerationResponse,
  StreamingChunk,
  ToolCall,
  Citation
} from './ai.types';

class AIService {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_ENDPOINT || '/api';
    // Get token from AuthContext via apiService
    this.getToken = () => {
      try {
        const stored = localStorage.getItem('cc_auth_tokens');
        if (stored) {
          const tokens = JSON.parse(stored);
          return tokens.accessToken || null;
        }
      } catch (e) {
        console.error('Failed to get token from storage', e);
      }
      return null;
    };
  }

  private get headers() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
    const token = this.getToken();
    if (!token) {
      yield { type: 'error', error: 'Not authenticated' };
      return;
    }

    try {
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
        const errorText = await response.text();
        yield { type: 'error', error: `HTTP ${response.status}: ${errorText}` };
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
    } catch (error) {
      yield {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private parseStreamChunk(data: {
    choices?: Array<{ delta?: { content?: string; tool_calls?: unknown[] } }>;
    tool_result?: unknown;
  }): StreamingChunk {
    if (data.choices?.[0]?.delta?.content) {
      return { type: 'text', content: data.choices[0].delta.content };
    }
    if (data.choices?.[0]?.delta?.tool_calls) {
      return {
        type: 'tool_call',
        toolCall: data.choices[0].delta.tool_calls[0] as Partial<ToolCall>
      };
    }
    if (data.tool_result) {
      return { type: 'tool_result', toolCall: data.tool_result as Partial<ToolCall> };
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
    const response = await apiService.post<{
      content: string;
      metadata?: Record<string, unknown>;
    }>('/v1/ai/chat', {
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      context,
      personality_id: personalityId,
      stream: false,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'AI chat failed');
    }

    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response.data.content,
      timestamp: new Date().toISOString(),
      metadata: response.data.metadata,
    };
  }

  /**
   * Generate content using AI
   */
  async generate(request: GenerationRequest): Promise<GenerationResponse> {
    const response = await apiService.post<GenerationResponse>('/v1/ai/generate', {
      type: request.type,
      prompt: request.prompt,
      context: request.context,
      personality_id: request.personalityId,
      template: request.template,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Content generation failed');
    }

    return response.data;
  }

  /**
   * Get available AI personalities
   */
  async getPersonalities(): Promise<AIPersonality[]> {
    const response = await apiService.get<AIPersonality[]>('/v1/ai/personalities');

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch personalities');
    }

    return response.data;
  }

  /**
   * Get a specific personality
   */
  async getPersonality(id: string): Promise<AIPersonality> {
    const response = await apiService.get<AIPersonality>(`/v1/ai/personalities/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch personality');
    }

    return response.data;
  }

  /**
   * Generate response with specific personality
   */
  async generateWithPersonality(
    personalityId: string,
    prompt: string,
    context?: ChatContext
  ): Promise<string> {
    const response = await apiService.post<{ content: string }>(
      `/v1/ai/personalities/${personalityId}/generate-response`,
      { prompt, context }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Personality response failed');
    }

    return response.data.content;
  }

  /**
   * Semantic search for context retrieval
   */
  async semanticSearch(query: string, types?: string[]): Promise<Citation[]> {
    const params: Record<string, string> = { q: query };
    if (types) {
      params.types = types.join(',');
    }

    const response = await apiService.get<{
      results: Array<{
        source: string;
        url?: string;
        excerpt: string;
        score: number;
      }>
    }>('/v1/search/semantic', {
      params,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Semantic search failed');
    }

    return response.data.results.map((r) => ({
      source: r.source,
      url: r.url,
      excerpt: r.excerpt,
      relevance: r.score,
    }));
  }
}

// Singleton export
export const aiService = new AIService();

