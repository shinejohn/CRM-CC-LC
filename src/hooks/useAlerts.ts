/**
 * Alert hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertService } from '../services/alertService';

export const useAlertList = (params?: { page?: number; per_page?: number }) =>
  useQuery({
    queryKey: ['alerts', params],
    queryFn: () => alertService.list(params),
  });

export const useAlert = (id: string) =>
  useQuery({
    queryKey: ['alerts', id],
    queryFn: () => alertService.get(id),
    enabled: !!id,
  });
