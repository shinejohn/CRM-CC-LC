// ============================================
// FIBONACCO OPERATIONS DATA MODELS
// TypeScript Interfaces for Operations AI & Dashboard
// ============================================

// ============================================
// METRIC COLLECTION TYPES
// ============================================

export interface MetricDefinition {
  id: string;
  metricKey: string;
  name: string;
  description?: string;
  category: 'financial' | 'infrastructure' | 'email' | 'growth' | 'system' | 'cost';
  subcategory?: string;
  dataType: 'number' | 'percentage' | 'currency' | 'duration' | 'count';
  unit?: string;
  decimalPlaces: number;
  aggregationMethod: 'sum' | 'avg' | 'min' | 'max' | 'last' | 'first' | 'count';
  rollupIntervals: string[];
  warningThreshold?: number;
  warningDirection?: 'above' | 'below';
  criticalThreshold?: number;
  criticalDirection?: 'above' | 'below';
  collectionMethod: 'realtime' | 'scheduled' | 'event_driven' | 'computed';
  collectionIntervalSeconds?: number;
  aiImportance: 'critical' | 'high' | 'normal' | 'low';
  aiContextNotes?: string;
  isActive: boolean;
}

export interface MetricSnapshot {
  id: string;
  metricId: string;
  dimensionKey?: string;
  dimensionValue?: string;
  value: number;
  recordedAt: Date;
  periodStart?: Date;
  periodEnd?: Date;
  granularity: 'point' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  metadata?: Record<string, unknown>;
}

export interface MetricAggregate {
  id: string;
  metricId: string;
  dimensionKey?: string;
  dimensionValue?: string;
  periodType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  periodStart: Date;
  periodEnd: Date;
  valueSum?: number;
  valueAvg?: number;
  valueMin?: number;
  valueMax?: number;
  valueCount?: number;
  valueFirst?: number;
  valueLast?: number;
  valueStddev?: number;
  valueP50?: number;
  valueP95?: number;
  valueP99?: number;
}

// ============================================
// AI CONTEXT & DECISION TYPES
// ============================================

export interface AISession {
  id: string;
  sessionType: 'scheduled_report' | 'alert_response' | 'user_query' | 'automated_check';
  triggerSource: string;
  contextMetrics?: Record<string, unknown>;
  contextAlerts?: Alert[];
  contextRecentActions?: ActionExecution[];
  userQuery?: string;
  modelUsed?: string;
  promptTokens?: number;
  completionTokens?: number;
  analysisSummary?: string;
  recommendations?: AIRecommendation[];
  actionsTaken?: ActionExecution[];
  reportGeneratedId?: string;
  status: 'processing' | 'completed' | 'failed' | 'cancelled';
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  createdBy: string;
}

export interface AIRecommendation {
  id: string;
  sessionId?: string;
  category: 'infrastructure' | 'financial' | 'growth' | 'cost_optimization' | 'risk_mitigation';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale?: string;
  supportingMetrics?: Record<string, unknown>;
  projectedImpact?: {
    metric: string;
    currentValue: number;
    projectedValue: number;
    timeframe: string;
  }[];
  confidenceScore?: number;
  suggestedActionType?: string;
  suggestedActionParams?: Record<string, unknown>;
  requiresApproval: boolean;
  autoExecuteAfter?: Date;
  status: 'pending' | 'approved' | 'rejected' | 'executed' | 'expired';
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  executedAt?: Date;
  executionResult?: Record<string, unknown>;
  validUntil?: Date;
}

export interface AIContextMemory {
  id: string;
  memoryType: 'fact' | 'pattern' | 'decision' | 'preference' | 'goal';
  category: string;
  key: string;
  content: string;
  structuredData?: Record<string, unknown>;
  importanceScore: number;
  accessCount: number;
  lastAccessedAt?: Date;
  sourceSessionId?: string;
  sourceType?: 'user_input' | 'ai_derived' | 'system_event';
  isActive: boolean;
  validFrom: Date;
  validUntil?: Date;
  version: number;
}

// ============================================
// INFRASTRUCTURE HEALTH TYPES
// ============================================

