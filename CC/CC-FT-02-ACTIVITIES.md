# CC-FT-02: Activities Module

## Module Overview

| Property | Value |
|----------|-------|
| Module ID | CC-FT-02 |
| Name | Activities Module |
| Phase | 3 - Feature Modules |
| Dependencies | CC-SVC-01 (WebSocket), CC-SVC-04 (Event Bus) |
| Estimated Time | 5 hours |
| Agent Assignment | Agent 12 |

---

## Purpose

Create the Activities/Interactions module that displays action items, tracks customer interactions, and implements the automatic next-step workflow. This is the core operational view for managing day-to-day customer relationships.

---

## UI Pattern References

**Primary Reference:** `/magic/patterns/ActivitiesPage.tsx`

Key patterns to extract:
- Activity list layout
- Filter controls
- Activity cards
- Timeline view

**Secondary Reference:** `/magic/patterns/ActivityFeed.tsx`

Key patterns to extract:
- Compact activity feed
- Real-time updates
- Activity type icons

**Reference Document:** `/project/INTERACTION_SYSTEM_IMPLEMENTATION.md`

This document defines the backend interaction system including:
- Automatic next-step creation
- Template-based workflows
- Status tracking
- Priority levels

---

## API Endpoints Used

```
GET    /v1/interactions                          # List all interactions
POST   /v1/interactions                          # Create new interaction
GET    /v1/interactions/{id}                     # Get interaction details
PUT    /v1/interactions/{id}                     # Update interaction
POST   /v1/interactions/{id}/complete            # Complete (triggers next step)
POST   /v1/interactions/{id}/cancel              # Cancel interaction
GET    /v1/interactions/customers/{id}/next      # Get next action for customer
POST   /v1/interactions/workflow/start           # Start workflow from template
GET    /v1/interaction-templates                 # List workflow templates
```

---

## Deliverables

### 1. Activities Page

```typescript
// src/command-center/modules/activities/ActivitiesPage.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Filter, Calendar, Clock, CheckCircle2, 
  Phone, Mail, MessageSquare, Users, AlertCircle,
  ChevronDown, MoreVertical, Search
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ActivityCard } from './ActivityCard';
import { ActivityFilters } from './ActivityFilters';
import { CreateActivityModal } from './CreateActivityModal';
import { useActivities } from '../../hooks/useActivities';
import { Activity, ActivityType } from '@/types/command-center';

export function ActivitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'today' | 'overdue'>('all');
  const [filters, setFilters] = useState({
    type: null as ActivityType | null,
    priority: null as string | null,
    customerId: null as string | null,
  });

  const {
    activities,
    isLoading,
    error,
    completeActivity,
    cancelActivity,
    refreshActivities,
  } = useActivities(filters);

  // Filter activities based on tab
  const filteredActivities = activities.filter(activity => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!activity.title.toLowerCase().includes(query) &&
          !activity.description?.toLowerCase().includes(query)) {
        return false;
      }
    }

    switch (activeTab) {
      case 'pending':
        return activity.status === 'pending';
      case 'today':
        const today = new Date().toDateString();
        return new Date(activity.scheduledAt || activity.timestamp).toDateString() === today;
      case 'overdue':
        return activity.status === 'pending' && 
               new Date(activity.dueAt || '') < new Date();
      default:
        return true;
    }
  });

  // Group activities by date
  const groupedActivities = groupActivitiesByDate(filteredActivities);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Activities
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Manage your interactions and action items
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-500 hover:bg-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Activity
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <ActivityFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">
              {activities.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="secondary" className="ml-2">
              {activities.filter(a => a.status === 'pending').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="today">
            Today
            <Badge variant="secondary" className="ml-2">
              {activities.filter(a => {
                const today = new Date().toDateString();
                return new Date(a.scheduledAt || a.timestamp).toDateString() === today;
              }).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue
            <Badge variant="destructive" className="ml-2">
              {activities.filter(a => 
                a.status === 'pending' && new Date(a.dueAt || '') < new Date()
              ).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <ActivityListSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={refreshActivities} />
          ) : filteredActivities.length === 0 ? (
            <EmptyState onCreateNew={() => setShowCreateModal(true)} />
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-4">
                    {formatDateHeader(date)}
                  </h3>
                  <div className="space-y-3">
                    {dateActivities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onComplete={() => completeActivity(activity.id)}
                        onCancel={() => cancelActivity(activity.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Modal */}
      <CreateActivityModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          setShowCreateModal(false);
          refreshActivities();
        }}
      />
    </div>
  );
}

// Helper Functions
function groupActivitiesByDate(activities: Activity[]): Record<string, Activity[]> {
  return activities.reduce((groups, activity) => {
    const date = new Date(activity.scheduledAt || activity.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);
}

function formatDateHeader(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Sub-components
function ActivityListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No activities found
      </h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
        Create your first activity to get started
      </p>
      <Button onClick={onCreateNew}>
        <Plus className="w-4 h-4 mr-2" />
        Create Activity
      </Button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-sm text-red-600 mb-4">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}
```

