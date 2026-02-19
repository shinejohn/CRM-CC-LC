// ============================================
// HOOK: Ops Dashboard Snapshot
// GET /ops/dashboard/snapshot - auto-refresh every 30s
// ============================================

import { useQuery } from '@tanstack/react-query';
import { opsService } from '@/services/opsService';

const OPS_DASHBOARD_KEY = ['ops', 'dashboard', 'snapshot'] as const;

export function useOpsDashboard(refetchIntervalMs = 30_000) {
  return useQuery({
    queryKey: OPS_DASHBOARD_KEY,
    queryFn: () => opsService.getDashboardSnapshot(),
    refetchInterval: refetchIntervalMs,
    staleTime: refetchIntervalMs - 5000,
  });
}
