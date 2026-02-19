// ============================================
// KNOWLEDGE BASE API SERVICE
// ============================================
// Wires to /v1/knowledge and /v1/faq-categories

import { apiClient, PaginatedResponse } from './api-client';
import { searchApi } from './search-api';
import type {
  KnowledgeArticle,
  FAQItem,
  FAQFilters,
  FAQCategory,
  SearchQuery,
  SearchResult,
} from '@/types/learning';

/** Map backend Knowledge to FAQItem (title->question, content->answer) */
function mapKnowledgeToFAQItem(k: Record<string, unknown>): FAQItem {
  return {
    id: String(k.id),
    tenant_id: String(k.tenant_id ?? ''),
    question: String(k.title ?? ''),
    answer: String(k.content ?? ''),
    category: String(k.category ?? ''),
    subcategory: k.subcategory as string | undefined,
    industry_codes: k.industry_codes as string[] | undefined,
    embedding_status: (k.embedding_status as FAQItem['embedding_status']) ?? 'pending',
    has_embedding: (k.embedding_status as string) === 'completed',
    is_public: Boolean(k.is_public ?? true),
    allowed_agents: (k.allowed_agents as string[]) ?? [],
    source: (k.source as FAQItem['source']) ?? 'owner',
    source_url: k.source_url as string | undefined,
    validation_status: (k.validation_status as FAQItem['validation_status']) ?? 'unverified',
    usage_count: Number(k.usage_count ?? 0),
    helpful_count: Number(k.helpful_count ?? 0),
    not_helpful_count: Number(k.not_helpful_count ?? 0),
    helpfulness_score: 0,
    tags: (k.tags as string[]) ?? [],
    metadata: (k.metadata as Record<string, unknown>) ?? {},
    created_at: String(k.created_at ?? ''),
    updated_at: String(k.updated_at ?? ''),
    created_by: String(k.created_by ?? ''),
    related_faqs: [],
    applies_to_industries: [],
  };
}

