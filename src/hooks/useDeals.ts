/**
 * Deal pipeline hooks: pipeline (kanban), transition (stage change / won / lost),
 * create, update, delete.
 * Backed by dealsApi (src/services/crm/deals-api.ts) → /v1/deals.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dealsApi, type Deal, type DealStage, type PipelineByStage } from '../services/crm/deals-api';

export const usePipeline = () =>
  useQuery<PipelineByStage>({
    queryKey: ['deals', 'pipeline'],
    queryFn: () => dealsApi.pipeline(),
  });

export const useDeal = (id: string) =>
  useQuery<Deal>({
    queryKey: ['deals', id],
    queryFn: () => dealsApi.get(id),
    enabled: !!id,
  });

export const useTransitionDeal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage, lossReason }: { id: string; stage: DealStage; lossReason?: string }): Promise<Deal> =>
      dealsApi.transition(id, stage, lossReason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });
};

export const useCreateDeal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      customer_id: string;
      contact_id?: string;
      name: string;
      value?: number;
      stage?: DealStage;
      notes?: string;
      expected_close_at?: string;
    }): Promise<Deal> => dealsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });
};

export const useUpdateDeal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ contact_id: string; name: string; value: number; notes: string; expected_close_at: string }>;
    }): Promise<Deal> => dealsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });
};

export const useDeleteDeal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string): Promise<void> => dealsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });
};
