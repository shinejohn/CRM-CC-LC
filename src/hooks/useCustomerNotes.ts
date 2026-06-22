/**
 * Customer notes hooks: list + create + delete.
 * Backed by customerNotesApi → /api/v1/customers/{id}/notes.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerNotesApi, type CustomerNote } from '../services/crm/customer-attachments-api';

const notesKey = (customerId: string) => ['customer-notes', customerId] as const;

export const useCustomerNotes = (customerId: string) =>
  useQuery({
    queryKey: notesKey(customerId),
    queryFn: () => customerNotesApi.list(customerId),
    enabled: !!customerId,
  });

export const useCreateCustomerNote = (customerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string): Promise<CustomerNote> => customerNotesApi.create(customerId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: notesKey(customerId) }),
  });
};

export const useDeleteCustomerNote = (customerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string): Promise<void> => customerNotesApi.delete(customerId, noteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: notesKey(customerId) }),
  });
};
