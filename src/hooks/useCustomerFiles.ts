/**
 * Customer file attachment hooks: list + upload + delete + download.
 * Backed by customerFilesApi → /api/v1/customers/{id}/files.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerFilesApi, type CustomerFile } from '../services/crm/customer-attachments-api';

const filesKey = (customerId: string) => ['customer-files', customerId] as const;

export const useCustomerFiles = (customerId: string) =>
  useQuery({
    queryKey: filesKey(customerId),
    queryFn: () => customerFilesApi.list(customerId),
    enabled: !!customerId,
  });

export const useUploadCustomerFile = (customerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File): Promise<CustomerFile> => customerFilesApi.upload(customerId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: filesKey(customerId) }),
  });
};

export const useDeleteCustomerFile = (customerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string): Promise<void> => customerFilesApi.delete(customerId, fileId),
    onSuccess: () => qc.invalidateQueries({ queryKey: filesKey(customerId) }),
  });
};

export const useDownloadCustomerFile = (customerId: string) =>
  useMutation({
    mutationFn: ({ fileId, fileName }: { fileId: string; fileName: string }): Promise<void> =>
      customerFilesApi.download(customerId, fileId, fileName),
  });
