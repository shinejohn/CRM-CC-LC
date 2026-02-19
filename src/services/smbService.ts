/**
 * SMB profile operations
 */

import api from './api';
import type { SMBProfile, SMBFullProfile, SMBProfileSectionKey } from '../types/smb';
import type { ApiResponse } from '../types/common';

export const smbService = {
  getProfile: () =>
    api.get<ApiResponse<SMBProfile>>('/smb/profile').then((r) => r.data.data),

  updateProfile: (data: Partial<SMBProfile>) =>
    api.put<ApiResponse<SMBProfile>>('/smb/profile', data).then((r) => r.data.data),

  /** Intelligence Hub: full aggregated profile */
  getFullProfile: (id: string) =>
    api.get<ApiResponse<SMBFullProfile>>(`/smb/${id}/full-profile`).then((r) => r.data.data),

  /** Intelligence Hub: AI-relevant fields for prompt injection */
  getAIContext: (id: string) =>
    api.get<ApiResponse<Record<string, unknown>>>(`/smb/${id}/ai-context`).then((r) => r.data.data),

  /** Intelligence Hub: condensed text summary for system prompt */
  getIntelligenceSummary: (id: string) =>
    api.get<ApiResponse<{ summary: string }>>(`/smb/${id}/intelligence-summary`).then((r) => r.data.data.summary),

  /** Intelligence Hub: update a single profile section */
  updateSection: (id: string, section: SMBProfileSectionKey, data: Record<string, unknown>) =>
    api.patch<ApiResponse<unknown>>(`/smb/${id}/profile/${section}`, { data }).then((r) => r.data.data),

  /** Intelligence Hub: trigger re-enrichment from Google Places, website scan, SerpAPI */
  requestEnrichment: (id: string) =>
    api.post<ApiResponse<{ status: string; last_enriched_at?: string }>>(`/smb/${id}/enrich`).then((r) => r.data.data),
};
