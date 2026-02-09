// ============================================
// CONTACT SALES API SERVICE
// ============================================

import { apiClient } from './api-client';

export interface ContactSalesFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  campaign_id?: string;
  campaign_slug?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface ContactSalesResponse {
  success: boolean;
  message: string;
}

export const contactApi = {
  /**
   * Submit contact sales form
   */
  contactSales: async (data: ContactSalesFormData): Promise<ContactSalesResponse> => {
    try {
      const response = await apiClient.post<ContactSalesResponse>(
        '/v1/learning/contact/sales',
        data
      );
      return response;
    } catch (error) {
      console.error('Failed to submit contact sales form:', error);
      throw error;
    }
  },
};






