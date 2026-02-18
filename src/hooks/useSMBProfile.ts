/**
 * SMB profile hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { smbService } from '../services/smbService';
import type { SMBProfile } from '../types/smb';

export const useSMBProfile = () =>
  useQuery({
    queryKey: ['smb-profile'],
    queryFn: () => smbService.getProfile(),
  });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<SMBProfile>) => smbService.updateProfile(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['smb-profile'] }),
  });
};
