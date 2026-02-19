// ============================================
// HOOK: Ops Incidents
// GET /ops/incidents - list, create, update lifecycle
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { opsService } from '@/services/opsService';
import type { Incident } from '@/types/operations';

const OPS_INCIDENTS_KEY = ['ops', 'incidents'] as const;

export function useOpsIncidents(params?: {
  status?: Incident['status'];
  severity?: Incident['severity'];
  page?: number;
  perPage?: number;
}) {
  return useQuery({
    queryKey: [...OPS_INCIDENTS_KEY, params],
    queryFn: () => opsService.getIncidents(params),
  });
}

export function useOpsCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Incident>) => opsService.createIncident(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: OPS_INCIDENTS_KEY }),
  });
}

export function useOpsUpdateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Incident> }) =>
      opsService.updateIncident(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: OPS_INCIDENTS_KEY }),
  });
}
