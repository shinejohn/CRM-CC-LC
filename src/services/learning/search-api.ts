// ============================================
// SEARCH API SERVICE
// ============================================
// Wires to /v1/search/* (semantic, full-text, hybrid)

import { apiClient } from './api-client';
import type { SearchResult } from '@/types/learning';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000000';

function getTenantId(): string {
  return localStorage.getItem('tenant_id') || DEFAULT_TENANT_ID;
}

export interface SearchApiResponse {
  data: Array<{
    id: string;
    title?: string;
    content?: string;
    category?: string;
    source?: string;
    validation_status?: string;
    similarity_score?: number;
    rank?: number;
  }>;
  query: string;
  count: number;
  type?: 'fulltext' | 'hybrid';
}

function mapToSearchResult(item: SearchApiResponse['data'][0], index: number): SearchResult {
  return {
    id: item.id,
    title: item.title ?? 'Untitled',
    content: item.content ?? '',
    category: item.category ?? '',
    similarity_score: item.similarity_score ?? item.rank ?? 0,
    source: (item.source as SearchResult['source']) ?? 'owner',
    validation_status: (item.validation_status as SearchResult['validation_status']) ?? 'unverified',
  };
}

export const searchApi = {
  /**
   * Semantic/vector search
   */
  semantic: async (
    query: string,
    options?: { limit?: number; threshold?: number }
  ): Promise<SearchResult[]> => {
    const response = await apiClient.post<SearchApiResponse>('/v1/search', {
      query,
      tenant_id: getTenantId(),
      limit: options?.limit ?? 10,
      threshold: options?.threshold ?? 0.7,
    });
    return (response.data ?? []).map((item, i) => mapToSearchResult(item, i));
  },

  /**
   * Full-text search
   */
  fullText: async (
    query: string,
    options?: { limit?: number }
  ): Promise<SearchResult[]> => {
    const response = await apiClient.post<SearchApiResponse>('/v1/search/fulltext', {
      query,
      tenant_id: getTenantId(),
      limit: options?.limit ?? 10,
    });
    return (response.data ?? []).map((item, i) =>
      mapToSearchResult(
        { ...item, similarity_score: item.rank ?? item.similarity_score ?? 0 },
        i
      )
    );
  },

  /**
   * Hybrid search (semantic + full-text)
   */
  hybrid: async (
    query: string,
    options?: { limit?: number; threshold?: number; semantic_weight?: number }
  ): Promise<SearchResult[]> => {
    const response = await apiClient.post<SearchApiResponse>('/v1/search/hybrid', {
      query,
      tenant_id: getTenantId(),
      limit: options?.limit ?? 10,
      threshold: options?.threshold ?? 0.7,
      semantic_weight: options?.semantic_weight ?? 0.7,
    });
    return (response.data ?? []).map((item, i) => mapToSearchResult(item, i));
  },

  /**
   * Get embedding status
   */
  getEmbeddingStatus: async (): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    percentage_complete: number;
  }> => {
    const response = await apiClient.get<{ data: Record<string, number> }>('/v1/search/status');
    return response.data as any;
  },
};
