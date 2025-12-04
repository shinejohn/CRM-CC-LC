import React, { useState } from 'react';
import { Search, Sparkles, TrendingUp } from 'lucide-react';
import { knowledgeApi } from '@/services/learning/knowledge-api';
import { SourceBadge } from '../Common/SourceBadge';
import { ValidationIndicator } from '../Common/ValidationIndicator';
import type { SearchResult, SearchQuery } from '@/types/learning';

export const SearchPlayground: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'semantic' | 'keyword' | 'hybrid'>('semantic');
  const [threshold, setThreshold] = useState(0.7);
  const [limit, setLimit] = useState(10);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchTime, setSearchTime] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setSearching(true);
    const startTime = Date.now();

    try {
      const searchQuery: SearchQuery = {
        query,
        search_type: searchType,
        threshold,
        limit,
      };

      const searchResults = await knowledgeApi.search(searchQuery);
      setResults(searchResults);
      setSearchTime(Date.now() - startTime);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Search Playground</h2>
        <p className="text-sm text-gray-600">
          Test semantic search across your knowledge base
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Query
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="How do I set up online ordering for my restaurant?"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Search size={18} />
              Search
            </button>
          </div>
        </div>

        {/* Search Settings */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Type
            </label>
            <div className="flex items-center gap-4">
              {(['semantic', 'keyword', 'hybrid'] as const).map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="searchType"
                    value={type}
                    checked={searchType === type}
                    onChange={(e) => setSearchType(e.target.value as any)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Similarity Threshold: {threshold}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Results
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Results ({results.length} found{searchTime && ` in ${searchTime}ms`})
            </h3>
          </div>

          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={result.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <h4 className="text-base font-semibold text-gray-900">{result.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-indigo-600">
                      {Math.round(result.similarity_score * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{result.content}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    {result.category}
                  </span>
                  <SourceBadge source={result.source} size="sm" />
                  <ValidationIndicator status={result.validation_status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searching && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-sm text-gray-600">Searching...</p>
        </div>
      )}
    </div>
  );
};


