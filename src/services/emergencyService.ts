/**
 * Emergency broadcast operations
 */

import { apiClient } from '@/services/api';
import type { EmergencyBroadcast, EmergencyCategory } from '../types/emergency';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const emergencyService = {
  list: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<EmergencyBroadcast>>('/emergency', { params }).then((r: any) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<EmergencyBroadcast>>(`/emergency/${id}`).then((r: any) => r.data.data),

  create: (data: Partial<EmergencyBroadcast>) =>
    apiClient.post<ApiResponse<EmergencyBroadcast>>('/emergency', data).then((r: any) => r.data.data),

  send: (id: string) =>
    apiClient.post<ApiResponse<EmergencyBroadcast>>(`/emergency/${id}/send`).then((r: any) => r.data.data),

  getCategories: () =>
    apiClient.get<ApiResponse<EmergencyCategory[]>>('/emergency/categories').then((r: any) => r.data.data ?? r.data),
};
