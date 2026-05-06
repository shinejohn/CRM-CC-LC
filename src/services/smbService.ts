/**
 * SMB profile operations
 */

import type { AxiosResponse } from 'axios';
import { apiClient } from '@/services/api';
import type { SMBProfile, SMBFullProfile, SMBProfileSectionKey } from '../types/smb';
import type { ApiResponse } from '../types/common';

export const smbService = {
  getProfile: () =>
    apiClient.get<ApiResponse<SMBProfile>>('/smb/profile').then((r: AxiosResponse<ApiResponse<SMBProfile>>) => r.data.data),

  updateProfile: (data: Partial<SMBProfile>) =>
    apiClient.put<ApiResponse<SMBProfile>>('/smb/profile', data).then((r: AxiosResponse<ApiResponse<SMBProfile>>) => r.data.data),

  /** Intelligence Hub: full aggregated profile */
  getFullProfile: (id: string) =>
    apiClient.get<ApiResponse<SMBFullProfile>>(`/smb/${id}/full-profile`).then((r: AxiosResponse<ApiResponse<SMBFullProfile>>) => r.data.data),

  /** Intelligence Hub: AI-relevant fields for prompt injection */
  getAIContext: (id: string) =>
    apiClient.get<ApiResponse<Record<string, unknown>>>(`/smb/${id}/ai-context`).then((r: AxiosResponse<ApiResponse<Record<string, unknown>>>) => r.data.data),

  /** Intelligence Hub: condensed text summary for system prompt */
  getIntelligenceSummary: (id: string) =>
    apiClient.get<ApiResponse<{ summary: string }>>(`/smb/${id}/intelligence-summary`).then((r: AxiosResponse<ApiResponse<{ summary: string }>>) => r.data.data.summary),

  /** Intelligence Hub: update a single profile section */
  updateSection: (id: string, section: SMBProfileSectionKey, data: Record<string, unknown>) =>
    apiClient.patch<ApiResponse<unknown>>(`/smb/${id}/profile/${section}`, { data }).then((r: AxiosResponse<ApiResponse<unknown>>) => r.data.data),

  /** Intelligence Hub: trigger re-enrichment from Google Places, website scan, SerpAPI */
  requestEnrichment: (id: string) =>
    apiClient.post<ApiResponse<{ status: string; last_enriched_at?: string }>>(`/smb/${id}/enrich`).then((r: AxiosResponse<ApiResponse<{ status: string; last_enriched_at?: string }>>) => r.data.data),
};
