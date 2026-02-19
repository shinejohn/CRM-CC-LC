// ============================================
// OPS DASHBOARD (POD) TYPES
// Re-exports and extends operations types for the POD UI
// ============================================

export type {
  OperationsDashboardSnapshot,
  MetricDefinition,
  MetricSnapshot,
  MetricAggregate,
  Alert,
  AlertRule,
  Incident,
  CostTracking,
  RevenueSnapshot,
  InfrastructureComponent,
  QueueMetrics,
  ActionExecution,
  AISession,
  AIRecommendation,
} from './operations';

export type { PaginatedResponse, PaginationParams, DateRangeParams } from './operations';

// FOA Chat specific types
export interface FOAMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actionSuggestions?: FOAActionSuggestion[];
}

export interface FOAActionSuggestion {
  id: string;
  title: string;
  description: string;
  actionType: string;
  params?: Record<string, unknown>;
}

export interface FOAChatRequest {
  message: string;
  sessionId?: string;
}

export interface FOAChatResponse {
  content: string;
  sessionId: string;
  actionSuggestions?: FOAActionSuggestion[];
}
