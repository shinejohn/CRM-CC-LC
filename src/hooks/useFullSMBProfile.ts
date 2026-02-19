/**
 * Hook to fetch full SMB profile (Intelligence Hub)
 */

import { useQuery } from '@tanstack/react-query';
import { smbService } from '../services/smbService';

export const useFullSMBProfile = (smbId: string | null) =>
  useQuery({
    queryKey: ['smb-full-profile', smbId],
    queryFn: () => smbService.getFullProfile(smbId!),
    enabled: !!smbId,
  });
