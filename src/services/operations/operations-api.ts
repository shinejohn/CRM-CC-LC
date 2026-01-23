// ============================================
// OPERATIONS API SERVICE
// ============================================

import { apiClient } from '../learning/api-client';
import type {
  MetricDefinition,
  MetricSnapshot,
  MetricAggregate,
  AISession,
  AIRecommendation,
  AIContextMemory,
  InfrastructureComponent,
  HealthCheck,
  EmailIPReputation,
  QueueMetrics,
  RevenueSnapshot,
  CostTracking,
  PipelineMetrics,
  ActionDefinition,
  ActionExecution,
  AlertRule,
  Alert,
  Incident,
  DevelopmentMilestone,
  FeatureFlag,
  OperationsDashboardSnapshot,
} from '@/types/operations';
import type { PaginatedResponse } from '../learning/api-client';

/**
 * Operations API Service
 * Handles all API calls for Fibonacco Operations AI and Platform Operations Dashboard
 */
class OperationsApiService {
  private basePath = '/api/v1/operations';

  /**
   * Metric Definitions
   */
  async getMetricDefinitions(): Promise<MetricDefinition[]> {
    const response = await apiClient.get<{ data: MetricDefinition[] }>(`${this.basePath}/metric-definitions`);
    return response.data?.data || response.data || [];
  }

  async getMetricDefinition(id: string): Promise<MetricDefinition> {
    const response = await apiClient.get<{ data: MetricDefinition }>(`${this.basePath}/metric-definitions/${id}`);
    return response.data?.data || response.data;
  }

  /**
   * Metric Snapshots
   */
  async getMetricSnapshots(params?: {
    metricId?: string;
    startDate?: Date;
    endDate?: Date;
    granularity?: 'point' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  }): Promise<PaginatedResponse<MetricSnapshot>> {
    const queryParams = new URLSearchParams();
    if (params?.metricId) queryParams.append('metric_id', params.metricId);
    if (params?.startDate) queryParams.append('start_date', params.startDate.toISOString());
    if (params?.endDate) queryParams.append('end_date', params.endDate.toISOString());
    if (params?.granularity) queryParams.append('granularity', params.granularity);

    const response = await apiClient.get<PaginatedResponse<MetricSnapshot>>(
      `${this.basePath}/metric-snapshots?${queryParams.toString()}`
    );
    return response.data || response;
  }

  /**
   * Metric Aggregates
   */
  async getMetricAggregates(params: {
    metricId: string;
    periodType: 'hourly' | 'daily' | 'weekly' | 'monthly';
    startDate: Date;
    endDate: Date;
  }): Promise<MetricAggregate[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('metric_id', params.metricId);
    queryParams.append('period_type', params.periodType);
    queryParams.append('start_date', params.startDate.toISOString());
    queryParams.append('end_date', params.endDate.toISOString());

    const response = await apiClient.get<{ data: MetricAggregate[] }>(
      `${this.basePath}/metric-aggregates?${queryParams.toString()}`
    );
    return response.data?.data || response.data || [];
  }

  /**
   * AI Sessions
   */
  async getAISessions(params?: {
    sessionType?: string;
    status?: string;
    limit?: number;
  }): Promise<PaginatedResponse<AISession>> {
    const queryParams = new URLSearchParams();
    if (params?.sessionType) queryParams.append('session_type', params.sessionType);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<PaginatedResponse<AISession>>(
      `${this.basePath}/ai-sessions?${queryParams.toString()}`
    );
    return response.data || response;
  }

  async getAISession(id: string): Promise<AISession> {
    const response = await apiClient.get<{ data: AISession }>(`${this.basePath}/ai-sessions/${id}`);
    return response.data?.data || response.data;
  }

  async createAISession(data: Partial<AISession>): Promise<AISession> {
    const response = await apiClient.post<{ data: AISession }>(`${this.basePath}/ai-sessions`, data);
    return response.data?.data || response.data;
  }

