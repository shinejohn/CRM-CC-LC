import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { eventBus, Events } from '../services/events.service';
import { toast } from '@/components/ui/toaster';

/**
 * Hook for cross-module navigation and actions
 */
export function useCrossModule() {
  const navigate = useNavigate();

  // Navigate to customer and optionally open action
  const goToCustomer = useCallback((customerId: string, action?: 'call' | 'email' | 'activity') => {
    navigate(`/command-center/customers/${customerId}`);
    if (action) {
      // Emit event for customer page to handle
      setTimeout(() => {
        eventBus.emit('customer.action', { customerId, action });
      }, 100);
    }
  }, [navigate]);

  // Navigate to AI with a prompt
  const askAI = useCallback((prompt: string, context?: Record<string, any>) => {
    navigate('/command-center/ai');
    setTimeout(() => {
      eventBus.emit('ai.prefill', { prompt, context });
    }, 100);
  }, [navigate]);

  // Create content from any module
  const createContent = useCallback((type: string, initialData?: Record<string, any>) => {
    navigate('/command-center/content');
    setTimeout(() => {
      eventBus.emit('content.create', { type, data: initialData });
    }, 100);
  }, [navigate]);

  // Start campaign for customer segment
  const startCampaign = useCallback((audienceFilter?: Record<string, any>) => {
    navigate('/command-center/campaigns');
    setTimeout(() => {
      eventBus.emit('campaign.create', { audience: audienceFilter });
    }, 100);
  }, [navigate]);

  // Log activity for customer
  const logActivity = useCallback((customerId: string, type: string, data?: Record<string, any>) => {
    eventBus.emit(Events.ACTIVITY_CREATED, { customerId, type, ...data });
    toast({
      title: 'Activity Logged',
      description: 'The activity has been recorded.',
      type: 'success',
    });
  }, []);

  return {
    goToCustomer,
    askAI,
    createContent,
    startCampaign,
    logActivity,
  };
}

