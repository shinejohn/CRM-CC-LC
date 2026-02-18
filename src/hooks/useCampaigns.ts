/**
 * Campaign hooks
 */

import { useQuery } from '@tanstack/react-query';
import { campaignService } from '../services/campaignService';

export const useCampaignList = (params?: { page?: number; per_page?: number }) =>
  useQuery({
    queryKey: ['campaigns', params],
    queryFn: () => campaignService.list(params),
  });

export const useCampaign = (id: string) =>
  useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => campaignService.get(id),
    enabled: !!id,
  });

export const useCampaignRecipients = (id: string) =>
  useQuery({
    queryKey: ['campaigns', id, 'recipients'],
    queryFn: () => campaignService.getRecipients(id),
    enabled: !!id,
  });