  /**
   * AI Recommendations
   */
  async getAIRecommendations(params?: {
    status?: string;
    priority?: string;
    category?: string;
  }): Promise<PaginatedResponse<AIRecommendation>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.category) queryParams.append('category', params.category);

    const response = await apiClient.get<PaginatedResponse<AIRecommendation>>(
      `${this.basePath}/ai-recommendations?${queryParams.toString()}`
    );
    return response.data || response;
  }

  async approveAIRecommendation(id: string, notes?: string): Promise<AIRecommendation> {
    const response = await apiClient.post<{ data: AIRecommendation }>(
      `${this.basePath}/ai-recommendations/${id}/approve`,
      { notes }
    );
    return response.data?.data || response.data;
  }

  async rejectAIRecommendation(id: string, notes: string): Promise<AIRecommendation> {
    const response = await apiClient.post<{ data: AIRecommendation }>(
      `${this.basePath}/ai-recommendations/${id}/reject`,
      { notes }
    );
    return response.data?.data || response.data;
  }

  /**
   * Infrastructure Components
   */
  async getInfrastructureComponents(): Promise<InfrastructureComponent[]> {
    const response = await apiClient.get<{ data: InfrastructureComponent[] }>(
      `${this.basePath}/infrastructure-components`
    );
    return response.data?.data || response.data || [];
  }

  async getInfrastructureComponent(id: string): Promise<InfrastructureComponent> {
    const response = await apiClient.get<{ data: InfrastructureComponent }>(
      `${this.basePath}/infrastructure-components/${id}`
    );
    return response.data?.data || response.data;
  }

  /**
   * Health Checks
   */
  async getHealthChecks(params?: {
    componentId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<PaginatedResponse<HealthCheck>> {
    const queryParams = new URLSearchParams();
    if (params?.componentId) queryParams.append('component_id', params.componentId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('start_date', params.startDate.toISOString());
    if (params?.endDate) queryParams.append('end_date', params.endDate.toISOString());

    const response = await apiClient.get<PaginatedResponse<HealthCheck>>(
      `${this.basePath}/health-checks?${queryParams.toString()}`
    );
    return response.data || response;
  }

  /**
   * Email IP Reputation
   */
  async getEmailIPReputation(params?: {
    ipPool?: string;
    status?: string;
  }): Promise<EmailIPReputation[]> {
    const queryParams = new URLSearchParams();
    if (params?.ipPool) queryParams.append('ip_pool', params.ipPool);
    if (params?.status) queryParams.append('status', params.status);

    const response = await apiClient.get<{ data: EmailIPReputation[] }>(
      `${this.basePath}/email-ip-reputation?${queryParams.toString()}`
    );
    return response.data?.data || response.data || [];
  }

  /**
   * Queue Metrics
   */
  async getQueueMetrics(params?: {
    queueName?: string;
    status?: string;
  }): Promise<QueueMetrics[]> {
    const queryParams = new URLSearchParams();
    if (params?.queueName) queryParams.append('queue_name', params.queueName);
    if (params?.status) queryParams.append('status', params.status);

    const response = await apiClient.get<{ data: QueueMetrics[] }>(
      `${this.basePath}/queue-metrics?${queryParams.toString()}`
    );
    return response.data?.data || response.data || [];
  }

  /**
   * Revenue Snapshots
   */
  async getRevenueSnapshots(params?: {
    startDate?: Date;
    endDate?: Date;
    snapshotType?: 'daily' | 'weekly' | 'monthly';
  }): Promise<RevenueSnapshot[]> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('start_date', params.startDate.toISOString());
    if (params?.endDate) queryParams.append('end_date', params.endDate.toISOString());
    if (params?.snapshotType) queryParams.append('snapshot_type', params.snapshotType);

    const response = await apiClient.get<{ data: RevenueSnapshot[] }>(
      `${this.basePath}/revenue-snapshots?${queryParams.toString()}`
    );
    return response.data?.data || response.data || [];
  }

  /**
   * Cost Tracking
   */
  async getCostTracking(params?: {
    startDate?: Date;
    endDate?: Date;
    periodType?: 'daily' | 'weekly' | 'monthly';
  }): Promise<CostTracking[]> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('start_date', params.startDate.toISOString());
    if (params?.endDate) queryParams.append('end_date', params.endDate.toISOString());
    if (params?.periodType) queryParams.append('period_type', params.periodType);

    const response = await apiClient.get<{ data: CostTracking[] }>(
      `${this.basePath}/cost-tracking?${queryParams.toString()}`
    );
    return response.data?.data || response.data || [];
  }

  /**
   * Pipeline Metrics
   */
  async getPipelineMetrics(params?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<PipelineMetrics[]> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('start_date', params.startDate.toISOString());
    if (params?.endDate) queryParams.append('end_date', params.endDate.toISOString());

    const response = await apiClient.get<{ data: PipelineMetrics[] }>(
      `${this.basePath}/pipeline-metrics?${queryParams.toString()}`
    );
    return response.data?.data || response.data || [];
  }

  /**
   * Alerts
   */
  async getAlerts(params?: {
    status?: string;
    severity?: string;
    componentId?: string;
  }): Promise<PaginatedResponse<Alert>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.componentId) queryParams.append('component_id', params.componentId);

    const response = await apiClient.get<PaginatedResponse<Alert>>(
      `${this.basePath}/alerts?${queryParams.toString()}`
    );
    return response.data || response;
  }

  async acknowledgeAlert(id: string): Promise<Alert> {
    const response = await apiClient.post<{ data: Alert }>(`${this.basePath}/alerts/${id}/acknowledge`);
    return response.data?.data || response.data;
  }

  async resolveAlert(id: string, notes: string): Promise<Alert> {
    const response = await apiClient.post<{ data: Alert }>(`${this.basePath}/alerts/${id}/resolve`, { notes });
    return response.data?.data || response.data;
  }

  /**
   * Incidents
   */
  async getIncidents(params?: {
    status?: string;
    severity?: string;
  }): Promise<PaginatedResponse<Incident>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.severity) queryParams.append('severity', params.severity);

    const response = await apiClient.get<PaginatedResponse<Incident>>(
      `${this.basePath}/incidents?${queryParams.toString()}`
    );
    return response.data || response;
  }

  /**
   * Dashboard Snapshot
   */
  async getDashboardSnapshot(): Promise<OperationsDashboardSnapshot> {
    const response = await apiClient.get<{ data: OperationsDashboardSnapshot }>(`${this.basePath}/dashboard/snapshot`);
    return response.data?.data || response.data;
  }
}

export const operationsApi = new OperationsApiService();

