/**
 * AI personality types
 */

export interface AiPersonality {
  id: string;
  name: string;
  description?: string;
  system_prompt?: string;
  created_at: string;
  updated_at: string;
}

export interface PersonalityAssignment {
  id: string;
  personality_id: string;
  customer_id: string;
  assigned_at: string;
}
