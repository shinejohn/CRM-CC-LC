import React, { useState, useCallback, useEffect } from 'react';
import { Search, X, Mic, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { knowledgeApi } from '@/services/learning/knowledge-api';
import type { SearchResult } from '@/types/learning';

export const SearchHeader: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchType, setSearchType] = useState<'semantic' | 'keyword' | 'hybrid'>('semantic');
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const searchResults = await knowledgeApi.semanticSearch(query, {
          search_type: searchType,
          limit: 5,
        });
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchType]);

  const handleResultClick = (result: SearchResult) => {
    // Navigate to the appropriate page based on result type
    if (result.category === 'faq') {
      navigate(`/learning/faqs/${result.id}`);
    } else {
      navigate(`/learning/articles/${result.id}`);
    }
    setShowResults(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      setQuery('');
    } else if (e.key === 'Enter' && query.trim()) {
      navigate(`/learning/search?q=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Search input */}
          <div className="flex-1 relative">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => query && setShowResults(true)}
                placeholder="Search knowledge base..."
                className="
                  w-full pl-10 pr-10 py-2.5
                  border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                  text-sm
                "
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setShowResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Search results dropdown */}
            {showResults && (results.length > 0 || isSearching) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Searching...
                  </div>
                ) : (
                  <>
                    <div className="p-2 border-b border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Sparkles size={12} />
                        <span>{results.length} results found</span>
                      </div>
                    </div>
                    <div className="py-2">
                      {results.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="
                            w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors
                            border-b border-gray-100 last:border-b-0
                          "
                        >
                          <div className="font-medium text-sm text-gray-900 mb-1">
                            {result.title}
                          </div>
                          <div className="text-xs text-gray-600 line-clamp-2">
                            {result.content.substring(0, 150)}...
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">{result.category}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {Math.round(result.similarity_score * 100)}% match
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {query && (
                      <div className="p-2 border-t border-gray-200">
                        <button
                          onClick={() => {
                            navigate(`/learning/search?q=${encodeURIComponent(query)}`);
                            setShowResults(false);
                          }}
                          className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2"
                        >
                          View all results →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Search type toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSearchType('semantic')}
              className={`
                px-3 py-1.5 text-xs font-medium rounded transition-colors
                ${
                  searchType === 'semantic'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Semantic
            </button>
            <button
              onClick={() => setSearchType('keyword')}
              className={`
                px-3 py-1.5 text-xs font-medium rounded transition-colors
                ${
                  searchType === 'keyword'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              Keyword
            </button>
          </div>

          {/* Voice search button */}
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voice search"
          >
            <Mic size={20} />
          </button>
        </div>

        {/* Quick filters */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500">Quick filters:</span>
          <button className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition-colors">
            FAQs
          </button>
          <button className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
            Articles
          </button>
          <button className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
            Verified only
          </button>
        </div>
      </div>

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};


