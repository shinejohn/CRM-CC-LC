// ============================================
// INTELLIGENCE HUB CONTEXT
// Shared state for business profile + AI context
// ============================================

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { smbService } from '@/services/smbService';
import type { SMBFullProfile, SMBProfileSectionKey } from '@/types/smb';

interface IntelligenceHubState {
    profile: SMBFullProfile | null;
    aiContext: Record<string, unknown> | null;
    intelligenceSummary: string | null;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
    updateSection: (section: SMBProfileSectionKey, data: Record<string, unknown>) => Promise<void>;
    requestEnrichment: () => Promise<void>;
    isEnriching: boolean;
    isUpdating: boolean;
}

const IntelligenceHubContext = createContext<IntelligenceHubState | null>(null);

interface IntelligenceHubProviderProps {
    smbId: string;
    children: ReactNode;
}

export function IntelligenceHubProvider({ smbId, children }: IntelligenceHubProviderProps) {
    const queryClient = useQueryClient();

    const profileQuery = useQuery({
        queryKey: ['smb-full-profile', smbId],
        queryFn: () => smbService.getFullProfile(smbId),
        enabled: !!smbId,
        staleTime: 5 * 60 * 1000,
    });

    const aiContextQuery = useQuery({
        queryKey: ['smb-ai-context', smbId],
        queryFn: () => smbService.getAIContext(smbId),
        enabled: !!smbId,
        staleTime: 5 * 60 * 1000,
    });

    const summaryQuery = useQuery({
        queryKey: ['smb-intelligence-summary', smbId],
        queryFn: () => smbService.getIntelligenceSummary(smbId),
        enabled: !!smbId,
        staleTime: 5 * 60 * 1000,
    });

    const updateMutation = useMutation({
        mutationFn: ({ section, data }: { section: SMBProfileSectionKey; data: Record<string, unknown> }) =>
            smbService.updateSection(smbId, section, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['smb-full-profile', smbId] });
            queryClient.invalidateQueries({ queryKey: ['smb-ai-context', smbId] });
            queryClient.invalidateQueries({ queryKey: ['smb-intelligence-summary', smbId] });
        },
    });

    const enrichMutation = useMutation({
        mutationFn: () => smbService.requestEnrichment(smbId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['smb-full-profile', smbId] });
        },
    });

    const updateSection = useCallback(async (section: SMBProfileSectionKey, data: Record<string, unknown>) => {
        await updateMutation.mutateAsync({ section, data });
    }, [updateMutation]);

    const requestEnrichment = useCallback(async () => {
        await enrichMutation.mutateAsync();
    }, [enrichMutation]);

    const refetch = useCallback(() => {
        profileQuery.refetch();
        aiContextQuery.refetch();
        summaryQuery.refetch();
    }, [profileQuery, aiContextQuery, summaryQuery]);

    const value: IntelligenceHubState = {
        profile: profileQuery.data ?? null,
        aiContext: aiContextQuery.data ?? null,
        intelligenceSummary: summaryQuery.data ?? null,
        isLoading: profileQuery.isLoading || aiContextQuery.isLoading || summaryQuery.isLoading,
        isError: profileQuery.isError || aiContextQuery.isError || summaryQuery.isError,
        error: profileQuery.error ?? aiContextQuery.error ?? summaryQuery.error ?? null,
        refetch,
        updateSection,
        requestEnrichment,
        isEnriching: enrichMutation.isPending,
        isUpdating: updateMutation.isPending,
    };

    return (
        <IntelligenceHubContext.Provider value={value}>
            {children}
        </IntelligenceHubContext.Provider>
    );
}

export function useIntelligenceHub(): IntelligenceHubState {
    const ctx = useContext(IntelligenceHubContext);
    if (!ctx) {
        throw new Error('useIntelligenceHub must be used within an IntelligenceHubProvider');
    }
    return ctx;
}
