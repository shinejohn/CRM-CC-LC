import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.service';
import { DashboardCard } from '@/types/command-center';

interface DashboardMetric {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: any;
  color: string;
}

interface UseDashboardReturn {
  metrics: DashboardMetric[];
  widgets: DashboardCard[];
  activities: any[];
  isLoading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
  updateWidgetPosition: (widgetId: string, position: { row: number; col: number }) => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [widgets, setWidgets] = useState<DashboardCard[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [metricsRes, widgetsRes, activitiesRes] = await Promise.all([
        apiService.get('/v1/dashboard/metrics'),
        apiService.get('/v1/dashboard/widgets'),
        apiService.get('/v1/dashboard/recent-activity', { params: { limit: 10 } }),
      ]);

      setMetrics(Array.isArray(metricsRes.data) ? metricsRes.data : []);
      setWidgets(Array.isArray(widgetsRes.data) ? widgetsRes.data : []);
      setActivities(Array.isArray(activitiesRes.data) ? activitiesRes.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      // Set default data on error
      setMetrics([]);
      setWidgets([]);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const updateWidgetPosition = useCallback(async (
    widgetId: string,
    position: { row: number; col: number }
  ) => {
    try {
      await apiService.put(`/v1/dashboard/widgets/${widgetId}`, { position });
      setWidgets(prev =>
        prev.map(w => (w.id === widgetId ? { ...w, position } : w))
      );
    } catch (err) {
      console.error('Failed to update widget position:', err);
    }
  }, []);

  return {
    metrics,
    widgets,
    activities,
    isLoading,
    error,
    refreshDashboard: fetchDashboardData,
    updateWidgetPosition,
  };
}

