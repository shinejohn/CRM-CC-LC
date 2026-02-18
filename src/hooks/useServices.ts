/**
 * Service catalog hooks
 */

import { useQuery } from '@tanstack/react-query';
import { serviceService } from '../services/serviceService';

export const useServiceCatalog = (params?: { type?: string }) =>
  useQuery({
    queryKey: ['services', params],
    queryFn: () => serviceService.list(params),
  });

export const useService = (id: string) =>
  useQuery({
    queryKey: ['services', id],
    queryFn: () => serviceService.get(id),
    enabled: !!id,
  });

export const useServiceCategories = () =>
  useQuery({
    queryKey: ['service-categories'],
    queryFn: () => serviceService.getCategories(),
  });
