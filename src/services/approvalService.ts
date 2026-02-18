/**
 * Approval workflow operations
 */

import api from './api';
import type { Approval, ProvisioningTask } from '../types/approval';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const approvalService = {
  list: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<Approval>>('/approvals', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<ApiResponse<Approval>>(`/approvals/${id}`).then((r) => r.data.data),

  provision: (id: string) =>
    api.post<ApiResponse<Approval>>(`/approvals/${id}/provision`).then((r) => r.data.data),

  cancel: (id: string) => api.delete(`/approvals/${id}`),

  getProvisioningTasks: (params?: { page?: number; per_page?: number }) =>
    api.get<PaginatedResponse<ProvisioningTask>>('/provisioning-tasks', { params }).then((r) => r.data),

  retryTask: (id: string) =>
    api.post<ApiResponse<ProvisioningTask>>(`/provisioning-tasks/${id}/retry`).then((r) => r.data.data),
};
