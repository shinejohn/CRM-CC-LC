// ============================================
// OPS DASHBOARD (POD) API CLIENT
// API client for /v1/ops/* and /v1/operations/* endpoints
// ============================================

import { apiClient } from '@/services/api';
import { operationsApi } from './operations/operations-api';
import type {
  OperationsDashboardSnapshot,
  MetricSnapshot,
  MetricAggregate,
  Alert,
  Incident,
  CostTracking,
  ActionExecution,
} from '@/types/operations';
import type { FOAChatRequest, FOAChatResponse } from '../types/ops';
import type { PaginatedResponse } from '@/types/operations';

export const opsService = {
  /** Dashboard snapshot - GET /operations/dashboard/snapshot */
  getDashboardSnapshot: async (): Promise<OperationsDashboardSnapshot> => {
    return operationsApi.getDashboardSnapshot();
  },

  /** Metrics - GET /operations/metric-snapshots */
  getMetricSnapshots: async (params?: {
    metricId?: string;
    dimensionKey?: string;
    dimensionValue?: string;
    granularity?: MetricSnapshot['granularity'];
    startDate?: Date;
    endDate?: Date;
    page?: number;
    perPage?: number;
  }): Promise<PaginatedResponse<MetricSnapshot>> => {
    return operationsApi.getMetricSnapshots(params);
  },

  getMetricAggregates: async (params: {
    metricId: string;
    periodType: MetricAggregate['periodType'];
    startDate: Date;
    endDate: Date;
    page?: number;
    perPage?: number;
  }): Promise<PaginatedResponse<MetricAggregate>> => {
    return operationsApi.getMetricAggregates(params);
  },

  getMetricDefinitions: operationsApi.getMetricDefinitions.bind(operationsApi),

  /** Alerts - GET /operations/alerts */
  getAlerts: async (params?: {
    status?: Alert['status'];
    severity?: Alert['severity'];
    componentId?: string;
    page?: number;
    perPage?: number;
  }): Promise<PaginatedResponse<Alert>> => {
    return operationsApi.getAlerts(params);
  },

  acknowledgeAlert: (id: string) => operationsApi.acknowledgeAlert(id),
  resolveAlert: (id: string, notes: string) => operationsApi.resolveAlert(id, notes),

  /** Incidents - GET /operations/incidents */
  getIncidents: async (params?: {
    status?: Incident['status'];
    severity?: Incident['severity'];
    page?: number;
    perPage?: number;
  }): Promise<PaginatedResponse<Incident>> => {
    return operationsApi.getIncidents(params);
  },

  /** Incidents CRUD */
  createIncident: async (payload: Partial<Incident>): Promise<Incident> => {
    // TODO: no backend route — /v1/ops/incidents is GET-only; incident create is not implemented.
    const res = await apiClient.post<{ data: Incident }>('/v1/ops/incidents', payload);
    return res.data.data;
  },

  updateIncident: async (id: string, payload: Partial<Incident>): Promise<Incident> => {
    // TODO: no backend route — /v1/ops/incidents/{id} PUT is not implemented.
    const res = await apiClient.put<{ data: Incident }>(`/v1/ops/incidents/${id}`, payload);
    return res.data.data;
  },

  /** Costs - GET /operations/cost-tracking */
  getCostTracking: async (params?: {
    periodType?: CostTracking['periodType'];
    startDate?: Date;
    endDate?: Date;
    page?: number;
    perPage?: number;
  }): Promise<PaginatedResponse<CostTracking>> => {
    return operationsApi.getCostTracking(params);
  },

  /** FOA Chat - POST /v1/ops/ai-sessions/chat */
  foaChat: async (payload: FOAChatRequest): Promise<FOAChatResponse> => {
    // TODO: no backend route — FOA (ai-sessions/chat) endpoint is not implemented under /v1/ops.
    const res = await apiClient.post<{ data: FOAChatResponse }>('/v1/ops/ai-sessions/chat', payload);
    return res.data.data;
  },

  /** Action recommendations - approve/reject */
  approveAction: (id: string, notes?: string) =>
    operationsApi.approveAIRecommendation(id, notes),
  rejectAction: (id: string, notes: string) =>
    operationsApi.rejectAIRecommendation(id, notes),

  /** Action executions history */
  getActionExecutions: async (params?: {
    status?: ActionExecution['status'];
    page?: number;
    perPage?: number;
  }): Promise<PaginatedResponse<ActionExecution>> => {
    return operationsApi.getActionExecutions(params);
  },
};
