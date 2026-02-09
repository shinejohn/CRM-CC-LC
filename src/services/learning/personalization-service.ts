/**
 * Personalization Service
 * Handles template variable replacement and personalization logic
 */

export interface PersonalizationData {
  first_name?: string;
  business_name?: string;
  business_slug?: string;
  business_category?: string;
  business_type?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  address?: string;
  hours?: string;
  // Auto-generated fields
  auto_generated_description?: string;
  local_business_count?: string;
  avg_monthly_views?: string;
  competitor_count?: string;
  similar_business_type?: string;
  response_time?: string;
  suggested_offer?: string;
  suggested_value?: string;
  suggested_terms?: string;
  count?: string;
}

/**
 * Replace template variables in a string with actual values
 * Supports {{variable_name}} syntax
 */
export function replaceTemplateVariables(
  text: string,
  data: PersonalizationData
): string {
  if (!text) return text;
  
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key as keyof PersonalizationData];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Replace template variables in an object recursively
 */
export function personalizeObject(
  obj: any,
  data: PersonalizationData
): any {
  if (typeof obj === 'string') {
    return replaceTemplateVariables(obj, data);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => personalizeObject(item, data));
  }
  
  if (obj && typeof obj === 'object') {
    const personalized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      personalized[key] = personalizeObject(value, data);
    }
    return personalized;
  }
  
  return obj;
}

/**
 * Generate auto-generated personalization fields
 */
export function generateAutoFields(
  baseData: PersonalizationData
): PersonalizationData {
  const autoFields: Partial<PersonalizationData> = {};
  
  // Generate auto_generated_description if not provided
  if (!baseData.auto_generated_description && baseData.business_name && baseData.business_category) {
    autoFields.auto_generated_description = `${baseData.business_name} is a ${baseData.business_category} business${baseData.city ? ` located in ${baseData.city}` : ''}.`;
  }
  
  // Generate local_business_count if not provided (mock data for now)
  if (!baseData.local_business_count) {
    autoFields.local_business_count = '150+';
  }
  
  // Generate avg_monthly_views if not provided
  if (!baseData.avg_monthly_views) {
    autoFields.avg_monthly_views = '2,400';
  }
  
  // Generate competitor_count if not provided
  if (!baseData.competitor_count && baseData.business_category) {
    autoFields.competitor_count = '12';
  }
  
  // Generate similar_business_type if not provided
  if (!baseData.similar_business_type && baseData.business_category) {
    autoFields.similar_business_type = baseData.business_category;
  }
  
  // Generate response_time if not provided
  if (!baseData.response_time) {
    autoFields.response_time = '< 2 hours';
  }
  
  // Generate suggested_offer if not provided
  if (!baseData.suggested_offer) {
    autoFields.suggested_offer = '20% Off';
  }
  
  // Generate suggested_value if not provided
  if (!baseData.suggested_value) {
    autoFields.suggested_value = '$20';
  }
  
  // Generate suggested_terms if not provided
  if (!baseData.suggested_terms) {
    autoFields.suggested_terms = 'Valid for new customers only';
  }
  
  // Generate count if not provided
  if (!baseData.count && baseData.local_business_count) {
    autoFields.count = baseData.local_business_count;
  }
  
  return {
    ...baseData,
    ...autoFields,
  };
}

/**
 * Check if a string contains template variables
 */
export function hasTemplateVariables(text: string): boolean {
  return /\{\{\w+\}\}/.test(text);
}

/**
 * Extract all template variables from a string
 */
export function extractTemplateVariables(text: string): string[] {
  const matches = text.matchAll(/\{\{(\w+)\}\}/g);
  return Array.from(matches, m => m[1]);
}