### 2. Activity Card

```typescript
// src/command-center/modules/activities/ActivityCard.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, Mail, MessageSquare, Calendar, FileText,
  CheckCircle2, Clock, AlertCircle, MoreVertical,
  ChevronRight, User
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
import { Activity, ActivityType } from '@/types/command-center';

interface ActivityCardProps {
  activity: Activity;
  onComplete: () => void;
  onCancel: () => void;
  onClick?: () => void;
}

const activityIcons: Record<ActivityType, React.ComponentType<any>> = {
  phone_call: Phone,
  email: Mail,
  sms: MessageSquare,
  meeting: Calendar,
  task: FileText,
  note: FileText,
  deal_update: FileText,
  campaign: Mail,
};

const priorityColors = {
  urgent: 'border-l-red-500 bg-red-50 dark:bg-red-900/10',
  high: 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10',
  normal: 'border-l-blue-500',
  low: 'border-l-gray-400',
};

const statusBadgeVariants = {
  pending: 'secondary',
  in_progress: 'default',
  completed: 'success',
  cancelled: 'outline',
} as const;

export function ActivityCard({ activity, onComplete, onCancel, onClick }: ActivityCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const Icon = activityIcons[activity.type] || FileText;
  const priorityClass = priorityColors[activity.metadata?.priority as keyof typeof priorityColors] || priorityColors.normal;
  const isOverdue = activity.status === 'pending' && 
                    activity.metadata?.dueAt && 
                    new Date(activity.metadata.dueAt) < new Date();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className={`
          border-l-4 ${priorityClass}
          hover:shadow-md transition-all cursor-pointer
          ${isOverdue ? 'ring-2 ring-red-200 dark:ring-red-900' : ''}
        `}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`
              p-2 rounded-lg
              ${activity.status === 'completed' 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-gray-100 dark:bg-slate-700'
              }
            `}>
              {activity.status === 'completed' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Icon className="w-5 h-5 text-gray-600 dark:text-slate-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`
                  font-medium truncate
                  ${activity.status === 'completed' 
                    ? 'text-gray-500 line-through' 
                    : 'text-gray-900 dark:text-white'
                  }
                `}>
                  {activity.title}
                </h4>
                <Badge variant={statusBadgeVariants[activity.status]}>
                  {activity.status.replace('_', ' ')}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>

              {activity.description && (
                <p className="text-sm text-gray-500 dark:text-slate-400 truncate mb-2">
                  {activity.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-400">
                {activity.customerId && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {activity.metadata?.customerName || 'Customer'}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(activity.scheduledAt || activity.timestamp)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {activity.status === 'pending' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplete();
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                </motion.div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                  <DropdownMenuItem>Assign</DropdownMenuItem>
                  {activity.status === 'pending' && (
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={onCancel}
                    >
                      Cancel
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = Math.abs(diff) / (1000 * 60 * 60);

  if (hours < 1) {
    const minutes = Math.abs(diff) / (1000 * 60);
    return diff > 0 
      ? `In ${Math.round(minutes)} min`
      : `${Math.round(minutes)} min ago`;
  }

  if (hours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  }

  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}
```

