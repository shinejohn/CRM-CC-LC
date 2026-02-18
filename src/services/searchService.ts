/**
 * Search operations (semantic, full-text, hybrid)
 */

import api from './api';
import type { ApiResponse } from '../types/common';

export interface SearchResult {
  id: string;
  title?: string;
  content?: string;
  score?: number;
  [key: string]: unknown;
}

export const searchService = {
  semantic: (query: string, params?: Record<string, unknown>) =>
    api.post<ApiResponse<SearchResult[]>>('/search', { query, ...params }).then((r) => r.data.data ?? r.data),

  fullText: (query: string, params?: Record<string, unknown>) =>
    api.post<ApiResponse<SearchResult[]>>('/search/fulltext', { query, ...params }).then((r) => r.data.data ?? r.data),

  hybrid: (query: string, params?: Record<string, unknown>) =>
    api.post<ApiResponse<SearchResult[]>>('/search/hybrid', { query, ...params }).then((r) => r.data.data ?? r.data),

  getStatus: () =>
    api.get<ApiResponse<{ status: string }>>('/search/status').then((r) => r.data.data ?? r.data),
};
