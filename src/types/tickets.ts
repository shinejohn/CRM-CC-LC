export type TicketType = 'support' | 'implementation' | 'sales';
export type TicketStatus =
  | 'new'
  | 'open'
  | 'pending'
  | 'in_progress'
  | 'escalated'
  | 'resolved'
  | 'closed'
  | 'cancelled';
export type TicketPriority = 'low' | 'normal' | 'high' | 'critical';
export type TicketSource = 'email' | 'social_monitor' | 'manual' | 'reader_form' | 'internal';
export type StageStatus = 'pending' | 'in_progress' | 'complete' | 'blocked';

export interface SlaPolicy {
  id: string;
  name: string;
  ticket_type: TicketType;
  priority: TicketPriority;
  first_response_hrs: number;
  resolution_hrs: number;
  applies_to_plan: string | null;
}

export interface TicketClient {
  id: string;
  business_name: string;
  primary_email?: string;
  primary_phone?: string;
  subscription_tier?: string;
}

export interface TicketContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface TicketNote {
  id: string;
  ticket_id: string;
  author_id: string | null;
  body: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  filename: string;
  url: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface TicketStatusChange {
  id: string;
  ticket_id: string;
  from_status: TicketStatus | null;
  to_status: TicketStatus;
  changed_by: string | null;
  changed_at: string;
  reason: string | null;
}

export interface ImplementationStage {
  id: string;
  ticket_id: string;
  stage_name: string;
  stage_order: number;
  status: StageStatus;
  assigned_to: string | null;
  due_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  subject: string;
  description: string | null;
  client_id: string | null;
  contact_id: string | null;
  community_id: string | null;
  channel: string | null;
  app: string | null;
  source: TicketSource;
  assigned_to: string | null;
  created_by: string | null;
  external_ref: string | null;
  tags: string[];
  sla_policy_id: string | null;
  due_at: string | null;
  first_responded_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  // Relations (loaded on detail view)
  client?: TicketClient;
  contact?: TicketContact;
  community?: { id: string; name: string; state?: string };
  sla_policy?: SlaPolicy;
  notes?: TicketNote[];
  attachments?: TicketAttachment[];
  status_history?: TicketStatusChange[];
  implementation_stages?: ImplementationStage[];
}

export interface TicketFilters {
  type?: TicketType;
  status?: TicketStatus | TicketStatus[];
  priority?: TicketPriority;
  app?: string;
  assigned_to?: string;
  community_id?: string;
  client_id?: string;
  search?: string;
  overdue?: boolean;
  view?: 'my_open' | 'unassigned' | 'escalated' | 'due_today' | 'all_open';
  sort?: 'created_at' | 'updated_at' | 'due_at' | 'priority';
  direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface TicketFormData {
  type: TicketType;
  subject: string;
  description?: string;
  priority?: TicketPriority;
  client_id?: string;
  contact_id?: string;
  community_id?: string;
  channel?: string;
  app?: string;
  source?: TicketSource;
  assigned_to?: string;
  external_ref?: string;
  tags?: string[];
}

export interface TicketUpdateData {
  status?: TicketStatus;
  priority?: TicketPriority;
  subject?: string;
  description?: string;
  assigned_to?: string | null;
  community_id?: string | null;
  channel?: string | null;
  app?: string | null;
  tags?: string[];
  due_at?: string | null;
  status_reason?: string;
}

export interface MonitoringSignal {
  id: string;
  source_platform: string;
  community_id: string | null;
  raw_content: string;
  signal_type: 'complaint' | 'bug_report' | 'content_error' | 'positive' | 'spam' | 'other';
  url: string | null;
  detected_at: string;
  ticket_id: string | null;
  auto_created: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  community?: { id: string; name: string };
}

export interface TicketReportingSummary {
  since: string;
  by_type: Record<string, { type: string; count: number }>;
  by_status: Record<string, { status: string; count: number }>;
  by_priority: Record<string, { priority: string; count: number }>;
  avg_resolution_hours: Record<string, { type: string; avg_hours: number }>;
  sla_compliance_rate: number | null;
  sla_total: number;
  sla_met: number;
  implementation_by_stage: Array<{ stage_name: string; count: number }>;
  top_clients_by_volume: Array<{ client_id: string; ticket_count: number; client?: TicketClient }>;
  signals_by_platform: Record<string, { source_platform: string; count: number }>;
}
