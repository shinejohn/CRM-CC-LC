// ============================================
// OPERATIONS API SERVICE
// ============================================

import { apiClient, type ApiError, type PaginatedResponse } from '../learning/api-client';
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
  PaginationParams,
  DateRangeParams,
} from '@/types/operations';

const BASE_PATH = '/api/v1/operations';

const serializeDate = (value?: Date): string | undefined => (value ? value.toISOString() : undefined);

const toDate = (value: unknown): Date => {
  if (value instanceof Date) {
    return value;
  }
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
};

const toOptionalDate = (value: unknown): Date | undefined => {
  if (!value) {
    return undefined;
  }
  const parsed = toDate(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const mapPaginated = <T>(response: PaginatedResponse<T>, mapper: (item: T) => T): PaginatedResponse<T> => ({
  ...response,
  data: response.data.map(mapper),
});

const withPagination = (params?: PaginationParams): { page?: number; per_page?: number } => ({
  page: params?.page,
  per_page: params?.perPage,
});

const handleApiError = (error: unknown, context: string): never => {
  if ((error as ApiError)?.message) {
    console.error(`Operations API error (${context}):`, error);
    throw error;
  }
  console.error(`Operations API error (${context}):`, error);
  throw new Error(`Operations API request failed: ${context}`);
};

const parseMetricSnapshot = (item: MetricSnapshot): MetricSnapshot => ({
  ...item,
  recordedAt: toDate(item.recordedAt),
  periodStart: toOptionalDate(item.periodStart),
  periodEnd: toOptionalDate(item.periodEnd),
});

const parseMetricAggregate = (item: MetricAggregate): MetricAggregate => ({
  ...item,
  periodStart: toDate(item.periodStart),
  periodEnd: toDate(item.periodEnd),
});

const parseAIRecommendation = (item: AIRecommendation): AIRecommendation => ({
  ...item,
  autoExecuteAfter: toOptionalDate(item.autoExecuteAfter),
  reviewedAt: toOptionalDate(item.reviewedAt),
  executedAt: toOptionalDate(item.executedAt),
  validUntil: toOptionalDate(item.validUntil),
});

const parseActionExecution = (item: ActionExecution): ActionExecution => ({
  ...item,
  scheduledFor: toOptionalDate(item.scheduledFor),
  startedAt: toOptionalDate(item.startedAt),
  completedAt: toOptionalDate(item.completedAt),
  rolledBackAt: toOptionalDate(item.rolledBackAt),
  approvedAt: toOptionalDate(item.approvedAt),
});

const parseAlert = (item: Alert): Alert => ({
  ...item,
  triggeredAt: toDate(item.triggeredAt),
  acknowledgedAt: toOptionalDate(item.acknowledgedAt),
  resolvedAt: toOptionalDate(item.resolvedAt),
  snoozedUntil: toOptionalDate(item.snoozedUntil),
  escalatedAt: toOptionalDate(item.escalatedAt),
});

const parseAISession = (item: AISession): AISession => ({
  ...item,
  startedAt: toDate(item.startedAt),
  completedAt: toOptionalDate(item.completedAt),
  contextAlerts: item.contextAlerts?.map(parseAlert),
  actionsTaken: item.actionsTaken?.map(parseActionExecution),
  contextRecentActions: item.contextRecentActions?.map(parseActionExecution),
  recommendations: item.recommendations?.map(parseAIRecommendation),
});

const parseAIContextMemory = (item: AIContextMemory): AIContextMemory => ({
  ...item,
  lastAccessedAt: toOptionalDate(item.lastAccessedAt),
  validFrom: toDate(item.validFrom),
  validUntil: toOptionalDate(item.validUntil),
});

const parseInfrastructureComponent = (item: InfrastructureComponent): InfrastructureComponent => ({
  ...item,
  lastStatusChange: toOptionalDate(item.lastStatusChange),
});

const parseHealthCheck = (item: HealthCheck): HealthCheck => ({
  ...item,
  checkedAt: toDate(item.checkedAt),
});

const parseEmailIPReputation = (item: EmailIPReputation): EmailIPReputation => ({
  ...item,
  warmupStartedAt: toOptionalDate(item.warmupStartedAt),
  lastBlacklistCheck: toOptionalDate(item.lastBlacklistCheck),
});

const parseQueueMetrics = (item: QueueMetrics): QueueMetrics => ({
  ...item,
  recordedAt: toDate(item.recordedAt),
});

const parseRevenueSnapshot = (item: RevenueSnapshot): RevenueSnapshot => ({
  ...item,
  snapshotDate: toDate(item.snapshotDate),
});

const parseCostTracking = (item: CostTracking): CostTracking => ({
  ...item,
  costDate: toDate(item.costDate),
});

const parsePipelineMetrics = (item: PipelineMetrics): PipelineMetrics => ({
  ...item,
  snapshotDate: toDate(item.snapshotDate),
});

const parseAlertRule = (item: AlertRule): AlertRule => ({
  ...item,
  lastTriggeredAt: toOptionalDate(item.lastTriggeredAt),
});

const parseIncident = (item: Incident): Incident => ({
  ...item,
  startedAt: toDate(item.startedAt),
  identifiedAt: toOptionalDate(item.identifiedAt),
  resolvedAt: toOptionalDate(item.resolvedAt),
});

const parseDevelopmentMilestone = (item: DevelopmentMilestone): DevelopmentMilestone => ({
  ...item,
  plannedStart: toOptionalDate(item.plannedStart),
  plannedEnd: toOptionalDate(item.plannedEnd),
  actualStart: toOptionalDate(item.actualStart),
  actualEnd: toOptionalDate(item.actualEnd),
});

const parseFeatureFlag = (item: FeatureFlag): FeatureFlag => ({
  ...item,
  enabledAt: toOptionalDate(item.enabledAt),
  disabledAt: toOptionalDate(item.disabledAt),
});

const parseOperationsDashboardSnapshot = (
  item: OperationsDashboardSnapshot
): OperationsDashboardSnapshot => ({
  ...item,
  asOf: toDate(item.asOf),
});

class OperationsApiService {
  /**
   * Metric Definitions
   */
  async getMetricDefinitions(params?: {
    category?: MetricDefinition['category'];
    isActive?: boolean;
    search?: string;
  } & PaginationParams): Promise<PaginatedResponse<MetricDefinition>> {
    try {
      return await apiClient.get(`${BASE_PATH}/metric-definitions`, {
        params: {
          category: params?.category,
          is_active: params?.isActive,
          search: params?.search,
          ...withPagination(params),
        },
      });
    } catch (error) {
      handleApiError(error, 'getMetricDefinitions');
    }
  }

  async getMetricDefinition(id: string): Promise<MetricDefinition> {
    try {
      const response = await apiClient.get<{ data: MetricDefinition }>(`${BASE_PATH}/metric-definitions/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, 'getMetricDefinition');
    }
  }

  /**
   * Metric Snapshots
   */
  async getMetricSnapshots(params?: {
    metricId?: string;
    dimensionKey?: string;
    dimensionValue?: string;
    granularity?: MetricSnapshot['granularity'];
  } & DateRangeParams & PaginationParams): Promise<PaginatedResponse<MetricSnapshot>> {
    try {
      const response = await apiClient.get<PaginatedResponse<MetricSnapshot>>(`${BASE_PATH}/metric-snapshots`, {
        params: {
          metric_id: params?.metricId,
          dimension_key: params?.dimensionKey,
          dimension_value: params?.dimensionValue,
          granularity: params?.granularity,
          start_date: serializeDate(params?.startDate),
          end_date: serializeDate(params?.endDate),
          ...withPagination(params),
        },
      });
      return mapPaginated(response, parseMetricSnapshot);
    } catch (error) {
      handleApiError(error, 'getMetricSnapshots');
    }
  }

  /**
   * Metric Aggregates
   */
  async getMetricAggregates(params: {
    metricId: string;
    periodType: MetricAggregate['periodType'];
    startDate: Date;
    endDate: Date;
  } & PaginationParams): Promise<PaginatedResponse<MetricAggregate>> {
    try {
      const response = await apiClient.get<PaginatedResponse<MetricAggregate>>(`${BASE_PATH}/metric-aggregates`, {
        params: {
          metric_id: params.metricId,
          period_type: params.periodType,
          start_date: serializeDate(params.startDate),
          end_date: serializeDate(params.endDate),
          ...withPagination(params),
        },
      });
      return mapPaginated(response, parseMetricAggregate);
    } catch (error) {
      handleApiError(error, 'getMetricAggregates');
    }
  }

  /**
   * AI Sessions
   */
  async getAISessions(params?: {
    sessionType?: AISession['sessionType'];
    status?: AISession['status'];
    createdBy?: string;
  } & PaginationParams): Promise<PaginatedResponse<AISession>> {
    try {
      const response = await apiClient.get<PaginatedResponse<AISession>>(`${BASE_PATH}/ai-sessions`, {
        params: {
          session_type: params?.sessionType,
          status: params?.status,
          created_by: params?.createdBy,
          ...withPagination(params),
        },
      });
      return mapPaginated(response, parseAISession);
    } catch (error) {
      handleApiError(error, 'getAISessions');
    }
  }

  async getAISession(id: string): Promise<AISession> {
    try {
      const response = await apiClient.get<{ data: AISession }>(`${BASE_PATH}/ai-sessions/${id}`);
      return parseAISession(response.data);
    } catch (error) {
      handleApiError(error, 'getAISession');
    }
  }

  async createAISession(payload: Partial<AISession>): Promise<AISession> {
    try {
      const response = await apiClient.post<{ data: AISession }>(`${BASE_PATH}/ai-sessions`, payload);
      return parseAISession(response.data);
    } catch (error) {
      handleApiError(error, 'createAISession');
    }
  }

  /**
   * AI Recommendations
   */
  async getAIRecommendations(params?: {
    status?: AIRecommendation['status'];
    priority?: AIRecommendation['priority'];
    category?: AIRecommendation['category'];
  } & PaginationParams): Promise<PaginatedResponse<AIRecommendation>> {
    try {
      const response = await apiClient.get<PaginatedResponse<AIRecommendation>>(`${BASE_PATH}/ai-recommendations`, {
        params: {
          status: params?.status,
          priority: params?.priority,
          category: params?.category,
          ...withPagination(params),
        },
      });
      return mapPaginated(response, parseAIRecommendation);
    } catch (error) {
      handleApiError(error, 'getAIRecommendations');
    }
  }

  async getAIRecommendation(id: string): Promise<AIRecommendation> {
    try {
      const response = await apiClient.get<{ data: AIRecommendation }>(`${BASE_PATH}/ai-recommendations/${id}`);
      return parseAIRecommendation(response.data);
    } catch (error) {
      handleApiError(error, 'getAIRecommendation');
    }
  }

  async approveAIRecommendation(id: string, notes?: string): Promise<AIRecommendation> {
    try {
      const response = await apiClient.post<{ data: AIRecommendation }>(
        `${BASE_PATH}/ai-recommendations/${id}/approve`,
        { notes }
      );
      return parseAIRecommendation(response.data);
    } catch (error) {
      handleApiError(error, 'approveAIRecommendation');
    }
  }

  async rejectAIRecommendation(id: string, notes: string): Promise<AIRecommendation> {
    try {
      const response = await apiClient.post<{ data: AIRecommendation }>(
        `${BASE_PATH}/ai-recommendations/${id}/reject`,
        { notes }
      );
      return parseAIRecommendation(response.data);
    } catch (error) {
      handleApiError(error, 'rejectAIRecommendation');
    }
  }

  /**
   * AI Context Memory
   */
  async getAIContextMemory(params?: {
    memoryType?: AIContextMemory['memoryType'];
    category?: string;
    isActive?: boolean;
    key?: string;
  } & PaginationParams): Promise<PaginatedResponse<AIContextMemory>> {
    try {
      const response = await apiClient.get<PaginatedResponse<AIContextMemory>>(`${BASE_PATH}/ai-context-memory`, {
        params: {
          memory_type: params?.memoryType,
          category: params?.category,
          is_active: params?.isActive,
          key: params?.key,
          ...withPagination(params),
        },
      });
      return mapPaginated(response, parseAIContextMemory);
    } catch (error) {
      handleApiError(error, 'getAIContextMemory');
    }
  }

  /**
   * Infrastructure Components
   */
  async getInfrastructureComponents(params?: {
    componentType?: InfrastructureComponent['componentType'];
    category?: InfrastructureComponent['category'];
    environment?: InfrastructureComponent['environment'];
    status?: InfrastructureComponent['currentStatus'];
  } & PaginationParams): Promise<PaginatedResponse<InfrastructureComponent>> {
    try {
      const response = await apiClient.get<PaginatedResponse<InfrastructureComponent>>(
        `${BASE_PATH}/infrastructure-components`,
        {
          params: {
            component_type: params?.componentType,
            category: params?.category,
            environment: params?.environment,
            status: params?.status,
            ...withPagination(params),
          },
        }
      );
      return mapPaginated(response, parseInfrastructureComponent);
    } catch (error) {
      handleApiError(error, 'getInfrastructureComponents');
    }
  }

  async getInfrastructureComponent(id: string): Promise<InfrastructureComponent> {
    try {
      const response = await apiClient.get<{ data: InfrastructureComponent }>(
        `${BASE_PATH}/infrastructure-components/${id}`
      );
      return parseInfrastructureComponent(response.data);
    } catch (error) {
      handleApiError(error, 'getInfrastructureComponent');
    }
  }

  /**
   * Health Checks
   */
  async getHealthChecks(params?: {
    componentId?: string;
    status?: HealthCheck['status'];
  } & DateRangeParams & PaginationParams): Promise<PaginatedResponse<HealthCheck>> {
    try {
      const response = await apiClient.get<PaginatedResponse<HealthCheck>>(`${BASE_PATH}/health-checks`, {
        params: {
          component_id: params?.componentId,
          status: params?.status,
          start_date: serializeDate(params?.startDate),
          end_date: serializeDate(params?.endDate),
          ...withPagination(params),
        },
      });
      return mapPaginated(response, parseHealthCheck);
    } catch (error) {
      handleApiError(error, 'getHealthChecks');
    }
  }

  /**
   * Email IP Reputation
   */
  async getEmailIPReputation(params?: {
    ipPool?: EmailIPReputation['ipPool'];
    status?: EmailIPReputation['status'];
    provider?: EmailIPReputation['provider'];
  } & PaginationParams): Promise<PaginatedResponse<EmailIPReputation>> {
    try {
      const response = await apiClient.get<PaginatedResponse<EmailIPReputation>>(`${BASE_PATH}/email-ip-reputation`, {
        params: {
          ip_pool: params?.ipPool,
          status: params?.status,
          provider: params?.provider,
          ...withPagination(params),
        },
      });
      return mapPaginated(response, parseEmailIPReputation);
    } catch (error) {
      handleApiError(error, 'getEmailIPReputation');
    }
  }

  /**
   * Queue Metrics
   */
  async getQueueMetrics(params?: {
    queueName?: string;
    queueType?: QueueMetrics['queueType'];
    status?: QueueMetrics['status'];
  } & PaginationParams): Promise<PaginatedResponse<QueueMetrics>> {
    try {
      const response = await apiClient.get<PaginatedResponse<QueueMetrics>>(`${BASE_PATH}/queue-metrics`, {
        params: {
          queue_name: params?.queueName,
          queue_type: params?.queueType,
          status: params?.status,
          ...withPagination(params),
        },
      });
      return mapPaginated(response, parseQueueMetrics);
    } catch (error) {
      handleApiError(error, 'getQueueMetrics');
    }
  }

  /**
   * Revenue Snapshots
   */
  async getRevenueSnapshots(params?: {
    snapshotType?: RevenueSnapshot['snapshotType'];
  } & DateRangeParams & PaginationParams): Promise<PaginatedResponse<RevenueSnapshot>> {
    try {
      const response = await apiClient.get<PaginatedResponse<RevenueSnapshot>>(`${BASE_PATH}/revenue-snapshots`, {
        params: {
          snapshot_type: params?.snapshotType,
          start_date: serializeDate(params?.startDate),
          end_date: serializeDate(params?.endDate),
          ...withPagination(params),
        },
      });
      return mapPaginated(response, parseRevenueSnapshot);
    } catch (error) {
      handleApiError(error, 'getRevenueSnapshots');
    }
  }

  /**
   * Cost Tracking
   */
  async getCostTracking(params?: {
    periodType?: CostTracking['periodType'];
  } & DateRangeParams & PaginationParams): Promise<PaginatedResponse<CostTracking>> {
    try {
      const response = await apiClient.get<PaginatedResponse<CostTracking>>(`${BASE_PATH}/cost-tracking`, {
        params: {
          period_type: params?.periodType,
          start_date: serializeDate(params?.startDate),
          end_date: serializeDate(params?.endDate),
          ...withPagination(params),
        },
      });
      return mapPaginated(response, parseCostTracking);
    } catch (error) {
      handleApiError(error, 'getCostTracking');
    }
  }

  /**
   * Pipeline Metrics
   */
  async getPipelineMetrics(params?: DateRangeParams & PaginationParams): Promise<PaginatedResponse<PipelineMetrics>> {
    try {
      const response = await apiClient.get<PaginatedResponse<PipelineMetrics>>(`${BASE_PATH}/pipeline-metrics`, {
        params: {
          start_date: serializeDate(params?.startDate),
          end_date: serializeDate(params?.endDate),
          ...withPagination(params),
        },
      });
      return mapPaginated(response, parsePipelineMetrics);
    } catch (error) {
      handleApiError(error, 'getPipelineMetrics');
    }
  }

  /**
   * Action Definitions & Executions
   */
  async getActionDefinitions(params?: {
    category?: ActionDefinition['category'];
    riskLevel?: ActionDefinition['riskLevel'];
    isActive?: boolean;
  } & PaginationParams): Promise<PaginatedResponse<ActionDefinition>> {
    try {
      return await apiClient.get(`${BASE_PATH}/action-definitions`, {
        params: {
          category: params?.category,
          risk_level: params?.riskLevel,
          is_active: params?.isActive,
          ...withPagination(params),
        },
      });
    } catch (error) {
      handleApiError(error, 'getActionDefinitions');
    }
  }

  async getActionExecutions(params?: {
    status?: ActionExecution['status'];
    actionId?: string;
    recommendationId?: string;
    sessionId?: string;
  } & PaginationParams): Promise<PaginatedResponse<ActionExecution>> {
    try {
      const response = await apiClient.get<PaginatedResponse<ActionExecution>>(`${BASE_PATH}/action-executions`, {
        params: {
          status: params?.status,
          action_id: params?.actionId,
          recommendation_id: params?.recommendationId,
          session_id: params?.sessionId,
          ...withPagination(params),
        },
      });
      return mapPaginated(response, parseActionExecution);
    } catch (error) {
      handleApiError(error, 'getActionExecutions');
    }
  }

  /**
   * Alert Rules
   */
  async getAlertRules(params?: {
    category?: string;
    severity?: AlertRule['severity'];
    isActive?: boolean;
  } & PaginationParams): Promise<PaginatedResponse<AlertRule>> {
    try {
      const response = await apiClient.get<PaginatedResponse<AlertRule>>(`${BASE_PATH}/alert-rules`, {
        params: {
          category: params?.category,
          severity: params?.severity,
          is_active: params?.isActive,
          ...withPagination(params),
        },
      });
      return mapPaginated(response, parseAlertRule);
    } catch (error) {
      handleApiError(error, 'getAlertRules');
    }
  }

  /**
   * Alerts
   */
  async getAlerts(params?: {
    status?: Alert['status'];
    severity?: Alert['severity'];
    componentId?: string;
  } & PaginationParams): Promise<PaginatedResponse<Alert>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Alert>>(`${BASE_PATH}/alerts`, {
        params: {
          status: params?.status,
          severity: params?.severity,
          component_id: params?.componentId,
          ...withPagination(params),
        },
      });
      return mapPaginated(response, parseAlert);
    } catch (error) {
      handleApiError(error, 'getAlerts');
    }
  }

  async acknowledgeAlert(id: string): Promise<Alert> {
    try {
      const response = await apiClient.post<{ data: Alert }>(`${BASE_PATH}/alerts/${id}/acknowledge`);
      return parseAlert(response.data);
    } catch (error) {
      handleApiError(error, 'acknowledgeAlert');
    }
  }

  async resolveAlert(id: string, notes: string): Promise<Alert> {
    try {
      const response = await apiClient.post<{ data: Alert }>(`${BASE_PATH}/alerts/${id}/resolve`, { notes });
      return parseAlert(response.data);
    } catch (error) {
      handleApiError(error, 'resolveAlert');
    }
  }

  /**
   * Incidents
   */
  async getIncidents(params?: {
    status?: Incident['status'];
    severity?: Incident['severity'];
  } & PaginationParams): Promise<PaginatedResponse<Incident>> {
    try {
      const response = await apiClient.get<PaginatedResponse<Incident>>(`${BASE_PATH}/incidents`, {
        params: {
          status: params?.status,
          severity: params?.severity,
          ...withPagination(params),
        },
      });
      return mapPaginated(response, parseIncident);
    } catch (error) {
      handleApiError(error, 'getIncidents');
    }
  }

  /**
   * Development Milestones
   */
  async getDevelopmentMilestones(params?: {
    status?: DevelopmentMilestone['status'];
    category?: DevelopmentMilestone['category'];
    module?: string;
  } & PaginationParams): Promise<PaginatedResponse<DevelopmentMilestone>> {
    try {
      const response = await apiClient.get<PaginatedResponse<DevelopmentMilestone>>(
        `${BASE_PATH}/development-milestones`,
        {
          params: {
            status: params?.status,
            category: params?.category,
            module: params?.module,
            ...withPagination(params),
          },
        }
      );
      return mapPaginated(response, parseDevelopmentMilestone);
    } catch (error) {
      handleApiError(error, 'getDevelopmentMilestones');
    }
  }

  /**
   * Feature Flags
   */
  async getFeatureFlags(params?: {
    isEnabled?: boolean;
    tag?: string;
  } & PaginationParams): Promise<PaginatedResponse<FeatureFlag>> {
    try {
      const response = await apiClient.get<PaginatedResponse<FeatureFlag>>(`${BASE_PATH}/feature-flags`, {
        params: {
          is_enabled: params?.isEnabled,
          tag: params?.tag,
          ...withPagination(params),
        },
      });
      return mapPaginated(response, parseFeatureFlag);
    } catch (error) {
      handleApiError(error, 'getFeatureFlags');
    }
  }

  /**
   * Dashboard Snapshot
   */
  async getDashboardSnapshot(): Promise<OperationsDashboardSnapshot> {
    try {
      const response = await apiClient.get<{ data: OperationsDashboardSnapshot }>(`${BASE_PATH}/dashboard/snapshot`);
      return parseOperationsDashboardSnapshot(response.data);
    } catch (error) {
      handleApiError(error, 'getDashboardSnapshot');
    }
  }
}

export const operationsApi = new OperationsApiService();

