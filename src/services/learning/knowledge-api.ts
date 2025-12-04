// ============================================
// KNOWLEDGE BASE API SERVICE
// ============================================

import { apiClient, PaginatedResponse } from './api-client';
import type { 
  KnowledgeArticle, 
  FAQItem, 
  FAQFilters,
  FAQCategory,
  SearchQuery,
  SearchResult,
} from '@/types/learning';

export const knowledgeApi = {
  // ============================================
  // KNOWLEDGE BASE
  // ============================================

  getKnowledge: async (id: string): Promise<KnowledgeArticle> => {
    return apiClient.get<KnowledgeArticle>(`/learning/knowledge/${id}`);
  },

  createKnowledge: async (data: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> => {
    return apiClient.post<KnowledgeArticle>('/learning/knowledge', data);
  },

  updateKnowledge: async (id: string, data: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> => {
    return apiClient.put<KnowledgeArticle>(`/learning/knowledge/${id}`, data);
  },

  deleteKnowledge: async (id: string): Promise<void> => {
    return apiClient.delete(`/learning/knowledge/${id}`);
  },

  // ============================================
  // FAQs
  // ============================================

  getFAQs: async (
    filters: FAQFilters = {},
    page = 1,
    perPage = 25
  ): Promise<PaginatedResponse<FAQItem>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined).map(([k, v]) => [
          k,
          Array.isArray(v) ? v.join(',') : String(v),
        ])
      ),
    });

    return apiClient.get<PaginatedResponse<FAQItem>>(
      `/learning/faqs?${params.toString()}`
    );
  },

  getFAQ: async (id: string): Promise<FAQItem> => {
    return apiClient.get<FAQItem>(`/learning/faqs/${id}`);
  },

  createFAQ: async (data: Partial<FAQItem>): Promise<FAQItem> => {
    return apiClient.post<FAQItem>('/learning/faqs', data);
  },

  updateFAQ: async (id: string, data: Partial<FAQItem>): Promise<FAQItem> => {
    return apiClient.put<FAQItem>(`/learning/faqs/${id}`, data);
  },

  deleteFAQ: async (id: string): Promise<void> => {
    return apiClient.delete(`/learning/faqs/${id}`);
  },

  bulkImportFAQs: async (file: File, options: Record<string, unknown>): Promise<{ imported: number; errors: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));
    return apiClient.upload<{ imported: number; errors: string[] }>(
      '/learning/faqs/bulk-import',
      formData
    );
  },

  markHelpful: async (id: string): Promise<void> => {
    return apiClient.post(`/learning/faqs/${id}/helpful`);
  },

  markNotHelpful: async (id: string): Promise<void> => {
    return apiClient.post(`/learning/faqs/${id}/not-helpful`);
  },

  // ============================================
  // CATEGORIES
  // ============================================

  getCategoryTree: async (): Promise<FAQCategory[]> => {
    return apiClient.get<FAQCategory[]>('/learning/categories/tree');
  },

  getCategories: async (): Promise<FAQCategory[]> => {
    return apiClient.get<FAQCategory[]>('/learning/categories');
  },

  // ============================================
  // SEARCH
  // ============================================

  search: async (query: SearchQuery): Promise<SearchResult[]> => {
    return apiClient.post<SearchResult[]>('/learning/search', query);
  },

  semanticSearch: async (
    query: string,
    options?: Partial<SearchQuery>
  ): Promise<SearchResult[]> => {
    return apiClient.post<SearchResult[]>('/learning/search/semantic', {
      query,
      ...options,
    });
  },

  // ============================================
  // EMBEDDINGS
  // ============================================

  getEmbeddingStatus: async (): Promise<{
    completed: number;
    processing: number;
    pending: number;
    failed: number;
    total: number;
  }> => {
    return apiClient.get('/learning/embeddings/status');
  },

  generateEmbedding: async (id: string): Promise<void> => {
    return apiClient.post(`/learning/knowledge/${id}/embed`);
  },

  // ============================================
  // ARTICLES
  // ============================================

  getArticles: async (
    filters?: {
      category?: string;
      search?: string;
      page?: number;
      perPage?: number;
    }
  ): Promise<PaginatedResponse<KnowledgeArticle>> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.perPage) params.append('per_page', filters.perPage.toString());

    return apiClient.get<PaginatedResponse<KnowledgeArticle>>(
      `/learning/knowledge?${params.toString()}`
    );
  },
};

