// ============================================
// CONVERSION TRACKING SERVICE
// ============================================
// Tracks conversions from Learning Center to CRM

import { conversationApi, customerApi } from './crm-api';
import type { Customer, Conversation } from './crm-api';

export interface ConversionEvent {
  type: 'landing_page_view' | 'presentation_view' | 'presentation_complete' | 'service_interest' | 'service_purchase';
  customer_id?: string;
  customer_slug?: string;
  campaign_id?: string;
  campaign_slug?: string;
  presentation_id?: string;
  service_id?: string;
  service_name?: string;
  metadata?: Record<string, unknown>;
}

export interface LandingPageViewEvent extends ConversionEvent {
  type: 'landing_page_view';
  campaign_slug: string;
  customer_email?: string;
  customer_phone?: string;
  customer_name?: string;
}

export interface PresentationViewEvent extends ConversionEvent {
  type: 'presentation_view';
  presentation_id: string;
  customer_id?: string;
  slide_number?: number;
}

export interface ServiceInterestEvent extends ConversionEvent {
  type: 'service_interest';
  service_id: string;
  service_name: string;
  customer_id: string;
}

export interface ServicePurchaseEvent extends ConversionEvent {
  type: 'service_purchase';
  service_id: string;
  service_name: string;
  customer_id: string;
  amount?: number;
  currency?: string;
}

/**
 * Track a conversion event
 */
