/**
 * Outbound campaign hooks: list, get, create, start, delete, analytics.
 * Backed by outboundCampaignsApi (src/services/crm/outbound-campaigns-api.ts)
 * → /api/v1/outbound/campaigns.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  outboundCampaignsApi,
  type CreateOutboundCampaignInput,
  type OutboundCampaign,
  type OutboundCampaignListParams,
} from '../services/crm/outbound-campaigns-api';

const KEY = 'outbound-campaigns';

export const useOutboundCampaigns = (params?: OutboundCampaignListParams) =>
  useQuery({
    queryKey: [KEY, params ?? {}],
    queryFn: () => outboundCampaignsApi.list(params),
  });

export const useOutboundCampaignAnalytics = (id: string | null) =>
  useQuery({
    queryKey: [KEY, id, 'analytics'],
    queryFn: () => outboundCampaignsApi.analytics(id as string),
    enabled: !!id,
  });

export const useCreateOutboundCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOutboundCampaignInput): Promise<OutboundCampaign> =>
      outboundCampaignsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useStartOutboundCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string): Promise<OutboundCampaign> => outboundCampaignsApi.start(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};

export const useDeleteOutboundCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string): Promise<void> => outboundCampaignsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
};
