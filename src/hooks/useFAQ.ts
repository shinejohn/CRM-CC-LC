/**
 * FAQ hooks
 */

import { useQuery } from '@tanstack/react-query';
import { faqService } from '../services/faqService';

export const useFAQCategories = () =>
  useQuery({
    queryKey: ['faq-categories'],
    queryFn: () => faqService.getCategories(),
  });

export const useFAQs = (params?: { page?: number; per_page?: number }) =>
  useQuery({
    queryKey: ['faqs', params],
    queryFn: () => faqService.list(params),
  });