### 3. useActivities Hook

```typescript
// src/command-center/hooks/useActivities.ts

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.service';
import { useWebSocket } from './useWebSocket';
import { Activity, ActivityType } from '@/types/command-center';

interface UseActivitiesFilters {
  type: ActivityType | null;
  priority: string | null;
  customerId: string | null;
  status?: string;
}

interface UseActivitiesReturn {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createActivity: (data: Partial<Activity>) => Promise<Activity>;
  updateActivity: (id: string, data: Partial<Activity>) => Promise<Activity>;
  completeActivity: (id: string, outcome?: string) => Promise<Activity>;
  cancelActivity: (id: string) => Promise<void>;
  startWorkflow: (customerId: string, templateId: string) => Promise<Activity>;
  getNextAction: (customerId: string) => Promise<Activity | null>;
  refreshActivities: () => Promise<void>;
}

export function useActivities(filters: UseActivitiesFilters): UseActivitiesReturn {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WebSocket for real-time updates
  const { subscribe, unsubscribe } = useWebSocket();

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.customerId) params.append('customer_id', filters.customerId);
      if (filters.status) params.append('status', filters.status);

      const response = await apiService.get(`/v1/interactions?${params}`);
      setActivities(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Real-time updates via WebSocket
  useEffect(() => {
    const handleActivityEvent = (event: any) => {
      switch (event.type) {
        case 'ACTIVITY_CREATED':
          setActivities(prev => [event.payload, ...prev]);
          break;
        case 'ACTIVITY_UPDATED':
          setActivities(prev =>
            prev.map(a => (a.id === event.payload.id ? event.payload : a))
          );
          break;
        case 'ACTIVITY_COMPLETED':
          setActivities(prev =>
            prev.map(a =>
              a.id === event.payload.id
                ? { ...a, status: 'completed' as const }
                : a
            )
          );
          // If there's a next activity, add it
          if (event.payload.nextActivity) {
            setActivities(prev => [event.payload.nextActivity, ...prev]);
          }
          break;
      }
    };

    subscribe('activity.*', handleActivityEvent);
    return () => unsubscribe('activity.*', handleActivityEvent);
  }, [subscribe, unsubscribe]);

  const createActivity = useCallback(async (data: Partial<Activity>): Promise<Activity> => {
    const response = await apiService.post('/v1/interactions', data);
    setActivities(prev => [response.data, ...prev]);
    return response.data;
  }, []);

  const updateActivity = useCallback(async (
    id: string,
    data: Partial<Activity>
  ): Promise<Activity> => {
    const response = await apiService.put(`/v1/interactions/${id}`, data);
    setActivities(prev =>
      prev.map(a => (a.id === id ? response.data : a))
    );
    return response.data;
  }, []);

  const completeActivity = useCallback(async (
    id: string,
    outcome?: string
  ): Promise<Activity> => {
    const response = await apiService.post(`/v1/interactions/${id}/complete`, {
      outcome,
    });
    
    // Update local state
    setActivities(prev => {
      const updated = prev.map(a =>
        a.id === id ? { ...a, status: 'completed' as const } : a
      );
      
      // Add the next activity if created
      if (response.data.nextInteraction) {
        return [response.data.nextInteraction, ...updated];
      }
      
      return updated;
    });

    return response.data;
  }, []);

  const cancelActivity = useCallback(async (id: string): Promise<void> => {
    await apiService.post(`/v1/interactions/${id}/cancel`);
    setActivities(prev =>
      prev.map(a =>
        a.id === id ? { ...a, status: 'cancelled' as const } : a
      )
    );
  }, []);

  const startWorkflow = useCallback(async (
    customerId: string,
    templateId: string
  ): Promise<Activity> => {
    const response = await apiService.post('/v1/interactions/workflow/start', {
      customer_id: customerId,
      template_id: templateId,
    });
    setActivities(prev => [response.data, ...prev]);
    return response.data;
  }, []);

  const getNextAction = useCallback(async (
    customerId: string
  ): Promise<Activity | null> => {
    try {
      const response = await apiService.get(
        `/v1/interactions/customers/${customerId}/next`
      );
      return response.data;
    } catch {
      return null;
    }
  }, []);

  return {
    activities,
    isLoading,
    error,
    createActivity,
    updateActivity,
    completeActivity,
    cancelActivity,
    startWorkflow,
    getNextAction,
    refreshActivities: fetchActivities,
  };
}
```

