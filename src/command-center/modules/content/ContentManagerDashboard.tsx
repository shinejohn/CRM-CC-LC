// Command Center Content Manager Dashboard
// CC-FT-04: Content Module - Wired to GET /v1/generated-content

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, Filter, Grid, List, FileText,
  Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ContentCard } from './ContentCard';
import { ContentFilters } from './ContentFilters';
import { CreateContentModal } from './CreateContentModal';
import { AIContentGenerator } from './AIContentGenerator';
import {
  listContent,
  generateContent,
  updateContentStatus,
  type GeneratedContent,
} from '@/services/command-center/content-api';

type ViewMode = 'grid' | 'list';
type ContentStatus = 'all' | 'draft' | 'review' | 'approved' | 'published' | 'archived';

export function ContentManagerDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState<ContentStatus>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [content, setContent] = useState<GeneratedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: null as string | null,
    category: null as string | null,
  });

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await listContent({
        status: statusFilter === 'all' ? undefined : statusFilter,
        type: filters.type ?? undefined,
      });
      setContent(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, filters.type]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const filteredContent = content.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.content?.toLowerCase().includes(query) ||
      item.excerpt?.toLowerCase().includes(query)
    );
  });

  // Content stats from API data
  const stats = {
    total: content.length,
    draft: content.filter(c => c.status === 'draft').length,
    review: content.filter(c => c.status === 'review').length,
    published: content.filter(c => c.status === 'published').length,
    approved: content.filter(c => c.status === 'approved').length,
    archived: content.filter(c => c.status === 'archived').length,
  };

  const handleCreate = async (newContent: {
    title: string;
    type: string;
    description?: string;
    status?: string;
  }) => {
    const apiType = (['article', 'blog', 'social', 'email', 'landing_page'].includes(newContent.type)
      ? newContent.type
      : newContent.type === 'video' || newContent.type === 'image' ? 'article' : 'article') as GeneratedContent['type'];
    await generateContent({
      type: apiType,
      parameters: {
        title: newContent.title,
        topic: newContent.description,
      },
    });
    fetchContent();
  };

  const handleArchive = async (id: string) => {
    if (confirm('Are you sure you want to archive this content?')) {
      try {
        await updateContentStatus(id, 'archived');
        fetchContent();
      } catch (err) {
        console.error('Failed to archive content:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Content Manager
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Create, organize, and publish your content
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowAIGenerator(true)}
            className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Generate
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard label="Total" value={stats.total} color="blue" />
        <StatsCard label="Drafts" value={stats.draft} color="gray" />
        <StatsCard label="In Review" value={stats.review} color="yellow" />
        <StatsCard label="Published" value={stats.published} color="green" />
      </div>

      {/* Search and Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <ContentFilters filters={filters} onChange={setFilters} />
        <div className="flex items-center border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContentStatus)}>
        <TabsList>
          <TabsTrigger value="all">
            All <Badge variant="secondary" className="ml-2">{stats.total}</Badge>
          </TabsTrigger>
          <TabsTrigger value="draft">
            Drafts <Badge variant="secondary" className="ml-2">{stats.draft}</Badge>
          </TabsTrigger>
          <TabsTrigger value="review">
            Review <Badge variant="secondary" className="ml-2">{stats.review}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved <Badge variant="secondary" className="ml-2">{stats.approved}</Badge>
          </TabsTrigger>
          <TabsTrigger value="published">
            Published <Badge variant="secondary" className="ml-2">{stats.published}</Badge>
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived <Badge variant="secondary" className="ml-2">{stats.archived}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {isLoading ? (
            <ContentGridSkeleton viewMode={viewMode} />
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              Error: {error}
            </div>
          ) : filteredContent.length === 0 ? (
            <EmptyState onCreateNew={() => setShowCreateModal(true)} />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ContentCard 
                    content={mapToContentCard(item)} 
                    onDelete={() => handleArchive(item.id)}
                    onStatusChange={async (status) => {
                      try {
                        await updateContentStatus(item.id, status);
                        fetchContent();
                      } catch (err) {
                        console.error('Failed to update status:', err);
                      }
                    }}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <ContentListView content={filteredContent.map(mapToContentCard)} />
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateContentModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={async (content) => {
          try {
            await handleCreate(content);
            setShowCreateModal(false);
          } catch {
            // Error already logged
          }
        }}
      />

      <AIContentGenerator
        open={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onGenerated={async (content) => {
          if ('id' in content) {
            fetchContent();
          } else {
            try {
              await handleCreate({
                title: content.title,
                type: content.type,
                description: content.content,
                status: 'draft',
              });
            } catch {
              // Error already logged
            }
          }
          setShowAIGenerator(false);
        }}
      />
    </div>
  );
}

function mapToContentCard(item: GeneratedContent): {
  id: string;
  title: string;
  type: 'article' | 'email' | 'social' | 'video' | 'image';
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  description?: string;
  excerpt?: string;
  updatedAt: string;
} {
  const typeMap = {
    article: 'article' as const,
    blog: 'article' as const,
    social: 'social' as const,
    email: 'email' as const,
    landing_page: 'article' as const,
  };
  return {
    id: item.id,
    title: item.title,
    type: (typeMap[item.type] ?? 'article') as 'article' | 'email' | 'social' | 'video' | 'image',
    status: item.status,
    description: item.content?.slice(0, 200),
    excerpt: item.excerpt ?? undefined,
    updatedAt: item.updated_at,
  };
}

// Sub-components
function StatsCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    gray: 'bg-gray-100 dark:bg-gray-900/30',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
  };

  return (
    <div className={`p-4 rounded-lg ${colors[color as keyof typeof colors]}`}>
      <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function ContentGridSkeleton({ viewMode }: { viewMode: ViewMode }) {
  return (
    <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-2'}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-48 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

function ContentListView({ content }: { content: Array<{ id: string; title: string; type: string; status: string }> }) {
  return (
    <div className="space-y-2">
      {content.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border"
        >
          <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded flex items-center justify-center">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.type} • {item.status}</p>
          </div>
          <Badge>{item.status}</Badge>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="text-center py-12">
      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No content yet
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Create your first piece of content
      </p>
      <Button onClick={onCreateNew}>
        <Plus className="w-4 h-4 mr-2" />
        Create Content
      </Button>
    </div>
  );
}

