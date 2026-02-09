// Command Center Content Filters Component
// CC-FT-04: Content Module

import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ContentFiltersProps {
  filters: {
    type: string | null;
    category: string | null;
  };
  onChange: (filters: { type: string | null; category: string | null }) => void;
}

const contentTypes = [
  { value: 'article', label: 'Article' },
  { value: 'email', label: 'Email' },
  { value: 'social', label: 'Social' },
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
];

const categories = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'product', label: 'Product' },
  { value: 'support', label: 'Support' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'tutorial', label: 'Tutorial' },
];

export function ContentFilters({ filters, onChange }: ContentFiltersProps) {
  const hasActiveFilters = filters.type !== null || filters.category !== null;

  const handleTypeChange = (value: string) => {
    onChange({ ...filters, type: value === 'all' ? null : value });
  };

  const handleCategoryChange = (value: string) => {
    onChange({ ...filters, category: value === 'all' ? null : value });
  };

  const clearFilters = () => {
    onChange({ type: null, category: null });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 h-2 w-2 rounded-full bg-blue-500" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Content Type</label>
            <Select value={filters.type || 'all'} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
              Clear Filters
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

