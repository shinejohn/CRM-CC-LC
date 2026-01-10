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

      expect(apiClient.get).toHaveBeenCalledWith('/learning/knowledge/1');
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

      const mockResponse = { id: '1', ...newItem };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await knowledgeApi.createKnowledge(newItem);

      expect(apiClient.post).toHaveBeenCalledWith('/learning/knowledge', newItem);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateKnowledge', () => {
    it('should update a knowledge item', async () => {
      const updates = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      const mockResponse = { id: '1', ...updates };

      vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

      const result = await knowledgeApi.updateKnowledge('1', updates);

      expect(apiClient.put).toHaveBeenCalledWith('/learning/knowledge/1', updates);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteKnowledge', () => {
    it('should delete a knowledge item', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await knowledgeApi.deleteKnowledge('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/learning/knowledge/1');
    });
  });

  describe('getCategories', () => {
    it('should fetch FAQ categories', async () => {
      const mockData = [
        { id: '1', name: 'Category 1' },
        { id: '2', name: 'Category 2' },
      ];

      vi.mocked(apiClient.get).mockResolvedValue(mockData);

      const result = await knowledgeApi.getCategories();

      expect(apiClient.get).toHaveBeenCalledWith('/learning/categories');
      expect(result).toEqual(mockData);
    });
  });

  describe('getFAQs', () => {
    it('should fetch FAQs with filters', async () => {
      const mockData = {
        data: [
          { id: '1', question: 'Test 1', answer: 'Answer 1' },
          { id: '2', question: 'Test 2', answer: 'Answer 2' },
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 25,
          total: 2,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockData);

      const result = await knowledgeApi.getFAQs({ category: 'cat-1' }, 1, 25);

      expect(apiClient.get).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('markHelpful', () => {
    it('should mark FAQ as helpful', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(undefined);

      await knowledgeApi.markHelpful('1');

      expect(apiClient.post).toHaveBeenCalledWith('/learning/faqs/1/helpful');
    });
  });
});
