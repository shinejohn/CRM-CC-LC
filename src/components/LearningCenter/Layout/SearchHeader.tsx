import React, { useState, useCallback, useEffect } from 'react';
import { Search, X, Mic, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { knowledgeApi } from '@/services/learning/knowledge-api';
import type { SearchResult } from '@/types/learning';
import { trackNavigate } from '@/utils/navigation-tracker';

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
    const targetPath = result.category === 'faq' 
      ? `/learning/faqs/${result.id}`
      : `/learning/articles/${result.id}`;
    // #region agent log
    trackNavigate(targetPath, 'SearchHeader');
    // #endregion
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
      const targetPath = `/learning/search?q=${encodeURIComponent(query)}`;
      // #region agent log
      trackNavigate(targetPath, 'SearchHeader');
      // #endregion
      navigate(targetPath);
      setShowResults(false);
    }
  };

  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {/* Search input */}
          <div className="flex-1 relative min-w-0">
            <div className="relative">
              <label htmlFor="knowledge-search" className="sr-only">
                Search knowledge base
              </label>
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 lc-text-muted lc-transition pointer-events-none"
                style={{ color: 'var(--lc-text-muted)' }}
                aria-hidden="true"
              />
              <input
                id="knowledge-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => query && setShowResults(true)}
                placeholder="Search knowledge base..."
                className="
                  w-full pl-10 pr-10 py-2.5
                  lc-border lc-radius-lg
                  lc-border-focus
                  text-sm
                  lc-transition
                  lc-surface
                "
                style={{
                  borderColor: 'var(--lc-border)',
                  backgroundColor: 'var(--lc-surface)',
                  color: 'var(--lc-text)',
                }}
                aria-label="Search knowledge base"
                aria-expanded={showResults}
                aria-controls="search-results"
                aria-autocomplete="list"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setShowResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 lc-text-muted hover:lc-text-primary lc-transition rounded-md hover:bg-gray-100 p-1 focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Search results dropdown */}
            {showResults && (results.length > 0 || isSearching) && (
              <div 
                id="search-results"
                role="listbox"
                className="absolute top-full left-0 right-0 mt-2 lc-surface lc-border lc-radius-lg lc-shadow-lg z-50 max-h-96 overflow-y-auto lc-animate-scale-in"
                style={{
                  backgroundColor: 'var(--lc-surface)',
                  borderColor: 'var(--lc-border)',
                }}
              >
                {isSearching ? (
                  <div className="p-4 text-center lc-text-secondary text-sm lc-animate-pulse" role="status" aria-live="polite">
                    Searching...
                  </div>
                ) : (
                  <>
                    <div className="p-2 border-b lc-border">
                      <div className="flex items-center gap-2 text-xs lc-text-secondary">
                        <Sparkles size={12} style={{ color: 'var(--lc-primary)' }} aria-hidden="true" />
                        <span>{results.length} result{results.length !== 1 ? 's' : ''} found</span>
                      </div>
                    </div>
                    <div className="py-2">
                      {results.map((result, index) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="
                            w-full text-left px-4 py-3 lc-surface-hover lc-transition
                            border-b lc-border last:border-b-0
                            focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2
                          "
                          style={{
                            animationDelay: `${index * 50}ms`,
                          }}
                          role="option"
                          aria-label={`${result.title}, ${result.category}, ${Math.round(result.similarity_score * 100)}% match`}
                        >
                          <div className="font-medium text-sm lc-text-primary mb-1 truncate">
                            {result.title}
                          </div>
                          <div className="text-xs lc-text-secondary line-clamp-2">
                            {result.content.substring(0, 150)}...
                          </div>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="text-xs lc-text-muted">{result.category}</span>
                            <span className="text-xs lc-text-muted" aria-hidden="true">•</span>
                            <span className="text-xs lc-text-muted">
                              {Math.round(result.similarity_score * 100)}% match
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {query && (
                      <div className="p-2 border-t lc-border">
                        <button
                          onClick={() => {
                            navigate(`/learning/search?q=${encodeURIComponent(query)}`);
                            setShowResults(false);
                          }}
                          className="w-full text-sm font-medium py-2 lc-transition hover:lc-text-primary focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
                          style={{ color: 'var(--lc-primary)' }}
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
          <div 
            className="flex items-center gap-1 sm:gap-2 lc-radius-lg p-1 flex-shrink-0"
            style={{ backgroundColor: 'var(--lc-surface-hover)' }}
            role="group"
            aria-label="Search type"
          >
            <button
              onClick={() => setSearchType('semantic')}
              className={`
                px-2 sm:px-3 py-1.5 text-xs font-medium lc-radius-md lc-transition
                focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2
                ${
                  searchType === 'semantic'
                    ? 'lc-shadow-sm'
                    : 'lc-text-secondary hover:lc-text-primary'
                }
              `}
              style={{
                backgroundColor: searchType === 'semantic' ? 'var(--lc-surface)' : 'transparent',
                color: searchType === 'semantic' ? 'var(--lc-primary)' : undefined,
              }}
              aria-pressed={searchType === 'semantic'}
            >
              <span className="hidden sm:inline">Semantic</span>
              <span className="sm:hidden">S</span>
            </button>
            <button
              onClick={() => setSearchType('keyword')}
              className={`
                px-2 sm:px-3 py-1.5 text-xs font-medium lc-radius-md lc-transition
                focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2
                ${
                  searchType === 'keyword'
                    ? 'lc-shadow-sm'
                    : 'lc-text-secondary hover:lc-text-primary'
                }
              `}
              style={{
                backgroundColor: searchType === 'keyword' ? 'var(--lc-surface)' : 'transparent',
                color: searchType === 'keyword' ? 'var(--lc-primary)' : undefined,
              }}
              aria-pressed={searchType === 'keyword'}
            >
              <span className="hidden sm:inline">Keyword</span>
              <span className="sm:hidden">K</span>
            </button>
          </div>

          {/* Voice search button */}
          <button
            className="p-2 lc-text-secondary hover:lc-text-primary lc-surface-hover lc-radius-lg lc-transition focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2 flex-shrink-0"
            title="Voice search"
            aria-label="Voice search"
            style={{ backgroundColor: 'transparent' }}
          >
            <Mic size={20} />
          </button>
        </div>

        {/* Quick filters */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs lc-text-muted">Quick filters:</span>
          <button 
            className="text-xs px-2 py-1 lc-radius-md lc-transition focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
            style={{
              backgroundColor: 'var(--lc-primary-bg)',
              color: 'var(--lc-primary-dark)',
            }}
            aria-label="Filter by FAQs"
          >
            FAQs
          </button>
          <button 
            className="text-xs px-2 py-1 lc-surface-hover lc-text-secondary lc-radius-md lc-transition focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
            aria-label="Filter by Articles"
          >
            Articles
          </button>
          <button 
            className="text-xs px-2 py-1 lc-surface-hover lc-text-secondary lc-radius-md lc-transition focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
            aria-label="Show verified only"
          >
            Verified only
          </button>
        </div>
      </div>

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40 lc-transition-fast"
          onClick={() => setShowResults(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};


