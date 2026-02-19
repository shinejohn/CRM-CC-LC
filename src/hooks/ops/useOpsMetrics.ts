// ============================================
// HOOK: Ops Metrics
// GET /ops/metrics/* - time-series, aggregates
// ============================================

import { useQuery } from '@tanstack/react-query';
import { opsService } from '@/services/opsService';
import type { MetricSnapshot, MetricAggregate } from '@/types/operations';

export function useOpsMetricSnapshots(params?: {
  metricId?: string;
  dimensionKey?: string;
  dimensionValue?: string;
  granularity?: MetricSnapshot['granularity'];
  startDate?: Date;
  endDate?: Date;
  page?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: ['ops', 'metrics', 'snapshots', params],
    queryFn: () => opsService.getMetricSnapshots(params),
    enabled: !!params?.metricId || true,
  });
}

export function useOpsMetricAggregates(params: {
  metricId: string;
  periodType: MetricAggregate['periodType'];
  startDate: Date;
  endDate: Date;
  page?: number;
  perPage?: number;
} | null) {
  return useQuery({
    queryKey: ['ops', 'metrics', 'aggregates', params],
    queryFn: () => opsService.getMetricAggregates(params!),
    enabled: !!params?.metricId && !!params?.startDate && !!params?.endDate,
  });
}

export function useOpsMetricDefinitions(params?: {
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: ['ops', 'metrics', 'definitions', params],
    queryFn: () => opsService.getMetricDefinitions(params),
  });
}
