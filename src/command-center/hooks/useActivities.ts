// Command Center Activities Hook
// CC-HOOK-02: useActivities Hook

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.service';
import { useChannel } from './useChannel';
import { eventBus, Events } from '../services/events.service';
import { Activity } from '@/types/command-center';

interface UseActivitiesOptions {
  filter?: 'all' | 'pending' | 'today' | 'overdue';
  limit?: number;
  autoRefresh?: boolean;
}

interface UseActivitiesReturn {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  createActivity: (activity: Partial<Activity>) => Promise<Activity>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  completeActivity: (id: string) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  refreshActivities: () => Promise<void>;
}

export function useActivities(options: UseActivitiesOptions = {}): UseActivitiesReturn {
  const { filter = 'all', limit = 50, autoRefresh = true } = options;
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: Record<string, any> = {
        limit,
      };
      
      if (filter !== 'all') {
        params.filter = filter;
      }
      
      const response = await apiService.get<{ data: Activity[]; total: number }>(
        '/v1/activities',
        { params }
      );
      
      if (response.success && response.data) {
        setActivities(response.data.data || []);
        setTotalCount(response.data.total || 0);
      } else {
        setError(response.error?.message || 'Failed to load activities');
        setActivities([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter, limit]);

  // Initial fetch
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Subscribe to real-time updates
  useChannel('activity.*', (payload, message) => {
    if (message.channel === 'activity.created') {
      setActivities(prev => [payload as Activity, ...prev].slice(0, limit));
      setTotalCount(prev => prev + 1);
    } else if (message.channel === 'activity.updated') {
      setActivities(prev =>
        prev.map(activity =>
          activity.id === payload.id ? { ...activity, ...payload } : activity
        )
      );
    } else if (message.channel === 'activity.completed') {
      setActivities(prev =>
        prev.map(activity =>
          activity.id === payload.id
            ? { ...activity, status: 'completed' as const }
            : activity
        )
      );
    }
  });

  // Subscribe to EventBus for cross-module events
  useEffect(() => {
    const unsubscribe = eventBus.on(Events.ACTIVITY_CREATED, (payload) => {
      setActivities(prev => [payload as Activity, ...prev].slice(0, limit));
    });

    return () => unsubscribe.unsubscribe();
  }, [limit]);

  const createActivity = useCallback(async (activity: Partial<Activity>): Promise<Activity> => {
    try {
      const response = await apiService.post<Activity>('/v1/activities', activity);
      
      if (response.success && response.data) {
        const newActivity = response.data;
        setActivities(prev => [newActivity, ...prev].slice(0, limit));
        setTotalCount(prev => prev + 1);
        eventBus.emit(Events.ACTIVITY_CREATED, newActivity);
        return newActivity;
      } else {
        throw new Error(response.error?.message || 'Failed to create activity');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create activity';
      setError(errorMessage);
      throw err;
    }
  }, [limit]);

  const updateActivity = useCallback(async (id: string, updates: Partial<Activity>): Promise<void> => {
    try {
      const response = await apiService.put(`/v1/activities/${id}`, updates);
      
      if (response.success) {
        setActivities(prev =>
          prev.map(activity =>
            activity.id === id ? { ...activity, ...updates } : activity
          )
        );
        eventBus.emit(Events.ACTIVITY_UPDATED, { id, ...updates });
      } else {
        throw new Error(response.error?.message || 'Failed to update activity');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update activity';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const completeActivity = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await apiService.put(`/v1/activities/${id}/complete`, {});
      
      if (response.success) {
        setActivities(prev =>
          prev.map(activity =>
            activity.id === id ? { ...activity, status: 'completed' as const } : activity
          )
        );
        eventBus.emit(Events.ACTIVITY_COMPLETED, { id });
      } else {
        throw new Error(response.error?.message || 'Failed to complete activity');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete activity';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const deleteActivity = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await apiService.delete(`/v1/activities/${id}`);
      
      if (response.success) {
        setActivities(prev => prev.filter(activity => activity.id !== id));
        setTotalCount(prev => Math.max(0, prev - 1));
      } else {
        throw new Error(response.error?.message || 'Failed to delete activity');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete activity';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    activities,
    isLoading,
    error,
    totalCount,
    createActivity,
    updateActivity,
    completeActivity,
    deleteActivity,
    refreshActivities: fetchActivities,
  };
}

