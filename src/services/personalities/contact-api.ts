// ============================================
// PERSONALITY CONTACT API
// ============================================

import { apiClient } from '../learning/api-client';

export interface ContactPreferences {
  preferred_channel: 'email' | 'sms' | 'call' | 'chat';
  allowed_channels: Array<'email' | 'sms' | 'call' | 'chat'>;
  time_of_day: string;
  frequency: string;
}

export interface ContactRequest {
  customer_id: string;
  contact_type: 'email' | 'sms' | 'call' | 'phone';
  message?: string;
  subject?: string;
  purpose?: string;
  options?: Record<string, any>;
}

export interface ScheduleContactRequest {
  customer_id: string;
  contact_type: 'email' | 'sms' | 'call' | 'phone';
  scheduled_at: string;
  options?: Record<string, any>;
}

/**
 * Contact customer using their assigned personality
 */
export async function contactCustomer(
  request: ContactRequest
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    '/api/v1/personality-contacts/contact',
    request
  );
  return response.data;
}

/**
 * Schedule contact for customer
 */
export async function scheduleContact(
  request: ScheduleContactRequest
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    '/api/v1/personality-contacts/schedule',
    request
  );
  return response.data;
}

/**
 * Get customer contact preferences
 */
export async function getContactPreferences(customerId: string): Promise<ContactPreferences> {
  const response = await apiClient.get<{ data: ContactPreferences }>(
    `/api/v1/personality-contacts/customers/${customerId}/preferences`
  );
  return response.data.data;
}

/**
 * Update customer contact preferences
 */
export async function updateContactPreferences(
  customerId: string,
  preferences: Partial<ContactPreferences>
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.put<{ success: boolean; message: string }>(
    `/api/v1/personality-contacts/customers/${customerId}/preferences`,
    preferences
  );
  return response.data;
}