export const knowledgeApi = {
  // ============================================
  // KNOWLEDGE BASE
  // ============================================

  getKnowledge: async (id: string): Promise<KnowledgeArticle> => {
    const res = await apiClient.get<{ data?: Record<string, unknown> } | Record<string, unknown>>(`/v1/knowledge/${id}`);
    const data = 'data' in res && res.data ? res.data : res;
    return data as unknown as KnowledgeArticle;
  },

  createKnowledge: async (data: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> => {
    const payload = {
      title: (data as FAQItem).question ?? (data as KnowledgeArticle).title,
      content: (data as FAQItem).answer ?? (data as KnowledgeArticle).content,
      category: data.category,
      subcategory: data.subcategory,
      industry_codes: data.industry_codes,
      source: data.source,
      source_url: data.source_url,
    };
    const res = await apiClient.post<{ data: Record<string, unknown> }>('/v1/knowledge', payload);
    return res.data as unknown as KnowledgeArticle;
  },

  updateKnowledge: async (id: string, data: Partial<KnowledgeArticle>): Promise<KnowledgeArticle> => {
    const payload = {
      ...(data as Record<string, unknown>),
      ...((data as FAQItem).question && { title: (data as FAQItem).question }),
      ...((data as FAQItem).answer && { content: (data as FAQItem).answer }),
    };
    delete (payload as Record<string, unknown>).question;
    delete (payload as Record<string, unknown>).answer;
    const res = await apiClient.put<{ data: Record<string, unknown> }>(`/v1/knowledge/${id}`, payload);
    return res.data as unknown as KnowledgeArticle;
  },

  deleteKnowledge: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/knowledge/${id}`);
  },

  // ============================================
  // FAQs (Knowledge items as Q&A: title=question, content=answer)
  // ============================================

  getFAQs: async (
    filters: FAQFilters = {},
    page = 1,
    perPage = 25
  ): Promise<PaginatedResponse<FAQItem>> => {
    const params: Record<string, string> = {
      page: page.toString(),
      per_page: perPage.toString(),
    };
    if (filters.search) params.search = filters.search;
    if (filters.categories?.[0]) params.category = filters.categories[0];
    if (filters.sources?.[0]) params.source = filters.sources[0];

    const res = await apiClient.get<{
      data?: Record<string, unknown>[];
      meta?: { current_page: number; last_page: number; per_page: number; total: number };
      current_page?: number;
      last_page?: number;
      per_page?: number;
      total?: number;
    }>(`/v1/knowledge?${new URLSearchParams(params).toString()}`);

    const items = res.data ?? [];
    const meta = res.meta ?? {
      current_page: res.current_page ?? page,
      last_page: res.last_page ?? 1,
      per_page: res.per_page ?? perPage,
      total: res.total ?? items.length,
    };
    return {
      data: items.map(mapKnowledgeToFAQItem),
      meta,
    };
  },

  getFAQ: async (id: string): Promise<FAQItem> => {
    const res = await apiClient.get<{ data?: Record<string, unknown> } | Record<string, unknown>>(`/v1/knowledge/${id}`);
    const data = 'data' in res && res.data ? res.data : res;
    return mapKnowledgeToFAQItem((data as Record<string, unknown>) ?? {});
  },

  createFAQ: async (data: Partial<FAQItem>): Promise<FAQItem> => {
    const res = await apiClient.post<{ data: Record<string, unknown> }>('/v1/knowledge', {
      title: data.question,
      content: data.answer,
      category: data.category,
      subcategory: data.subcategory,
      source: data.source ?? 'owner',
    });
    return mapKnowledgeToFAQItem(res.data ?? {});
  },

  updateFAQ: async (id: string, data: Partial<FAQItem>): Promise<FAQItem> => {
    const payload: Record<string, unknown> = {};
    if (data.question != null) payload.title = data.question;
    if (data.answer != null) payload.content = data.answer;
    if (data.category != null) payload.category = data.category;
    const res = await apiClient.put<{ data: Record<string, unknown> }>(`/v1/knowledge/${id}`, payload);
    return mapKnowledgeToFAQItem(res.data ?? {});
  },

  deleteFAQ: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/knowledge/${id}`);
  },

  bulkImportFAQs: async (): Promise<{ imported: number; errors: string[] }> => {
    // Backend may not have bulk import; return stub
    return { imported: 0, errors: ['Bulk import not implemented for /v1/knowledge'] };
  },

  markHelpful: async (id: string): Promise<void> => {
    await apiClient.post(`/v1/knowledge/${id}/vote`, { vote: 'helpful' });
  },

  markNotHelpful: async (id: string): Promise<void> => {
    await apiClient.post(`/v1/knowledge/${id}/vote`, { vote: 'not_helpful' });
  },

  // ============================================
  // CATEGORIES (faq-categories)
  // ============================================

  getCategoryTree: async (): Promise<FAQCategory[]> => {
    const res = await apiClient.get<{ data: Record<string, unknown>[] }>('/v1/faq-categories');
    return (res.data ?? []).map((c) => ({
      id: String(c.id),
      name: String(c.name ?? ''),
      slug: String(c.slug ?? ''),
      description: c.description as string | undefined,
      parent_id: c.parent_id as string | undefined,
      icon: c.icon as string | undefined,
      color: c.color as string | undefined,
      faq_count: Number(c.faq_count ?? 0),
      children: (c.children as FAQCategory[] | undefined) ?? [],
      order: Number(c.display_order ?? 0),
    }));
  },

  getCategories: async (): Promise<FAQCategory[]> => {
    return knowledgeApi.getCategoryTree();
  },

  // ============================================
  // SEARCH (delegate to search-api)
  // ============================================

  search: async (query: SearchQuery): Promise<SearchResult[]> => {
    const q = query.query;
    const limit = query.limit ?? 10;
    const threshold = query.threshold ?? 0.7;
    switch (query.search_type) {
      case 'fulltext':
      case 'keyword':
        return searchApi.fullText(q, { limit });
      case 'hybrid':
        return searchApi.hybrid(q, { limit, threshold });
      default:
        return searchApi.semantic(q, { limit, threshold });
    }
  },

  semanticSearch: async (query: string, options?: Partial<SearchQuery>): Promise<SearchResult[]> => {
    return searchApi.semantic(query, {
      limit: options?.limit,
      threshold: options?.threshold,
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
    const status = await searchApi.getEmbeddingStatus();
    return {
      total: status.total,
      completed: status.completed,
      processing: status.processing,
      pending: status.pending,
      failed: status.failed,
    };
  },

  generateEmbedding: async (id: string): Promise<void> => {
    await apiClient.post(`/v1/knowledge/${id}/generate-embedding`);
  },

  // ============================================
  // ARTICLES (knowledge list with filters)
  // ============================================

  getArticles: async (
    filters?: {
      category?: string;
      search?: string;
      page?: number;
      perPage?: number;
    }
  ): Promise<PaginatedResponse<KnowledgeArticle>> => {
    const params: Record<string, string> = {
      page: String(filters?.page ?? 1),
      per_page: String(filters?.perPage ?? 20),
    };
    if (filters?.category) params.category = filters.category;
    if (filters?.search) params.search = filters.search;

    const res = await apiClient.get<{
      data: Record<string, unknown>[];
      meta?: { current_page: number; last_page: number; per_page: number; total: number };
    }>(`/v1/knowledge?${new URLSearchParams(params).toString()}`);

    return {
      data: (res.data ?? []) as unknown as KnowledgeArticle[],
      meta: res.meta ?? {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: (res.data ?? []).length,
      },
    };
  },
};

