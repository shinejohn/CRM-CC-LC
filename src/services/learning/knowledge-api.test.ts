import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as knowledgeApi from './knowledge-api';

// Mock the API client
vi.mock('./api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from './api-client';

describe('knowledge-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should fetch knowledge items', async () => {
      const mockData = {
        data: [
          { id: '1', title: 'Test 1', content: 'Content 1' },
          { id: '2', title: 'Test 2', content: 'Content 2' },
        ],
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockData);

      const result = await knowledgeApi.list();

      expect(apiClient.get).toHaveBeenCalledWith('/knowledge');
      expect(result).toEqual(mockData.data);
    });

    it('should handle errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('API Error'));

      await expect(knowledgeApi.list()).rejects.toThrow('API Error');
    });
  });

  describe('get', () => {
    it('should fetch a single knowledge item', async () => {
      const mockData = {
        data: { id: '1', title: 'Test', content: 'Content' },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockData);

      const result = await knowledgeApi.get('1');

      expect(apiClient.get).toHaveBeenCalledWith('/knowledge/1');
      expect(result).toEqual(mockData.data);
    });
  });

  describe('create', () => {
    it('should create a knowledge item', async () => {
      const newItem = {
        title: 'New Item',
        content: 'New Content',
        category_id: 'cat-1',
      };

      const mockResponse = {
        data: { id: '1', ...newItem },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await knowledgeApi.create(newItem);

      expect(apiClient.post).toHaveBeenCalledWith('/knowledge', newItem);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('update', () => {
    it('should update a knowledge item', async () => {
      const updates = {
        title: 'Updated Title',
        content: 'Updated Content',
      };

      const mockResponse = {
        data: { id: '1', ...updates },
      };

      vi.mocked(apiClient.put).mockResolvedValue(mockResponse);

      const result = await knowledgeApi.update('1', updates);

      expect(apiClient.put).toHaveBeenCalledWith('/knowledge/1', updates);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('delete', () => {
    it('should delete a knowledge item', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await knowledgeApi.delete('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/knowledge/1');
    });
  });

  describe('vote', () => {
    it('should vote on a knowledge item', async () => {
      const mockResponse = {
        data: { id: '1', helpful_count: 1 },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const result = await knowledgeApi.vote('1', true);

      expect(apiClient.post).toHaveBeenCalledWith('/knowledge/1/vote', { helpful: true });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('listCategories', () => {
    it('should fetch FAQ categories', async () => {
      const mockData = {
        data: [
          { id: '1', name: 'Category 1' },
          { id: '2', name: 'Category 2' },
        ],
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockData);

      const result = await knowledgeApi.listCategories();

      expect(apiClient.get).toHaveBeenCalledWith('/faq-categories');
      expect(result).toEqual(mockData.data);
    });
  });
});
