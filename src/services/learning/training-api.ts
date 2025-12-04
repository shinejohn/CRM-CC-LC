// ============================================
// AI TRAINING API SERVICE
// ============================================

import { apiClient } from './api-client';
import type {
  TrainingDataset,
  ValidationQueueItem,
  AgentKnowledgeConfig,
} from '@/types/learning';

export const trainingApi = {
  // Datasets
  getDatasets: async (): Promise<TrainingDataset[]> => {
    return apiClient.get<TrainingDataset[]>('/learning/training/datasets');
  },

  createDataset: async (data: Partial<TrainingDataset>): Promise<TrainingDataset> => {
    return apiClient.post<TrainingDataset>('/learning/training/datasets', data);
  },

  updateDataset: async (id: string, data: Partial<TrainingDataset>): Promise<TrainingDataset> => {
    return apiClient.put<TrainingDataset>(`/learning/training/datasets/${id}`, data);
  },

  deleteDataset: async (id: string): Promise<void> => {
    return apiClient.delete(`/learning/training/datasets/${id}`);
  },

  trainDataset: async (id: string): Promise<void> => {
    return apiClient.post(`/learning/training/datasets/${id}/train`);
  },

  // Validation Queue
  getValidationQueue: async (filters?: {
    priority?: string;
    type?: string;
  }): Promise<ValidationQueueItem[]> => {
    const params = new URLSearchParams();
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.type) params.append('type', filters.type);
    const url = `/learning/training/validation/queue${params.toString() ? `?${params}` : ''}`;
    return apiClient.get<ValidationQueueItem[]>(url);
  },

  approveValidation: async (id: string, source: string): Promise<void> => {
    return apiClient.post(`/learning/validation/${id}/approve`, { source });
  },

  rejectValidation: async (id: string): Promise<void> => {
    return apiClient.post(`/learning/validation/${id}/reject`);
  },

  mergeValidation: async (id: string, mergedData: Record<string, unknown>): Promise<void> => {
    return apiClient.post(`/learning/validation/${id}/merge`, mergedData);
  },

  // Agent Knowledge Config
  getAgentConfig: async (agentId: string): Promise<AgentKnowledgeConfig> => {
    return apiClient.get<AgentKnowledgeConfig>(`/learning/agents/${agentId}/knowledge-config`);
  },

  updateAgentConfig: async (
    agentId: string,
    config: Partial<AgentKnowledgeConfig>
  ): Promise<AgentKnowledgeConfig> => {
    return apiClient.put<AgentKnowledgeConfig>(
      `/learning/agents/${agentId}/knowledge-config`,
      config
    );
  },

  testAgentQuery: async (agentId: string, query: string): Promise<{
    results: Array<{ id: string; title: string; score: number; would_use: boolean }>;
  }> => {
    return apiClient.post(`/learning/agents/${agentId}/test-query`, { query });
  },
};


