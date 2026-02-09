# CC-FT-04: Content Module

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-FT-04 |
| Name | Content Module |
| Phase | 3 - Feature Modules |
| Dependencies | CC-SVC-02 (API Client), CC-SVC-06 (AI Service) |
| Estimated Time | 6 hours |
| Agent Assignment | Agent 14 |

---

## Purpose

Create the content management module for creating, organizing, and publishing content across multiple channels. Integrates with AI service for content generation and suggestions.

---

## UI Pattern References

**Primary Reference:** `/magic/patterns/ContentManagerDashboard.tsx`
- Content library grid
- Category organization
- Status filters

**Secondary Reference:** `/magic/patterns/ContentCreationFlow.tsx`
- Content creation wizard
- AI-assisted writing
- Preview functionality

**Tertiary Reference:** `/magic/patterns/ContentLibrary.tsx`
- Content cards
- Search and filter
- Bulk actions

---

## API Endpoints Used

```
GET    /v1/content                    # List content (paginated)
POST   /v1/content                    # Create content
GET    /v1/content/{id}               # Get content details
PUT    /v1/content/{id}               # Update content
DELETE /v1/content/{id}               # Delete content
PUT    /v1/content/{id}/status        # Update status
GET    /v1/content/templates          # Get content templates
POST   /v1/content/generate           # AI content generation
GET    /v1/content/categories         # List categories
```

---

## Deliverables

### 1. Content Manager Dashboard

```typescript
// src/command-center/modules/content/ContentManagerDashboard.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, Filter, Grid, List, FileText, 
  Image, Video, Mail, MessageSquare, Sparkles
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ContentCard } from './ContentCard';
import { ContentFilters } from './ContentFilters';
import { CreateContentModal } from './CreateContentModal';
import { AIContentGenerator } from './AIContentGenerator';
import { useContent } from '../../hooks/useContent';

type ViewMode = 'grid' | 'list';
type ContentStatus = 'all' | 'draft' | 'review' | 'approved' | 'published';

export function ContentManagerDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState<ContentStatus>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [filters, setFilters] = useState({
    type: null as string | null,
    category: null as string | null,
  });

  const { content, isLoading, error, refreshContent } = useContent({
    status: statusFilter === 'all' ? null : statusFilter,
    ...filters,
  });

  const filteredContent = content.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  });

  // Content stats
  const stats = {
    total: content.length,
    draft: content.filter(c => c.status === 'draft').length,
    review: content.filter(c => c.status === 'review').length,
    published: content.filter(c => c.status === 'published').length,
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
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
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
          <TabsTrigger value="published">
            Published <Badge variant="secondary" className="ml-2">{stats.published}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {isLoading ? (
            <ContentGridSkeleton viewMode={viewMode} />
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
                  <ContentCard content={item} />
                </motion.div>
              ))}
            </div>
          ) : (
            <ContentListView content={filteredContent} />
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateContentModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          setShowCreateModal(false);
          refreshContent();
        }}
      />

      <AIContentGenerator
        open={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onGenerated={(content) => {
          setShowAIGenerator(false);
          // Navigate to edit the generated content
        }}
      />
    </div>
  );
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

function ContentListView({ content }: { content: any[] }) {
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
```

### 2. Content Card

```typescript
// src/command-center/modules/content/ContentCard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Image, Video, Mail, MessageSquare,
  MoreVertical, Eye, Edit, Trash2, Share2, Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Content {
  id: string;
  title: string;
  type: 'article' | 'email' | 'social' | 'video' | 'image';
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  excerpt?: string;
  thumbnail?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
}

interface ContentCardProps {
  content: Content;
  onDelete?: () => void;
}

const typeIcons = {
  article: FileText,
  email: Mail,
  social: MessageSquare,
  video: Video,
  image: Image,
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
};

export function ContentCard({ content, onDelete }: ContentCardProps) {
  const navigate = useNavigate();
  const TypeIcon = typeIcons[content.type] || FileText;

  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card
        className="cursor-pointer hover:shadow-lg transition-all overflow-hidden"
        onClick={() => navigate(`/command-center/content/${content.id}`)}
      >
        {/* Thumbnail */}
        {content.thumbnail ? (
          <div className="h-32 bg-gray-100 dark:bg-slate-700">
            <img
              src={content.thumbnail}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
            <TypeIcon className="w-12 h-12 text-purple-400" />
          </div>
        )}

        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {content.type}
              </Badge>
              <Badge className={statusColors[content.status]}>
                {content.status}
              </Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title & Excerpt */}
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
            {content.title}
          </h3>
          {content.excerpt && (
            <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 mb-3">
              {content.excerpt}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(content.updatedAt).toLocaleDateString()}
            </span>
            {content.category && (
              <Badge variant="outline" className="text-xs">
                {content.category}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

### 3. AI Content Generator

```typescript
// src/command-center/modules/content/AIContentGenerator.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, FileText, Mail, MessageSquare, Image,
  Wand2, Copy, Check, RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAI } from '../../hooks/useAI';

