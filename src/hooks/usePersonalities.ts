/**
 * AI personality hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { personalityService } from '../services/personalityService';

export const usePersonalityList = () =>
  useQuery({
    queryKey: ['personalities'],
    queryFn: () => personalityService.list(),
  });

export const useAssignedPersonality = (customerId: string) =>
  useQuery({
    queryKey: ['personalities', 'customer', customerId],
    queryFn: () => personalityService.getCustomerPersonality(customerId),
    enabled: !!customerId,
  });
