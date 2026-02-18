/**
 * Analytics hooks
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';
import { customerService } from '../services/customerService';

export const useDashboardAnalytics = (params?: { start_date?: string; end_date?: string }) =>
  useQuery({
    queryKey: ['analytics', 'dashboard', params],
    queryFn: () => analyticsService.getDashboard(params),
  });

export const useEngagementScore = (customerId: string) =>
  useQuery({
    queryKey: ['customers', customerId, 'engagement-score'],
    queryFn: () => customerService.getEngagementScore(customerId),
    enabled: !!customerId,
  });
