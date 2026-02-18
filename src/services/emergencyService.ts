/**
 * Emergency broadcast operations
 */

import api from './api';
import type { EmergencyBroadcast, EmergencyCategory } from '../types/emergency';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const emergencyService = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<EmergencyBroadcast>>('/emergency', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<EmergencyBroadcast>>(`/emergency/${id}`).then((r) => r.data.data),

  create: (data: Partial<EmergencyBroadcast>) =>
    api.post<ApiResponse<EmergencyBroadcast>>('/emergency', data).then((r) => r.data.data),

  send: (id: string) =>
    api.post<ApiResponse<EmergencyBroadcast>>(`/emergency/${id}/send`).then((r) => r.data.data),

  getCategories: () =>
    api.get<ApiResponse<EmergencyCategory[]>>('/emergency/categories').then((r) => r.data.data ?? r.data),
};
