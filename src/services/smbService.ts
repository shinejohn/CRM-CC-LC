/**
 * SMB profile operations
 */

import api from './api';
import type { SMBProfile } from '../types/smb';
import type { ApiResponse } from '../types/common';

export const smbService = {
  getProfile: () =>
    api.get<ApiResponse<SMBProfile>>('/smb/profile').then((r) => r.data.data),

  updateProfile: (data: Partial<SMBProfile>) =>
    api.put<ApiResponse<SMBProfile>>('/smb/profile', data).then((r) => r.data.data),
};
