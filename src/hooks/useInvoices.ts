/**
 * Invoice hooks: get, record payment, send.
 * Backed by invoicesApi (src/services/crm/invoices-api.ts) → /api/v1/crm-invoices.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi, type Invoice } from '../services/crm/invoices-api';

export interface RecordPaymentInput {
  amount: number;
  payment_method?: string;
  reference?: string;
  notes?: string;
}

export const useInvoice = (id: string) =>
  useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoicesApi.get(id),
    enabled: !!id,
  });

export const useRecordPayment = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RecordPaymentInput): Promise<Invoice> =>
      invoicesApi.recordPayment(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoices', id] });
    },
  });
};

export const useSendInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string): Promise<Invoice> => invoicesApi.send(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoices', id] });
    },
  });
};
