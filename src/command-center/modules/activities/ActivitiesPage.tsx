import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
import { useActivities } from './useActivities';
import { Activity, ActivityType } from '@/types/command-center';
import { ApiErrorDisplay } from '../../components/errors/ApiErrorDisplay';

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
        const scheduledAt = activity.metadata?.scheduledAt || activity.metadata?.dueAt || activity.timestamp;
        return new Date(scheduledAt).toDateString() === today;
      case 'overdue':
        return activity.status === 'pending' && 
               activity.metadata?.dueAt && 
               new Date(activity.metadata.dueAt) < new Date();
      default:
        return true;
    }
  });

  // Group activities by date
  const groupedActivities = groupActivitiesByDate(filteredActivities);

  return (
    <div className="space-y-6 p-6">
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
                const scheduledAt = a.metadata?.scheduledAt || a.metadata?.dueAt || a.timestamp;
                return new Date(scheduledAt).toDateString() === today;
              }).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue
            <Badge variant="destructive" className="ml-2">
              {activities.filter(a => 
                a.status === 'pending' && a.metadata?.dueAt && new Date(a.metadata.dueAt) < new Date()
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
    const scheduledAt = activity.metadata?.scheduledAt || activity.metadata?.dueAt || activity.timestamp;
    const date = new Date(scheduledAt).toDateString();
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
      <p className="text-sm text-red-600 dark:text-red-400 mb-4">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}

