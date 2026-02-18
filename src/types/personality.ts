/**
 * AI personality types
 */

export interface AiPersonality {
  id: string;
  name: string;
  slug?: string;
  identity?: string;
  description?: string;
  persona_description?: string;
  communication_style?: string;
  system_prompt?: string;
  greeting_message?: string;
  traits?: string[];
  expertise_areas?: string[];
  is_active?: boolean;
  priority?: number;
  created_at: string;
  updated_at: string;
}

export interface PersonalityAssignment {
  id: string;
  personality_id: string;
  customer_id: string;
  assigned_at: string;
  status?: string;
  personality?: AiPersonality;
}

export interface GenerateResponseParams {
  message: string;
  conversation_context?: Array<{ role: string; content: string }>;
  customer_id?: string;
  stream?: boolean;
}

export interface GenerateResponseResult {
  response: string;
  personality_id: string;
  personality_name: string;
}
