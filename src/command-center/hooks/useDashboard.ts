import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, DollarSign, TrendingUp } from 'lucide-react';
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

/**
 * Subset of the /v1/crm/dashboard/analytics payload the dashboard metrics use.
 * The endpoint returns much more (industry/outcome breakdowns, revenue series),
 * but the header metric tiles only need these aggregates.
 */
interface DashboardAnalytics {
  customers?: { total?: number; new?: number };
  orders?: { total_revenue?: number; recent_revenue?: number };
  conversion?: { rate?: number };
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

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function buildMetrics(analytics: DashboardAnalytics): DashboardMetric[] {
  const totalCustomers = analytics.customers?.total ?? 0;
  const newCustomers = analytics.customers?.new ?? 0;
  const revenue = analytics.orders?.total_revenue ?? 0;
  const conversionRate = analytics.conversion?.rate ?? 0;

  return [
    {
      id: 'customers',
      label: 'Customers',
      value: totalCustomers.toLocaleString(),
      icon: Users,
      color: 'lavender',
    },
    {
      id: 'new-customers',
      label: 'New (30d)',
      value: newCustomers.toLocaleString(),
      icon: UserPlus,
      color: 'mint',
    },
    {
      id: 'revenue',
      label: 'Revenue',
      value: currency.format(revenue),
      icon: DollarSign,
      color: 'sky',
    },
    {
      id: 'conversion',
      label: 'Conversion',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: 'peach',
    },
  ];
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
      // Three independent sources, fetched in parallel:
      //  - widget layout (persisted per-user, seeds defaults on first load)
      //  - recent-activity feed (CRM interactions + activities, tenant-scoped)
      //  - CRM analytics aggregate (drives the header metric tiles)
      const [widgetsRes, activityRes, analyticsRes] = await Promise.all([
        apiService.get<DashboardCard[]>('/v1/dashboard/widgets'),
        apiService.get<Activity[]>('/v1/dashboard/recent-activity', { params: { limit: 10 } }),
        apiService.get<DashboardAnalytics>('/v1/crm/dashboard/analytics', { params: { days: 30 } }),
      ]);

      setWidgets(widgetsRes.success && widgetsRes.data ? widgetsRes.data : []);
      setActivities(activityRes.success && activityRes.data ? activityRes.data : []);
      setMetrics(analyticsRes.success && analyticsRes.data ? buildMetrics(analyticsRes.data) : []);

      if (!widgetsRes.success || !activityRes.success || !analyticsRes.success) {
        setError(
          widgetsRes.error?.message ??
            activityRes.error?.message ??
            analyticsRes.error?.message ??
            'Failed to load dashboard'
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
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
    // Optimistic local update, then persist the single widget's position.
    setWidgets(prev =>
      prev.map(w => (w.id === widgetId ? { ...w, position } : w))
    );

    const res = await apiService.put<DashboardCard>(
      `/v1/dashboard/widgets/${widgetId}`,
      { position }
    );

    // Reconcile with the server's canonical card (keeps size/config in sync).
    if (res.success && res.data) {
      setWidgets(prev => prev.map(w => (w.id === widgetId ? res.data as DashboardCard : w)));
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
