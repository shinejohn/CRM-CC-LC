// Command Center Content Template Library
// CC-FT-04: Wired to GET /v1/generated-content/templates (list, preview, select)

import React, { useState, useEffect } from 'react';
import { FileText, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getContentTemplates, type ContentTemplate } from '@/services/command-center/content-api';

export function ContentTemplateLibrary({
  onSelect,
}: {
  onSelect?: (template: ContentTemplate) => void;
}) {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getContentTemplates({ type: typeFilter || undefined })
      .then(setTemplates)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load templates');
        setTemplates([]);
      })
      .finally(() => setIsLoading(false));
  }, [typeFilter]);

  const filtered = templates.filter(
    (t) =>
      (!searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!typeFilter || t.type === typeFilter)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Content Templates
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Select a template for content generation
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
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
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No templates found
          </h3>
          <p className="text-sm text-gray-500">
            Create templates in settings or try different filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="p-4 rounded-lg border bg-white dark:bg-slate-800 hover:shadow-md cursor-pointer transition-shadow"
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{template.name}</span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                {template.description || 'No description'}
              </p>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700">
                {template.type}
              </span>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {selectedTemplate.description || 'No description'}
              </p>
              <div className="text-xs text-gray-500">
                Type: {selectedTemplate.type} • Slug: {selectedTemplate.slug}
              </div>
              {selectedTemplate.prompt_template && (
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded text-sm font-mono overflow-x-auto max-h-32">
                  {selectedTemplate.prompt_template.slice(0, 500)}
                  {selectedTemplate.prompt_template.length > 500 && '...'}
                </div>
              )}
              {onSelect && (
                <Button
                  onClick={() => {
                    onSelect(selectedTemplate);
                    setSelectedTemplate(null);
                  }}
                >
                  Use This Template
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
