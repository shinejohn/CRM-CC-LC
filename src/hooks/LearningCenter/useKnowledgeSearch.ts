import { useState, useCallback } from 'react';
import { knowledgeApi } from '@/services/learning/knowledge-api';
import type { SearchResult, SearchQuery } from '@/types/learning';

export const useKnowledgeSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: SearchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const searchResults = await knowledgeApi.search(query);
      setResults(searchResults);
      return searchResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const semanticSearch = useCallback(async (query: string, options?: Partial<SearchQuery>) => {
    setLoading(true);
    setError(null);
    try {
      const searchResults = await knowledgeApi.semanticSearch(query, options);
      setResults(searchResults);
      return searchResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    semanticSearch,
    clearResults,
  };
};