export async function trackConversion(event: ConversionEvent): Promise<void> {
  try {
    // Find or create customer if we have identifying information
    let customerId: string | undefined = event.customer_id;

    if (!customerId && (event.type === 'landing_page_view' || event.type === 'service_interest' || event.type === 'service_purchase')) {
      const landingEvent = event as LandingPageViewEvent | ServiceInterestEvent | ServicePurchaseEvent;
      
      // Try to find customer by email or phone
      if (landingEvent.customer_email || (landingEvent as ServiceInterestEvent | ServicePurchaseEvent).customer_id) {
        try {
          const customers = await customerApi.list({
            search: landingEvent.customer_email || undefined,
          });
          
          const existingCustomer = customers.data.find(
            (c) => c.email === (landingEvent as LandingPageViewEvent).customer_email
          );
          
          if (existingCustomer) {
            customerId = existingCustomer.id;
          } else if (landingEvent.customer_email) {
            // Create new customer from landing page
            const newCustomer = await customerApi.create({
              business_name: (landingEvent as LandingPageViewEvent).customer_name || 'New Customer',
              email: (landingEvent as LandingPageViewEvent).customer_email,
              phone: (landingEvent as LandingPageViewEvent).customer_phone,
              lead_source: 'learning_center',
              lead_score: 10,
            });
            customerId = newCustomer.id;
          }
        } catch (error) {
          console.error('Error finding/creating customer:', error);
        }
      }
    }

    // Create or update conversation based on event type
    if (event.type === 'landing_page_view') {
      const landingEvent = event as LandingPageViewEvent;
      
      // Create conversation for landing page visit
      await conversationApi.create({
        customer_id: customerId,
        entry_point: 'presentation',
        template_id: landingEvent.campaign_slug,
        outcome: 'landing_page_view',
        outcome_details: `Visited landing page: ${landingEvent.campaign_slug}`,
        messages: [],
        new_data_collected: {
          campaign_slug: landingEvent.campaign_slug,
          ...landingEvent.metadata,
        },
      });
    } else if (event.type === 'presentation_view' || event.type === 'presentation_complete') {
      const presentationEvent = event as PresentationViewEvent;
      
      // Update existing conversation or create new one
      if (presentationEvent.customer_id) {
        const conversations = await conversationApi.list({
          customer_id: presentationEvent.customer_id,
        });
        
        const activeConversation = conversations.data.find(
          (c) => !c.ended_at && c.template_id === presentationEvent.presentation_id
        );
        
        if (activeConversation) {
          await conversationApi.update(activeConversation.id, {
            outcome: event.type === 'presentation_complete' ? 'presentation_complete' : 'presentation_view',
            outcome_details: event.type === 'presentation_complete' 
              ? 'Completed presentation' 
              : `Viewed slide ${presentationEvent.slide_number || 0}`,
          });
        } else {
          await conversationApi.create({
            customer_id: presentationEvent.customer_id,
            entry_point: 'presentation',
            template_id: presentationEvent.presentation_id,
            outcome: event.type === 'presentation_complete' ? 'presentation_complete' : 'presentation_view',
            messages: [],
          });
        }
      }
    } else if (event.type === 'service_interest') {
      const interestEvent = event as ServiceInterestEvent;
      
      // Update customer lead score and create conversation
      if (interestEvent.customer_id) {
        const customer = await customerApi.get(interestEvent.customer_id);
        await customerApi.update(interestEvent.customer_id, {
          lead_score: Math.min(customer.lead_score + 20, 100),
        });
        
        await conversationApi.create({
          customer_id: interestEvent.customer_id,
          entry_point: 'presentation',
          outcome: 'service_interest',
          outcome_details: `Showed interest in: ${interestEvent.service_name}`,
          messages: [],
          new_data_collected: {
            service_id: interestEvent.service_id,
            service_name: interestEvent.service_name,
            ...interestEvent.metadata,
          },
        });
      }
    } else if (event.type === 'service_purchase') {
      const purchaseEvent = event as ServicePurchaseEvent;
      
      // Update customer and create conversion conversation
      if (purchaseEvent.customer_id) {
        const customer = await customerApi.get(purchaseEvent.customer_id);
        await customerApi.update(purchaseEvent.customer_id, {
          lead_score: 100,
          subscription_tier: purchaseEvent.service_name,
        });
        
        await conversationApi.create({
          customer_id: purchaseEvent.customer_id,
          entry_point: 'presentation',
          outcome: 'service_purchase',
          outcome_details: `Purchased: ${purchaseEvent.service_name}`,
          messages: [],
          new_data_collected: {
            service_id: purchaseEvent.service_id,
            service_name: purchaseEvent.service_name,
            amount: purchaseEvent.amount,
            currency: purchaseEvent.currency,
            ...purchaseEvent.metadata,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error tracking conversion:', error);
    // Don't throw - tracking should not break the user experience
  }
}

/**
 * Track landing page view
 */
export async function trackLandingPageView(
  campaignSlug: string,
  customerEmail?: string,
  customerPhone?: string,
  customerName?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await trackConversion({
    type: 'landing_page_view',
    campaign_slug: campaignSlug,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    customer_name: customerName,
    metadata,
  });
}

/**
 * Track presentation view
 */
export async function trackPresentationView(
  presentationId: string,
  customerId?: string,
  slideNumber?: number
): Promise<void> {
  await trackConversion({
    type: 'presentation_view',
    presentation_id: presentationId,
    customer_id: customerId,
    slide_number: slideNumber,
  });
}

/**
 * Track presentation completion
 */
export async function trackPresentationComplete(
  presentationId: string,
  customerId?: string
): Promise<void> {
  await trackConversion({
    type: 'presentation_complete',
    presentation_id: presentationId,
    customer_id: customerId,
  });
}

/**
 * Track service interest
 */
export async function trackServiceInterest(
  serviceId: string,
  serviceName: string,
  customerId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await trackConversion({
    type: 'service_interest',
    service_id: serviceId,
    service_name: serviceName,
    customer_id: customerId,
    metadata,
  });
}

/**
 * Track service purchase
 */
export async function trackServicePurchase(
  serviceId: string,
  serviceName: string,
  customerId: string,
  amount?: number,
  currency = 'USD',
  metadata?: Record<string, unknown>
): Promise<void> {
  await trackConversion({
    type: 'service_purchase',
    service_id: serviceId,
    service_name: serviceName,
    customer_id: customerId,
    amount,
    currency,
    metadata,
  });
}
