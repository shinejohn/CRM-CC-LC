import { describe, it, expect, beforeEach, vi } from 'vitest';
import { aiService } from '../ai.service';
import type { AIMessage } from '../ai.types';

// Mock apiClient so tests don't hit the network
vi.mock('@/services/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock useAuthStore so aiService.getToken() works
vi.mock('@/stores/authStore', () => ({
  useAuthStore: {
    getState: () => ({ token: 'test-token' }),
  },
}));

import { apiClient } from '@/services/api';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockClient = apiClient as any;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('AIService', () => {
  describe('chatSync', () => {
    it('sends chat messages successfully', async () => {
      // apiClient returns axios response; .data is the response body
      mockClient.post.mockResolvedValueOnce({
        data: { content: 'Hello! How can I help you?', metadata: { model: 'gpt-4' } },
      });

      const messages: AIMessage[] = [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date().toISOString() },
      ];

      const result = await aiService.chatSync(messages);

      expect(result.role).toBe('assistant');
      expect(result.content).toBe('Hello! How can I help you?');
    });

    it('handles errors gracefully', async () => {
      mockClient.post.mockRejectedValueOnce({ message: 'Server error', status: 500 });

      const messages: AIMessage[] = [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date().toISOString() },
      ];

      await expect(aiService.chatSync(messages)).rejects.toThrow();
    });
  });

  describe('generate', () => {
    it('generates content successfully', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: {
          id: 'gen-1',
          content: 'Generated email content',
          metadata: { type: 'email', tokens: 50, model: 'gpt-4' },
        },
      });

      const result = await aiService.generate({ type: 'email', prompt: 'Write an email' });

      expect(result.content).toBe('Generated email content');
      expect(result.metadata.type).toBe('email');
    });
  });

  describe('getPersonalities', () => {
    it('fetches personalities successfully', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          {
            id: '1',
            name: 'Assistant',
            description: 'Helpful assistant',
            systemPrompt: 'You are helpful',
            traits: ['friendly'],
            capabilities: ['chat'],
          },
        ],
      });

      const result = await aiService.getPersonalities();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Assistant');
    });
  });

  describe('semanticSearch', () => {
    it('performs semantic search successfully', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          results: [
            { source: 'Document 1', url: 'https://example.com/doc1', excerpt: 'Relevant excerpt', score: 0.95 },
          ],
        },
      });

      const result = await aiService.semanticSearch('test query');

      expect(result).toHaveLength(1);
      expect(result[0].source).toBe('Document 1');
      expect(result[0].relevance).toBe(0.95);
    });
  });
});
