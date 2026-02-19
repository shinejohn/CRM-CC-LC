// Command Center Content Library
// CC-FT-04: Wired to GET /v1/generated-content (filterable library with search)

import React, { useState, useEffect, useCallback } from 'react';
import { Search, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ContentCard } from './ContentCard';
import {
  listContent,
  updateContentStatus,
  type GeneratedContent,
} from '@/services/command-center/content-api';

function mapToContentCard(item: GeneratedContent) {
  const typeMap: Record<string, 'article' | 'email' | 'social' | 'video' | 'image'> = {
    article: 'article',
    blog: 'article',
    social: 'social',
    email: 'email',
    landing_page: 'article',
  };
  return {
    id: item.id,
    title: item.title,
    type: (typeMap[item.type] ?? 'article') as 'article' | 'email' | 'social' | 'video' | 'image',
    status: item.status,
    excerpt: item.excerpt ?? undefined,
    updatedAt: item.updated_at,
  };
}

export function ContentLibrary() {
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await listContent({
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        per_page: 50,
      });
      setContent(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const filteredContent = content.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.content?.toLowerCase().includes(q) ||
      item.excerpt?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Content Library
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Search and filter your generated content
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 rounded-md border bg-white dark:bg-slate-800"
        >
          <option value="">All types</option>
          <option value="article">Article</option>
          <option value="blog">Blog</option>
          <option value="social">Social</option>
          <option value="email">Email</option>
          <option value="landing_page">Landing Page</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-md border bg-white dark:bg-slate-800"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="review">Review</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No content found
          </h3>
          <p className="text-sm text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.map((item) => (
            <ContentCard
              key={item.id}
              content={mapToContentCard(item)}
              onStatusChange={async (status) => {
                try {
                  await updateContentStatus(item.id, status);
                  fetchContent();
                } catch (err) {
                  console.error('Failed to update status:', err);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
