// ============================================
// HOOK: Ops Alerts
// GET /ops/alerts - active alerts, acknowledge, resolve
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opsService } from '@/services/opsService';
import type { Alert } from '@/types/operations';

const OPS_ALERTS_KEY = ['ops', 'alerts'] as const;

export function useOpsAlerts(params?: {
  status?: Alert['status'];
  severity?: Alert['severity'];
  componentId?: string;
  page?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: [...OPS_ALERTS_KEY, params],
    queryFn: () => opsService.getAlerts(params),
  });
}

export function useOpsAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => opsService.acknowledgeAlert(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: OPS_ALERTS_KEY }),
  });
}

export function useOpsResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      opsService.resolveAlert(id, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: OPS_ALERTS_KEY }),
  });
}
