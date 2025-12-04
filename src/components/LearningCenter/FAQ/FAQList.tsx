import React, { useState, useEffect } from 'react';
import { Plus, Upload, Filter, Grid, List as ListIcon } from 'lucide-react';
import { FAQCard } from './FAQCard';
import { knowledgeApi } from '@/services/learning/knowledge-api';
import type { FAQItem, FAQFilters } from '@/types/learning';

interface FAQListProps {
  onAddFAQ?: () => void;
  onEditFAQ?: (id: string) => void;
  onViewFAQ?: (id: string) => void;
}

export const FAQList: React.FC<FAQListProps> = ({
  onAddFAQ,
  onEditFAQ,
  onViewFAQ,
}) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FAQFilters>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 25;

  useEffect(() => {
    loadFAQs();
  }, [filters, page]);

  const loadFAQs = async () => {
    setLoading(true);
    try {
      const response = await knowledgeApi.getFAQs(filters, page, perPage);
      setFaqs(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === faqs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(faqs.map((f) => f.id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">FAQs</h2>
          <p className="text-sm text-gray-600 mt-1">
            {total} questions across 56 industry subcategories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {/* Bulk import handled by parent component */}}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Upload size={16} />
            Import
          </button>
          <button
            onClick={() => onAddFAQ?.()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            Add FAQ
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select
            value={filters.categories?.[0] || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                categories: e.target.value ? [e.target.value] : undefined,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
              <option value="">All Categories</option>
          </select>
          <select
            value={filters.sources?.[0] || ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                sources: e.target.value ? [e.target.value as any] : undefined,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Sources</option>
            <option value="google">Google</option>
            <option value="serpapi">SerpAPI</option>
            <option value="website">Website</option>
            <option value="owner">Owner</option>
          </select>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            More Filters
          </button>
        </div>
      </div>

      {/* View mode toggle and bulk actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${
              viewMode === 'grid'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${
              viewMode === 'list'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <ListIcon size={18} />
          </button>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedIds.size} selected
            </span>
            <button className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-300">
              Bulk Actions
            </button>
          </div>
        )}
      </div>

      {/* FAQ List/Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading FAQs...</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-600">No FAQs found</p>
          <button
            onClick={() => onAddFAQ?.()}
            className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Create your first FAQ
          </button>
        </div>
      ) : (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {faqs.map((faq) => (
              <FAQCard
                key={faq.id}
                faq={faq}
                isSelected={selectedIds.has(faq.id)}
                onSelect={handleSelect}
                onEdit={onEditFAQ}
                onView={onViewFAQ}
              />
            ))}
          </div>

          {/* Pagination */}
          {total > perPage && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, total)} of{' '}
                {total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * perPage >= total}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