export interface InfrastructureComponent {
  id: string;
  componentKey: string;
  name: string;
  description?: string;
  componentType: 'server' | 'database' | 'cache' | 'queue' | 'email_ip' | 'service' | 'external_api';
  category: 'compute' | 'storage' | 'networking' | 'email' | 'third_party';
  environment: 'production' | 'staging' | 'development';
  host?: string;
  port?: number;
  healthCheckType?: 'http' | 'tcp' | 'ping' | 'custom';
  healthCheckEndpoint?: string;
  healthCheckIntervalSeconds: number;
  currentStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastStatusChange?: Date;
  dependsOn?: string[];
  isActive: boolean;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface HealthCheck {
  id: string;
  componentId: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'timeout' | 'error';
  responseTimeMs?: number;
  checkType?: string;
  endpointChecked?: string;
  responseCode?: number;
  errorMessage?: string;
  checkedFrom?: string;
  checkedAt: Date;
}

export interface EmailIPReputation {
  id: string;
  ipAddress: string;
  ipPool: 'marketing' | 'transactional' | 'newsletter' | 'alerts';
  provider: 'postal' | 'ses';
  reputationScore?: number;
  gmailReputation?: 'high' | 'medium' | 'low' | 'bad';
  microsoftReputation?: string;
  yahooReputation?: string;
  emailsSent24h: number;
  emailsSent7d: number;
  emailsSent30d: number;
  bounceRate24h?: number;
  bounceRate7d?: number;
  bounceRate30d?: number;
  complaintRate24h?: number;
  complaintRate7d?: number;
  complaintRate30d?: number;
  openRate24h?: number;
  openRate7d?: number;
  warmupStatus?: 'not_started' | 'warming' | 'warmed' | 'paused';
  warmupStartedAt?: Date;
  warmupTargetDailyVolume?: number;
  warmupCurrentDailyLimit?: number;
  warmupDayNumber?: number;
  isBlacklisted: boolean;
  blacklistSources?: string[];
  lastBlacklistCheck?: Date;
  isActive: boolean;
  status: 'active' | 'paused' | 'warming' | 'blacklisted' | 'retired';
}

export interface QueueMetrics {
  id: string;
  queueName: string;
  queueType: 'email' | 'sms' | 'phone' | 'job' | 'notification';
  priority?: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  currentDepth: number;
  depth24hAvg?: number;
  depth24hMax?: number;
  messagesIn1h?: number;
  messagesOut1h?: number;
  messagesFailed1h?: number;
  avgProcessingTimeMs?: number;
  p95ProcessingTimeMs?: number;
  p99ProcessingTimeMs?: number;
  oldestMessageAgeSeconds?: number;
  activeConsumers?: number;
  consumerUtilization?: number;
  status: 'healthy' | 'slow' | 'backing_up' | 'stalled';
  recordedAt: Date;
}

// ============================================
// FINANCIAL INTELLIGENCE TYPES
// ============================================

export interface RevenueSnapshot {
  id: string;
  snapshotDate: Date;
  snapshotType: 'daily' | 'weekly' | 'monthly';
  mrr: number;
  arr?: number;
  revenueB2B?: number;
  revenueB2C?: number;
  revenueAdvertising?: number;
  revenueEvents?: number;
  revenueServices?: number;
  revenueOther?: number;
  newMrr?: number;
  expansionMrr?: number;
  contractionMrr?: number;
  churnedMrr?: number;
  netNewMrr?: number;
  totalPayingCustomers?: number;
  newCustomers?: number;
  churnedCustomers?: number;
  netNewCustomers?: number;
  arpu?: number;
  ltv?: number;
  cac?: number;
  ltvCacRatio?: number;
  communitiesActive?: number;
  communitiesRevenueGenerating?: number;
  avgRevenuePerCommunity?: number;
}

export interface CostTracking {
  id: string;
  costDate: Date;
  periodType: 'daily' | 'weekly' | 'monthly';
  costAwsTotal?: number;
  costAwsEc2?: number;
  costAwsRds?: number;
  costAwsS3?: number;
  costAwsSes?: number;
  costEmailTotal?: number;
  costEmailPostalInfra?: number;
  costSmsTotal?: number;
  smsSent?: number;
  costVoiceTotal?: number;
  voiceMinutes?: number;
  costAiTotal?: number;
  costAiAnthropic?: number;
  aiTokensUsed?: number;
  costTotal: number;
  costPerCustomer?: number;
  costPerCommunity?: number;
  budgetAllocated?: number;
  budgetVariance?: number;
}

export interface PipelineMetrics {
  id: string;
  snapshotDate: Date;
  leadsTotal: number;
  leadsNewToday: number;
  prospectsTotal: number;
  prospectsInHookTrial: number;
  opportunitiesTotal: number;
  opportunitiesValue?: number;
  customersConvertingToday: number;
  customersTotal: number;
  leadToProspectRate?: number;
  prospectToOpportunityRate?: number;
  opportunityToCustomerRate?: number;
  overallConversionRate?: number;
  avgDaysLeadToCustomer?: number;
  avgDaysInHookTrial?: number;
  projectedConversions7d?: number;
  projectedMrr7d?: number;
  projectedConversions30d?: number;
  projectedMrr30d?: number;
}

// ============================================
// OPERATIONS ACTION TYPES
// ============================================

export interface ActionDefinition {
  id: string;
  actionKey: string;
  name: string;
  description?: string;
  category: 'infrastructure' | 'email' | 'campaign' | 'financial' | 'notification';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  handlerClass: string;
  defaultParams?: Record<string, unknown>;
  requiredParams?: string[];
  requiresApproval: boolean;
  autoApproveConditions?: Record<string, unknown>;
  maxExecutionsPerHour?: number;
  maxExecutionsPerDay?: number;
  cooldownSeconds?: number;
  prerequisiteChecks?: string[];
  isReversible: boolean;
  rollbackHandlerClass?: string;
  isActive: boolean;
}

export interface ActionExecution {
  id: string;
  actionId: string;
  recommendationId?: string;
  sessionId?: string;
  params: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  scheduledFor?: Date;
  startedAt?: Date;
  completedAt?: Date;
  durationMs?: number;
  result?: Record<string, unknown>;
  errorMessage?: string;
  errorDetails?: Record<string, unknown>;
  rolledBackAt?: Date;
  rollbackReason?: string;
  rollbackResult?: Record<string, unknown>;
  initiatedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
}

// ============================================
// ALERT & ESCALATION TYPES
// ============================================

export interface AlertRule {
  id: string;
  ruleKey: string;
  name: string;
  description?: string;
  category: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  metricId?: string;
  componentId?: string;
  conditionType: 'threshold' | 'anomaly' | 'absence' | 'rate_of_change';
  conditionOperator?: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq';
  conditionValue?: number;
  conditionWindowSeconds?: number;
  conditionQuery?: string;
  notificationChannels?: string[];
  notificationRecipients?: Record<string, unknown>;
  notificationTemplate?: string;
  evaluationIntervalSeconds: number;
  cooldownSeconds: number;
  autoActionId?: string;
  autoActionParams?: Record<string, unknown>;
  isActive: boolean;
  lastTriggeredAt?: Date;
}

export interface Alert {
  id: string;
  ruleId?: string;
  category: string;
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  title: string;
  description?: string;
  metricValue?: number;
  thresholdValue?: number;
  componentId?: string;
  contextData?: Record<string, unknown>;
  status: 'active' | 'acknowledged' | 'investigating' | 'resolved' | 'snoozed';
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
  snoozedUntil?: Date;
  snoozedBy?: string;
  snoozeReason?: string;
  escalationLevel: number;
  escalatedAt?: Date;
  relatedAlertIds?: string[];
  incidentId?: string;
}

export interface Incident {
  id: string;
  incidentNumber: number;
  title: string;
  description?: string;
  severity: 'minor' | 'major' | 'critical';
  category?: string;
  impactDescription?: string;
  affectedComponents?: string[];
  affectedCommunities?: number;
  affectedCustomers?: number;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';
  startedAt: Date;
  identifiedAt?: Date;
  resolvedAt?: Date;
  leadResponder?: string;
  responders?: string[];
  publicMessage?: string;
  internalNotes?: string;
  statusPageId?: string;
  postmortemUrl?: string;
  rootCause?: string;
  correctiveActions?: Record<string, unknown>;
}

// ============================================
// PROGRESS TRACKING TYPES
// ============================================

export interface DevelopmentMilestone {
  id: string;
  milestoneKey: string;
  name: string;
  description?: string;
  category: 'infrastructure' | 'feature' | 'integration' | 'optimization';
  module?: string;
  plannedStart?: Date;
  plannedEnd?: Date;
  actualStart?: Date;
  actualEnd?: Date;
  status: 'planned' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
  progressPercentage: number;
  dependsOn?: string[];
  blocks?: string[];
  owner?: string;
  team?: string[];
  requirements?: string;
  acceptanceCriteria?: Record<string, unknown>;
  blockers?: Record<string, unknown>;
  estimatedHours?: number;
  actualHours?: number;
}

export interface FeatureFlag {
  id: string;
  flagKey: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  targetCommunities?: string[];
  targetCustomerTiers?: string[];
  targetUsers?: string[];
  variants?: Record<string, unknown>;
  defaultVariant?: string;
  enabledAt?: Date;
  disabledAt?: Date;
  owner?: string;
  tags?: string[];
}

// ============================================
// DASHBOARD AGGREGATE TYPES
// ============================================

export interface OperationsDashboardSnapshot {
  // Timestamp
  asOf: Date;
  
