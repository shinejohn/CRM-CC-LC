/**
 * Approval workflow operations
 */

import type { AxiosResponse } from 'axios';
import { apiClient } from '@/services/api';
import type { Approval, ProvisioningTask } from '../types/approval';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const approvalService = {
  list: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<Approval>>('/v1/approvals', { params }).then((r: AxiosResponse<PaginatedResponse<Approval>>) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Approval>>(`/v1/approvals/${id}`).then((r: AxiosResponse<ApiResponse<Approval>>) => r.data.data),

  provision: (id: string) =>
    apiClient.post<ApiResponse<Approval>>(`/v1/approvals/${id}/provision`).then((r: AxiosResponse<ApiResponse<Approval>>) => r.data.data),

  cancel: (id: string) => apiClient.delete(`/v1/approvals/${id}`),

  getProvisioningTasks: (params?: { page?: number; per_page?: number }) =>
    apiClient.get<PaginatedResponse<ProvisioningTask>>('/v1/provisioning-tasks', { params }).then((r: AxiosResponse<PaginatedResponse<ProvisioningTask>>) => r.data),

  retryTask: (id: string) =>
    apiClient.post<ApiResponse<ProvisioningTask>>(`/v1/provisioning-tasks/${id}/retry`).then((r: AxiosResponse<ApiResponse<ProvisioningTask>>) => r.data.data),
};
