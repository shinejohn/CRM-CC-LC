/**
 * Quote (Proposal) hooks: list, get, create, update, send, convert, delete.
 * Backed by quotesApi (src/services/crm/quotes-api.ts) → /v1/quotes.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi, type Quote } from '../services/crm/quotes-api';

export interface QuoteListParams {
  status?: string;
  customer_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface CreateQuoteInput {
  customer_id: string;
  deal_id?: string;
  tax_rate?: number;
  discount?: number;
  valid_until?: string;
  notes?: string;
  items: { description: string; quantity: number; unit_price: number }[];
}

export const useQuotes = (params?: QuoteListParams) =>
  useQuery({
    queryKey: ['quotes', params ?? {}],
    queryFn: () => quotesApi.list(params),
  });

export const useQuote = (id: string) =>
  useQuery({
    queryKey: ['quotes', id],
    queryFn: () => quotesApi.get(id),
    enabled: !!id,
  });

export const useCreateQuote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuoteInput): Promise<Quote> => quotesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  });
};

export const useSendQuote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string): Promise<Quote> => quotesApi.send(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['quotes', id] });
    },
  });
};

export const useConvertQuoteToInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string): Promise<unknown> => quotesApi.convertToInvoice(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['quotes'] });
      qc.invalidateQueries({ queryKey: ['quotes', id] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useDeleteQuote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string): Promise<void> => quotesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  });
};
