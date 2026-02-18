/**
 * Newsletter hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newsletterService } from '../services/newsletterService';

export const useNewsletterList = (params?: { page?: number; per_page?: number }) =>
  useQuery({
    queryKey: ['newsletters', params],
    queryFn: () => newsletterService.list(params),
  });

export const useNewsletter = (id: string) =>
  useQuery({
    queryKey: ['newsletters', id],
    queryFn: () => newsletterService.get(id),
    enabled: !!id,
  });
