/**
 * AI personality operations
 */

import api from './api';
import type { AiPersonality, PersonalityAssignment } from '../types/personality';
import type { PaginatedResponse, ApiResponse } from '../types/common';

export const personalityService = {
  list: () =>
    api.get<ApiResponse<AiPersonality[]>>('/personalities').then((r) => r.data.data ?? r.data),

  get: (id: string) =>
    api.get<ApiResponse<AiPersonality>>(`/personalities/${id}`).then((r) => r.data.data),

  getAssignments: () =>
    api.get<ApiResponse<PersonalityAssignment[]>>('/personalities/assignments').then((r) => r.data.data ?? r.data),

  assignToCustomer: (personalityId: string, customerId: string) =>
    api.post<ApiResponse<PersonalityAssignment>>('/personalities/assign', {
      personality_id: personalityId,
      customer_id: customerId,
    }).then((r) => r.data.data),

  getCustomerPersonality: (customerId: string) =>
    api.get<ApiResponse<AiPersonality | null>>(`/personalities/customers/${customerId}/personality`).then((r) => r.data.data),
};
