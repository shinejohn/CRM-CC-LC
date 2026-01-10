/**
 * Email Template Service
 * Handles loading and processing email templates from campaign data
 */

export interface EmailTemplate {
  subject: string;
  preview_text?: string;
  body: string;
}

export interface CampaignEmails {
  [key: string]: EmailTemplate;
}

/**
 * Load email templates from campaign data
 */
export function getEmailTemplates(campaignData: any): CampaignEmails {
  return campaignData.emails || {};
}

/**
 * Get a specific email template by key
 */
export function getEmailTemplate(
  campaignData: any,
  templateKey: string
): EmailTemplate | null {
  const emails = getEmailTemplates(campaignData);
  return emails[templateKey] || null;
}

/**
 * Get all email template keys for a campaign
 */
export function getEmailTemplateKeys(campaignData: any): string[] {
  const emails = getEmailTemplates(campaignData);
  return Object.keys(emails);
}

/**
 * Replace personalization variables in email template
 */
export function personalizeEmailTemplate(
  template: EmailTemplate,
  personalizationData: Record<string, string>
): EmailTemplate {
  const replaceVars = (text: string): string => {
    if (!text) return text;
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return personalizationData[key] || match;
    });
  };

  return {
    subject: replaceVars(template.subject),
    preview_text: template.preview_text ? replaceVars(template.preview_text) : undefined,
    body: replaceVars(template.body),
  };
}

