// ============================================
// USE BUSINESS INTELLIGENCE CONTEXT
// Auto-injects Intelligence Hub data into AI calls
// Spec item #6: all AI components pass full profile
// ============================================

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { smbService } from '@/services/smbService';
import type { ChatContext } from '../services/ai.types';
import type { SMBFullProfile } from '@/types/smb';

interface UseBusinessIntelligenceOptions {
    /** The SMB ID to load data for. If omitted, reads from localStorage or URL params */
    smbId?: string;
    /** If true, skip loading (e.g. when no business is selected) */
    skip?: boolean;
}

interface UseBusinessIntelligenceReturn {
    /** ChatContext with Intelligence Hub data pre-filled */
    enrichedContext: ChatContext;
    /** The full profile data, if loaded */
    profile: SMBFullProfile | null;
    /** Loading state */
    isLoading: boolean;
    /** Merge extra context fields with intelligence hub data */
    mergeContext: (extra: Partial<ChatContext>) => ChatContext;
}

/**
 * Hook that fetches the full business profile, AI context, and intelligence summary,
 * then packages them into a ChatContext ready for any AI component to use.
 *
 * Usage in any AI component:
 * ```ts
 * const { enrichedContext } = useBusinessIntelligenceContext({ smbId });
 * const { sendMessage, setContext } = useAI({ context: enrichedContext });
 * ```
 */
export function useBusinessIntelligenceContext(
    options: UseBusinessIntelligenceOptions = {}
): UseBusinessIntelligenceReturn {
    const resolvedSmbId = options.smbId
        || localStorage.getItem('active_smb_id')
        || new URLSearchParams(window.location.search).get('smbId')
        || '';

    const enabled = !options.skip && !!resolvedSmbId;

    const profileQuery = useQuery({
        queryKey: ['smb-full-profile', resolvedSmbId],
        queryFn: () => smbService.getFullProfile(resolvedSmbId),
        enabled,
        staleTime: 5 * 60 * 1000,
    });

    const aiContextQuery = useQuery({
        queryKey: ['smb-ai-context', resolvedSmbId],
        queryFn: () => smbService.getAIContext(resolvedSmbId),
        enabled,
        staleTime: 5 * 60 * 1000,
    });

    const summaryQuery = useQuery({
        queryKey: ['smb-intelligence-summary', resolvedSmbId],
        queryFn: () => smbService.getIntelligenceSummary(resolvedSmbId),
        enabled,
        staleTime: 5 * 60 * 1000,
    });

    const enrichedContext = useMemo<ChatContext>(() => ({
        business_profile: profileQuery.data as unknown as Record<string, unknown> ?? undefined,
        ai_context: aiContextQuery.data ?? undefined,
        intelligence_summary: summaryQuery.data ?? undefined,
    }), [profileQuery.data, aiContextQuery.data, summaryQuery.data]);

    const mergeContext = useMemo(() => {
        return (extra: Partial<ChatContext>): ChatContext => ({
            ...enrichedContext,
            ...extra,
        });
    }, [enrichedContext]);

    return {
        enrichedContext,
        profile: profileQuery.data ?? null,
        isLoading: profileQuery.isLoading || aiContextQuery.isLoading || summaryQuery.isLoading,
        mergeContext,
    };
}
