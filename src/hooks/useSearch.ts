/**
 * Search hooks: semantic, full-text, hybrid
 */

import { useMutation } from '@tanstack/react-query';
import { searchService } from '../services/searchService';

export const useSemanticSearch = () =>
  useMutation({
    mutationFn: (query: string) => searchService.semantic(query),
  });

export const useFullTextSearch = () =>
  useMutation({
    mutationFn: (query: string) => searchService.fullText(query),
  });

export const useHybridSearch = () =>
  useMutation({
    mutationFn: (query: string) => searchService.hybrid(query),
  });
