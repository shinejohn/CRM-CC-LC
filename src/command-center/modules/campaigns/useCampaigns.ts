// ============================================
// USE CAMPAIGNS HOOK - Command Center
// CC-FT-05: Campaigns Module
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api.service';
import { useWebSocket } from '../../hooks/useWebSocket';
import type {
  Campaign,
  CampaignStats,
  CampaignCreateData,
  CampaignUpdateData,
  CampaignTemplate,
  CampaignStatus,
  CampaignChannel,
} from './campaign.types';

interface UseCampaignsFilters {
  status?: CampaignStatus | null;
  channel?: CampaignChannel | null;
  search?: string;
}

interface UseCampaignsReturn {
  campaigns: Campaign[];
  templates: CampaignTemplate[];
  stats: CampaignStats;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createCampaign: (data: CampaignCreateData) => Promise<Campaign>;
  updateCampaign: (id: string, data: CampaignUpdateData) => Promise<Campaign>;
  deleteCampaign: (id: string) => Promise<void>;
  sendCampaign: (id: string) => Promise<void>;
  pauseCampaign: (id: string) => Promise<void>;
  resumeCampaign: (id: string) => Promise<void>;
  testCampaign: (id: string, recipients: string[]) => Promise<void>;
  getCampaignStats: (id: string) => Promise<any>;
  refreshCampaigns: () => Promise<void>;
}

export function useCampaigns(filters: UseCampaignsFilters = {}): UseCampaignsReturn {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [stats, setStats] = useState<CampaignStats>({
    active: 0,
    scheduled: 0,
    totalReach: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
    avgReplyRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WebSocket for real-time updates
  const { subscribe, unsubscribe } = useWebSocket();

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {};
      if (filters.status) params.status = filters.status;
      if (filters.channel) params.channel = filters.channel;
      if (filters.search) params.search = filters.search;

      const response = await apiService.get<Campaign[]>('/v1/campaigns', { params });
      if (response.success && response.data) {
        setCampaigns(response.data);
      } else {
        setError(response.error?.message || 'Failed to load campaigns');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await apiService.get<CampaignTemplate[]>('/v1/campaign-templates');
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiService.get<CampaignStats>('/v1/campaigns/stats');
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
    fetchStats();
  }, [fetchCampaigns, fetchTemplates, fetchStats]);

  // Real-time updates via WebSocket
  useEffect(() => {
    const handleCampaignEvent = (payload: any) => {
      switch (payload.type) {
        case 'CAMPAIGN_CREATED':
          setCampaigns(prev => [payload.campaign || payload, ...prev]);
          fetchStats();
          break;
        case 'CAMPAIGN_UPDATED':
          setCampaigns(prev =>
            prev.map(c => (c.id === (payload.id || payload.campaign?.id) ? (payload.campaign || payload) : c))
          );
          fetchStats();
          break;
        case 'CAMPAIGN_SENT':
          setCampaigns(prev =>
            prev.map(c =>
              c.id === payload.campaignId
                ? { ...c, status: 'active' as const, sent: (c.sent || 0) + payload.count }
                : c
            )
          );
          fetchStats();
          break;
        case 'CAMPAIGN_COMPLETED':
          setCampaigns(prev =>
            prev.map(c =>
              c.id === payload.campaignId
                ? { ...c, status: 'completed' as const, completedAt: payload.completedAt }
                : c
            )
          );
          fetchStats();
          break;
      }
    };

    const unsubscribeFn = subscribe('campaign.*', handleCampaignEvent);
    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, [subscribe, unsubscribe, fetchStats]);

  const createCampaign = useCallback(async (data: CampaignCreateData): Promise<Campaign> => {
    const response = await apiService.post<Campaign>('/v1/campaigns', data);
    if (response.success && response.data) {
      setCampaigns(prev => [response.data!, ...prev]);
      fetchStats();
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to create campaign');
  }, [fetchStats]);

  const updateCampaign = useCallback(async (
    id: string,
    data: CampaignUpdateData
  ): Promise<Campaign> => {
    const response = await apiService.put<Campaign>(`/v1/campaigns/${id}`, data);
    if (response.success && response.data) {
      setCampaigns(prev =>
        prev.map(c => (c.id === id ? response.data! : c))
      );
      fetchStats();
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to update campaign');
  }, [fetchStats]);

  const deleteCampaign = useCallback(async (id: string): Promise<void> => {
    const response = await apiService.delete(`/v1/campaigns/${id}`);
    if (response.success) {
      setCampaigns(prev => prev.filter(c => c.id !== id));
      fetchStats();
    } else {
      throw new Error(response.error?.message || 'Failed to delete campaign');
    }
  }, [fetchStats]);

  const sendCampaign = useCallback(async (id: string): Promise<void> => {
    const response = await apiService.post(`/v1/campaigns/${id}/send`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to send campaign');
    }
    await fetchCampaigns();
    await fetchStats();
  }, [fetchCampaigns, fetchStats]);

  const pauseCampaign = useCallback(async (id: string): Promise<void> => {
    await updateCampaign(id, { status: 'paused' });
  }, [updateCampaign]);

  const resumeCampaign = useCallback(async (id: string): Promise<void> => {
    await updateCampaign(id, { status: 'active' });
  }, [updateCampaign]);

  const testCampaign = useCallback(async (id: string, recipients: string[]): Promise<void> => {
    const response = await apiService.post(`/v1/campaigns/${id}/test`, { recipients });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to send test');
    }
  }, []);

  const getCampaignStats = useCallback(async (id: string): Promise<any> => {
    const response = await apiService.get(`/v1/campaigns/${id}/stats`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error?.message || 'Failed to load campaign stats');
  }, []);

  return {
    campaigns,
    templates,
    stats,
    isLoading,
    error,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    pauseCampaign,
    resumeCampaign,
    testCampaign,
    getCampaignStats,
    refreshCampaigns: fetchCampaigns,
  };
}

