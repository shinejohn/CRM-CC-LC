import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api.service';
import { useWebSocket } from '../../hooks/useWebSocket';
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
      const params: Record<string, string> = {};
      if (filters.type) params.type = filters.type;
      if (filters.priority) params.priority = filters.priority;
      if (filters.customerId) params.customer_id = filters.customerId;
      if (filters.status) params.status = filters.status;

      const response = await apiService.get<Activity[]>('/v1/interactions', { params });
      if (response.success && response.data) {
        setActivities(response.data);
      } else {
        setError(response.error?.message || 'Failed to load activities');
      }
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
    const handleActivityEvent = (payload: any, message: any) => {
      const eventType = message.type || payload.type;
      
      switch (eventType) {
        case 'ACTIVITY_CREATED':
          setActivities(prev => [payload.activity || payload, ...prev]);
          break;
        case 'ACTIVITY_UPDATED':
          setActivities(prev =>
            prev.map(a => (a.id === (payload.id || payload.activity?.id) ? (payload.activity || payload) : a))
          );
          break;
        case 'ACTIVITY_COMPLETED':
          setActivities(prev =>
            prev.map(a =>
              a.id === (payload.id || payload.activity?.id)
                ? { ...a, status: 'completed' as const }
                : a
            )
          );
          // If there's a next activity, add it
          if (payload.nextActivity || payload.nextInteraction) {
            setActivities(prev => [(payload.nextActivity || payload.nextInteraction), ...prev]);
          }
          break;
      }
    };

    const unsubscribeFn = subscribe('activity.*', handleActivityEvent);
    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [subscribe, unsubscribe]);

  const createActivity = useCallback(async (data: Partial<Activity>): Promise<Activity> => {
    const response = await apiService.post<Activity>('/v1/interactions', data);
    if (response.success && response.data) {
      setActivities(prev => [response.data!, ...prev]);
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to create activity');
  }, []);

  const updateActivity = useCallback(async (
    id: string,
    data: Partial<Activity>
  ): Promise<Activity> => {
    const response = await apiService.put<Activity>(`/v1/interactions/${id}`, data);
    if (response.success && response.data) {
      setActivities(prev =>
        prev.map(a => (a.id === id ? response.data! : a))
      );
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to update activity');
  }, []);

  const completeActivity = useCallback(async (
    id: string,
    outcome?: string
  ): Promise<Activity> => {
    const response = await apiService.post<Activity>(`/v1/interactions/${id}/complete`, {
      outcome,
    });
    
    if (response.success && response.data) {
      // Update local state
      setActivities(prev => {
        const updated = prev.map(a =>
          a.id === id ? { ...a, status: 'completed' as const } : a
        );
        
        // Add the next activity if created
        if (response.data?.metadata?.nextInteraction) {
          return [response.data.metadata.nextInteraction, ...updated];
        }
        
        return updated;
      });

      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to complete activity');
  }, []);

  const cancelActivity = useCallback(async (id: string): Promise<void> => {
    const response = await apiService.post(`/v1/interactions/${id}/cancel`);
    if (response.success) {
      setActivities(prev =>
        prev.map(a =>
          a.id === id ? { ...a, status: 'cancelled' as const } : a
        )
      );
    } else {
      throw new Error(response.error?.message || 'Failed to cancel activity');
    }
  }, []);

  const startWorkflow = useCallback(async (
    customerId: string,
    templateId: string
  ): Promise<Activity> => {
    const response = await apiService.post<Activity>('/v1/interactions/workflow/start', {
      customer_id: customerId,
      template_id: templateId,
    });
    if (response.success && response.data) {
      setActivities(prev => [response.data!, ...prev]);
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to start workflow');
  }, []);

  const getNextAction = useCallback(async (
    customerId: string
  ): Promise<Activity | null> => {
    try {
      const response = await apiService.get<Activity>(
        `/v1/interactions/customers/${customerId}/next`
      );
      return response.success ? (response.data || null) : null;
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

