// ============================================
// AI CONTEXT PROVIDER
// Module-aware context scoping for AI chat
// CC-SVC-AI-CONTEXT: Per-module context injection
// ============================================

import type { ChatContext } from './ai.types';

/**
 * Build a ChatContext fragment based on the current Command Center zone/module.
 * Called by useAccountManager on every sendMessage to give the AI awareness
 * of what the user is looking at.
 */
export function getModuleContext(
  zone: string,
  moduleData?: Record<string, unknown>
): Partial<ChatContext> {
  switch (zone) {
    case 'crm':
    case 'customers':
      return {
        currentPage: 'customer_management',
        customerId: moduleData?.customerId as string | undefined,
        customerName: moduleData?.customerName as string | undefined,
        businessContext: {
          module: 'crm',
          activeCustomerId: moduleData?.customerId,
          customerName: moduleData?.customerName,
        },
      };

    case 'sell':
    case 'pipeline':
      return {
        currentPage: 'pipeline',
        businessContext: {
          module: 'pipeline',
          dealStage: moduleData?.currentStage,
          dealValue: moduleData?.dealValue,
          pipelineStats: moduleData?.stats,
        },
      };

    case 'attract':
    case 'marketing-kit':
    case 'campaigns':
      return {
        currentPage: 'marketing',
        businessContext: {
          module: 'marketing',
          activeCampaignId: moduleData?.campaignId,
          campaignType: moduleData?.campaignType,
        },
      };

    case 'content':
      return {
        currentPage: 'content_management',
        selectedContent: moduleData?.selectedContentId as string | undefined,
        businessContext: {
          module: 'content',
        },
      };

    case 'deliver':
    case 'billing':
      return {
        currentPage: 'billing',
        businessContext: {
          module: 'billing',
          activeInvoiceId: moduleData?.invoiceId,
        },
      };

    case 'automate':
    case 'workflows':
      return {
        currentPage: 'automation',
        businessContext: {
          module: 'automation',
        },
      };

    case 'measure':
    case 'analytics':
      return {
        currentPage: 'analytics',
        businessContext: {
          module: 'analytics',
        },
      };

    case 'define':
    case 'business':
      return {
        currentPage: 'business_profile',
        businessContext: {
          module: 'business_profile',
        },
      };

    case 'ai-hub':
    case 'ai-team':
      return {
        currentPage: 'ai_hub',
        businessContext: {
          module: 'ai_hub',
        },
      };

    case 'intelligence-hub':
      return {
        currentPage: 'intelligence_hub',
        businessContext: {
          module: 'intelligence_hub',
          smbId: moduleData?.smbId,
        },
      };

    case 'learn':
      return {
        currentPage: 'learning_center',
        businessContext: {
          module: 'learning_center',
          activeCampaignSlug: moduleData?.campaignSlug,
        },
      };

    case 'settings':
      return {
        currentPage: 'settings',
        businessContext: { module: 'settings' },
      };

    case 'dashboard':
    default:
      return {
        currentPage: zone || 'dashboard',
        businessContext: { module: zone || 'dashboard' },
      };
  }
}