  // Financial Health
  financial: {
    mrr: number;
    mrrChange30d: number;
    mrrChangePercent30d: number;
    arr: number;
    totalCustomers: number;
    netNewCustomers30d: number;
    churnRate30d: number;
    arpu: number;
  };
  
  // Infrastructure Health
  infrastructure: {
    overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    componentsHealthy: number;
    componentsDegraded: number;
    componentsUnhealthy: number;
    avgResponseTimeMs: number;
    errorRate1h: number;
  };
  
  // Email Deliverability
  email: {
    overallDeliverability: number;
    ipsActive: number;
    ipsWarming: number;
    ipsBlacklisted: number;
    bounceRate24h: number;
    complaintRate24h: number;
    emailsSent24h: number;
  };
  
  // Pipeline
  pipeline: {
    leadsTotal: number;
    prospectsInTrial: number;
    opportunitiesValue: number;
    projectedConversions30d: number;
    projectedMrr30d: number;
  };
  
  // System Operations
  system: {
    jobsProcessed24h: number;
    jobsFailed24h: number;
    queueDepthTotal: number;
    oldestQueueItemAge: number;
  };
  
  // Costs
  costs: {
    mtdTotal: number;
    mtdBudget: number;
    mtdVariance: number;
    projectedMonthEnd: number;
    costPerCustomer: number;
  };
  
  // Alerts
  alerts: {
    activeTotal: number;
    activeCritical: number;
    activeWarning: number;
    incidentsOpen: number;
  };
}

