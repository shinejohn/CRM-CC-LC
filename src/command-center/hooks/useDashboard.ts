import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api.service';
import { DashboardCard, Activity } from '@/types/command-center';

interface DashboardMetric {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface UseDashboardReturn {
  metrics: DashboardMetric[];
  widgets: DashboardCard[];
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
  updateWidgetPosition: (widgetId: string, position: { row: number; col: number }) => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [widgets, setWidgets] = useState<DashboardCard[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // The only real dashboard endpoint is the CRM analytics aggregate.
      // It returns summary stats (customers, revenue, conversations) — NOT a
      // pre-built widget layout or an activity feed.
      // TODO: no backend route for dashboard widgets or a recent-activity feed;
      // metrics/widgets/activities stay empty until dedicated endpoints exist.
      await apiService.get('/v1/crm/dashboard/analytics', { params: { days: 30 } });

      setMetrics([]);
      setWidgets([]);
      setActivities([]);
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
    // TODO: no backend route for persisting dashboard widget positions.
    // Update local state only until a dashboard-widgets endpoint exists.
    setWidgets(prev =>
      prev.map(w => (w.id === widgetId ? { ...w, position } : w))
    );
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

