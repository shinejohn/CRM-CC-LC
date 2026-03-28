/**
 * Approval workflow operations
 */

import { apiClient } from '@/services/api';
import type { Approval, ProvisioningTask } from '../types/approval';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const approvalService = {
  list: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<Approval>>('/approvals', { params }).then((r: any) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Approval>>(`/approvals/${id}`).then((r: any) => r.data.data),

  provision: (id: string) =>
    apiClient.post<ApiResponse<Approval>>(`/approvals/${id}/provision`).then((r: any) => r.data.data),

  cancel: (id: string) => apiClient.delete(`/approvals/${id}`),

  getProvisioningTasks: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<ProvisioningTask>>('/provisioning-tasks', { params }).then((r: any) => r.data),

  retryTask: (id: string) =>
    apiClient.post<ApiResponse<ProvisioningTask>>(`/provisioning-tasks/${id}/retry`).then((r: any) => r.data.data),
};
