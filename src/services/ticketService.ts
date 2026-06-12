import { apiClient } from '@/services/api';
import type {
  Ticket,
  TicketNote,
  TicketFilters,
  TicketFormData,
  TicketUpdateData,
  ImplementationStage,
  MonitoringSignal,
  TicketReportingSummary,
} from '@/types/tickets';
import type { PaginatedResponse } from '@/types/common';

export const ticketService = {
  // ── Tickets ────────────────────────────────────────────────────────────────

  list: (filters?: TicketFilters) =>
    apiClient
      .get<PaginatedResponse<Ticket>>('/v1/tickets', { params: filters })
      .then((r) => r.data),

  get: (id: string) =>
    apiClient
      .get<Ticket>(`/v1/tickets/${id}`)
      .then((r) => r.data),

  create: (data: TicketFormData) =>
    apiClient
      .post<Ticket>('/v1/tickets', data)
      .then((r) => r.data),

  update: (id: string, data: TicketUpdateData) =>
    apiClient
      .patch<Ticket>(`/v1/tickets/${id}`, data)
      .then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete(`/v1/tickets/${id}`),

  addNote: (id: string, body: string, isInternal = true) =>
    apiClient
      .post<TicketNote>(`/v1/tickets/${id}/notes`, { body, is_internal: isInternal })
      .then((r) => r.data),

  bulkUpdate: (ids: string[], updates: Partial<TicketUpdateData>) =>
    apiClient
      .post<{ updated: number }>('/v1/tickets/bulk', { ids, ...updates })
      .then((r) => r.data),

  // ── Implementation stages ─────────────────────────────────────────────────

  getStages: (ticketId: string) =>
    apiClient
      .get<ImplementationStage[]>(`/v1/tickets/${ticketId}/stages`)
      .then((r) => r.data),

  updateStage: (ticketId: string, stageId: string, data: Partial<ImplementationStage>) =>
    apiClient
      .patch<ImplementationStage>(`/v1/tickets/${ticketId}/stages/${stageId}`, data)
      .then((r) => r.data),

  reorderStages: (ticketId: string, order: string[]) =>
    apiClient
      .post(`/v1/tickets/${ticketId}/stages/reorder`, { order })
      .then((r) => r.data),

  // ── Monitoring signals ────────────────────────────────────────────────────

  listSignals: (params?: Record<string, unknown>) =>
    apiClient
      .get<PaginatedResponse<MonitoringSignal>>('/v1/monitoring-signals', { params })
      .then((r) => r.data),

  promoteSignal: (id: string, data?: { subject?: string; priority?: string }) =>
    apiClient
      .post<Ticket>(`/v1/monitoring-signals/${id}/promote`, data ?? {})
      .then((r) => r.data),

  dismissSignal: (id: string) =>
    apiClient.post(`/v1/monitoring-signals/${id}/dismiss`),

  // ── Reporting ─────────────────────────────────────────────────────────────

  getReportingSummary: (since?: string) =>
    apiClient
      .get<TicketReportingSummary>('/v1/tickets/reporting/summary', { params: since ? { since } : {} })
      .then((r) => r.data),
};
