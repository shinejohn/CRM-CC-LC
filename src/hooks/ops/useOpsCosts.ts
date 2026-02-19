// ============================================
// HOOK: Ops Costs
// GET /ops/costs/* - budget vs actual, projections
// ============================================

import { useQuery } from '@tanstack/react-query';
import { opsService } from '@/services/opsService';
import type { CostTracking } from '@/types/operations';

export function useOpsCosts(params?: {
  periodType?: CostTracking['periodType'];
  startDate?: Date;
  endDate?: Date;
  page?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: ['ops', 'costs', params],
    queryFn: () => opsService.getCostTracking(params),
  });
}
