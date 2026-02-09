import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ActivityType } from '@/types/command-center';

interface ActivityFiltersProps {
  filters: {
    type: ActivityType | null;
    priority: string | null;
    customerId: string | null;
  };
  onChange: (filters: any) => void;
}

export function ActivityFilters({ filters, onChange }: ActivityFiltersProps) {
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => {
    onChange({ type: null, priority: null, customerId: null });
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge
                variant="default"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Activity Type</label>
              <Select
                value={filters.type || ''}
                onValueChange={(v) => onChange({ ...filters, type: (v || null) as ActivityType | null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="phone_call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <label className="text-sm text-gray-500">Priority</label>
              <Select
                value={filters.priority || ''}
                onValueChange={(v) => onChange({ ...filters, priority: v || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2">
          {filters.type && (
            <Badge variant="secondary" className="gap-1">
              {filters.type.replace('_', ' ')}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onChange({ ...filters, type: null })}
              />
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="secondary" className="gap-1">
              {filters.priority}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onChange({ ...filters, priority: null })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