### 4. Activity Filters

```typescript
// src/command-center/modules/activities/ActivityFilters.tsx

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
                onValueChange={(v) => onChange({ ...filters, type: v || null })}
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
```

### 5. Create Activity Modal

```typescript
// src/command-center/modules/activities/CreateActivityModal.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useActivities } from '../../hooks/useActivities';
import { ActivityType } from '@/types/command-center';

interface CreateActivityModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  customerId?: string;
}

export function CreateActivityModal({
  open,
  onClose,
  onCreated,
  customerId,
}: CreateActivityModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'task' as ActivityType,
    priority: 'normal',
    scheduledAt: '',
    dueAt: '',
    customerId: customerId || '',
  });

  const { createActivity } = useActivities({
    type: null,
    priority: null,
    customerId: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createActivity({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        customerId: formData.customerId || undefined,
        metadata: {
          priority: formData.priority,
          scheduledAt: formData.scheduledAt || undefined,
          dueAt: formData.dueAt || undefined,
        },
      } as any);
      onCreated();
      resetForm();
    } catch (error) {
      console.error('Failed to create activity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'task',
      priority: 'normal',
      scheduledAt: '',
      dueAt: '',
      customerId: customerId || '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Activity</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Activity title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as ActivityType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="phone_call">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Scheduled For</Label>
              <Input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="datetime-local"
                value={formData.dueAt}
                onChange={(e) => setFormData({ ...formData, dueAt: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.title}>
              {isSubmitting ? 'Creating...' : 'Create Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### 6. Module Index

```typescript
// src/command-center/modules/activities/index.ts

export { ActivitiesPage } from './ActivitiesPage';
export { ActivityCard } from './ActivityCard';
export { ActivityFilters } from './ActivityFilters';
export { CreateActivityModal } from './CreateActivityModal';
export { useActivities } from '../../hooks/useActivities';
```

---

## Testing Requirements

```typescript
// src/command-center/modules/activities/__tests__/ActivitiesPage.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActivitiesPage } from '../ActivitiesPage';

describe('ActivitiesPage', () => {
  it('renders activity list', async () => {
    render(<ActivitiesPage />);
    await waitFor(() => {
      expect(screen.getByText('Activities')).toBeInTheDocument();
    });
  });

  it('filters by status tab', async () => {
    render(<ActivitiesPage />);
    fireEvent.click(screen.getByText('Pending'));
    // Assert filter applied
  });

  it('opens create modal', () => {
    render(<ActivitiesPage />);
    fireEvent.click(screen.getByText('New Activity'));
    expect(screen.getByText('Create New Activity')).toBeInTheDocument();
  });

  it('completes an activity', async () => {
    // Test complete flow with mock
  });
});
```

---

## Acceptance Criteria

- [ ] Activities list displays with proper grouping by date
- [ ] Tab filtering works (All, Pending, Today, Overdue)
- [ ] Search filters activities by title/description
- [ ] Activity cards show correct status, priority, and time
- [ ] Complete action triggers next-step creation
- [ ] Cancel action updates status
- [ ] Create modal validates and submits
- [ ] Real-time updates via WebSocket
- [ ] Loading and error states display correctly
- [ ] Overdue items highlighted
- [ ] Mobile responsive

---

## Handoff

When complete, this module provides:

1. `ActivitiesPage` - Main activities view
2. `ActivityCard` - Individual activity card
3. `ActivityFilters` - Filter controls
4. `CreateActivityModal` - Create form
5. `useActivities` - Data management hook

Other agents import:
```typescript
import { ActivitiesPage, useActivities } from '@/command-center/modules/activities';
```
