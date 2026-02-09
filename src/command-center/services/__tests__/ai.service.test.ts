// ============================================
// AI SERVICE TESTS - Command Center
// CC-SVC-06: AI Assistant Service
// ============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { aiService } from '../ai.service';
import type { AIMessage } from '../ai.types';

// Mock fetch globally
global.fetch = vi.fn();

describe('AIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = vi.fn(() => JSON.stringify({
      accessToken: 'test-token',
      refreshToken: 'refresh-token',
      expiresAt: Date.now() + 3600000,
    }));
  });

  describe('chatSync', () => {
    it('sends chat messages successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          content: 'Hello! How can I help you?',
          metadata: { model: 'gpt-4', tokens: { input: 10, output: 15 } },
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const messages: AIMessage[] = [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date().toISOString(),
        },
      ];

      const result = await aiService.chatSync(messages);

      expect(result.role).toBe('assistant');
      expect(result.content).toBe('Hello! How can I help you?');
    });

    it('handles errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Server error' } }),
      });

      const messages: AIMessage[] = [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date().toISOString(),
        },
      ];

      await expect(aiService.chatSync(messages)).rejects.toThrow();
    });
  });

  describe('generate', () => {
    it('generates content successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'gen-1',
          content: 'Generated email content',
          metadata: {
            type: 'email',
            tokens: 50,
            model: 'gpt-4',
          },
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await aiService.generate({
        type: 'email',
        prompt: 'Write an email',
      });

      expect(result.content).toBe('Generated email content');
      expect(result.metadata.type).toBe('email');
    });
  });

  describe('getPersonalities', () => {
    it('fetches personalities successfully', async () => {
      const mockResponse = {
        success: true,
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
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await aiService.getPersonalities();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Assistant');
    });
  });

  describe('semanticSearch', () => {
    it('performs semantic search successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          results: [
            {
              source: 'Document 1',
              url: 'https://example.com/doc1',
              excerpt: 'Relevant excerpt',
              score: 0.95,
            },
          ],
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await aiService.semanticSearch('test query');

      expect(result).toHaveLength(1);
      expect(result[0].source).toBe('Document 1');
      expect(result[0].relevance).toBe(0.95);
    });
  });
});

