import { describe, it, expect, vi, beforeEach } from 'vitest';
import { knowledgeApi } from './knowledge-api';

// Mock the API client
vi.mock('./api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn(),
  },
}));

// Mock the search-api (used by getCategories -> getCategoryTree)
vi.mock('./search-api', () => ({
  searchApi: {
    fullText: vi.fn(),
    hybrid: vi.fn(),
    semantic: vi.fn(),
    getEmbeddingStatus: vi.fn(),
  },
}));

import { apiClient } from './api-client';

describe('knowledge-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getKnowledge', () => {
    it('should fetch a single knowledge item', async () => {
      const mockData = { id: '1', title: 'Test', content: 'Content' };

      vi.mocked(apiClient.get).mockResolvedValue(mockData);

      const result = await knowledgeApi.getKnowledge('1');

      expect(apiClient.get).toHaveBeenCalledWith('/v1/knowledge/1');
      expect(result).toEqual(mockData);
    });

    it('should handle errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('API Error'));

      await expect(knowledgeApi.getKnowledge('1')).rejects.toThrow();
    });
  });

  describe('createKnowledge', () => {
    it('should create a knowledge item', async () => {
      const newItem = {
        title: 'New Item',
        content: 'New Content',
        category_id: 'cat-1',
      };

      // createKnowledge maps fields and posts to /v1/knowledge, then returns res.data
      const mockResponse = { data: { id: '1', title: 'New Item', content: 'New Content' } };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await knowledgeApi.createKnowledge(newItem);

      expect(apiClient.post).toHaveBeenCalledWith('/v1/knowledge', {
        title: 'New Item',
        content: 'New Content',
        category: undefined,
        subcategory: undefined,
        industry_codes: undefined,
        source: undefined,
        source_url: undefined,
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateKnowledge', () => {
    it('should update a knowledge item', async () => {
      const updates = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      // updateKnowledge returns res.data
      const mockResponse = { data: { id: '1', ...updates } };

      vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

      const result = await knowledgeApi.updateKnowledge('1', updates);

      expect(apiClient.put).toHaveBeenCalledWith('/v1/knowledge/1', updates);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteKnowledge', () => {
    it('should delete a knowledge item', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await knowledgeApi.deleteKnowledge('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/v1/knowledge/1');
    });
  });

  describe('getCategories', () => {
    it('should fetch FAQ categories', async () => {
      // getCategories delegates to getCategoryTree which calls /v1/faq-categories
      // and expects { data: [...] } shape
      const mockApiResponse = {
        data: [
          { id: '1', name: 'Category 1', slug: 'cat-1' },
          { id: '2', name: 'Category 2', slug: 'cat-2' },
        ],
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await knowledgeApi.getCategories();

      expect(apiClient.get).toHaveBeenCalledWith('/v1/faq-categories');
      expect(result).toEqual([
        { id: '1', name: 'Category 1', slug: 'cat-1', description: undefined, parent_id: undefined, icon: undefined, color: undefined, faq_count: 0, children: [], order: 0 },
        { id: '2', name: 'Category 2', slug: 'cat-2', description: undefined, parent_id: undefined, icon: undefined, color: undefined, faq_count: 0, children: [], order: 0 },
      ]);
    });
  });

  describe('getFAQs', () => {
    it('should fetch FAQs with filters', async () => {
      // getFAQs calls /v1/knowledge?... and maps data through mapKnowledgeToFAQItem
      const mockApiResponse = {
        data: [
          { id: '1', title: 'Test 1', content: 'Answer 1' },
          { id: '2', title: 'Test 2', content: 'Answer 2' },
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 2,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockApiResponse);

      const result = await knowledgeApi.getFAQs({ categories: ['cat-1'] } as any, 1, 25);

      expect(apiClient.get).toHaveBeenCalled();
      // Result data is transformed through mapKnowledgeToFAQItem
      expect(result.data).toHaveLength(2);
      expect(result.data[0].question).toBe('Test 1');
      expect(result.data[0].answer).toBe('Answer 1');
      expect(result.data[1].question).toBe('Test 2');
      expect(result.data[1].answer).toBe('Answer 2');
      expect(result.meta).toEqual(mockApiResponse.meta);
    });
  });

  describe('markHelpful', () => {
    it('should mark FAQ as helpful', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(undefined);

      await knowledgeApi.markHelpful('1');

      expect(apiClient.post).toHaveBeenCalledWith('/v1/knowledge/1/vote', { vote: 'helpful' });
    });
  });
});
