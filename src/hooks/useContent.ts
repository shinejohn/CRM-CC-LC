/**
 * Content hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService } from '../services/contentService';

export const useContentList = (params?: { page?: number; per_page?: number }) =>
  useQuery({
    queryKey: ['content', params],
    queryFn: () => contentService.list(params),
  });

export const useContent = (id: string) =>
  useQuery({
    queryKey: ['content', id],
    queryFn: () => contentService.get(id),
    enabled: !!id,
  });

export const useGenerateContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { template_id?: string; campaign_id?: string; prompt?: string }) =>
      contentService.generate(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['content'] }),
  });
};