interface AIContentGeneratorProps {
  open: boolean;
  onClose: () => void;
  onGenerated: (content: { type: string; title: string; content: string }) => void;
}

const contentTypes = [
  { id: 'article', label: 'Blog Article', icon: FileText },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'social', label: 'Social Post', icon: MessageSquare },
];

const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'casual', label: 'Casual' },
  { value: 'persuasive', label: 'Persuasive' },
];

export function AIContentGenerator({ open, onClose, onGenerated }: AIContentGeneratorProps) {
  const [selectedType, setSelectedType] = useState('article');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);

  const { generate, isLoading } = useAI();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      const content = await generate({
        type: selectedType as any,
        prompt: `Write a ${selectedType} with a ${tone} tone about: ${prompt}`,
      });
      setGeneratedContent(content);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUse = () => {
    onGenerated({
      type: selectedType,
      title: prompt.slice(0, 50),
      content: generatedContent,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Content Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Content Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content Type</label>
            <div className="flex gap-2">
              {contentTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
                      ${isSelected
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tone</label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">What would you like to write about?</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your content idea in detail..."
              rows={3}
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>

          {/* Generated Content */}
          <AnimatePresence>
            {generatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Generated Content</label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                      {copied ? (
                        <Check className="w-4 h-4 mr-1 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 mr-1" />
                      )}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleGenerate}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg max-h-64 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">{generatedContent}</p>
                </div>
                <Button onClick={handleUse} className="w-full">
                  Use This Content
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 4. useContent Hook

```typescript
// src/command-center/hooks/useContent.ts

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.service';

interface ContentFilters {
  status: string | null;
  type: string | null;
  category: string | null;
}

export function useContent(filters: ContentFilters) {
  const [content, setContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);

      const response = await apiService.get(`/v1/content?${params}`);
      setContent(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const createContent = useCallback(async (data: any) => {
    const response = await apiService.post('/v1/content', data);
    setContent(prev => [response.data, ...prev]);
    return response.data;
  }, []);

  const updateContent = useCallback(async (id: string, data: any) => {
    const response = await apiService.put(`/v1/content/${id}`, data);
    setContent(prev => prev.map(c => c.id === id ? response.data : c));
    return response.data;
  }, []);

  const deleteContent = useCallback(async (id: string) => {
    await apiService.delete(`/v1/content/${id}`);
    setContent(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateStatus = useCallback(async (id: string, status: string) => {
    const response = await apiService.put(`/v1/content/${id}/status`, { status });
    setContent(prev => prev.map(c => c.id === id ? response.data : c));
    return response.data;
  }, []);

  return {
    content,
    isLoading,
    error,
    refreshContent: fetchContent,
    createContent,
    updateContent,
    deleteContent,
    updateStatus,
  };
}
```

### 5. Module Index

```typescript
// src/command-center/modules/content/index.ts

export { ContentManagerDashboard } from './ContentManagerDashboard';
export { ContentCard } from './ContentCard';
export { ContentFilters } from './ContentFilters';
export { CreateContentModal } from './CreateContentModal';
export { AIContentGenerator } from './AIContentGenerator';
export { useContent } from '../../hooks/useContent';
```

---

## Acceptance Criteria

- [ ] Content list displays with grid/list toggle
- [ ] Filter by status, type, category
- [ ] Search by title and content
- [ ] Content cards show type, status, preview
- [ ] AI content generator works
- [ ] Create/Edit content modals functional
- [ ] Status workflow (draft → review → published)
- [ ] Real-time updates
- [ ] Mobile responsive

---

## Handoff

When complete, this module provides:

1. `ContentManagerDashboard` - Main content view
2. `ContentCard` - Content card component
3. `AIContentGenerator` - AI generation modal
4. `useContent` - Data management hook

Other agents import:
```typescript
import { ContentManagerDashboard, useContent } from '@/command-center/modules/content';
```
