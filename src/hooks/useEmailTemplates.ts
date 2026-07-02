/**
 * Email template builder hooks: list + get + create + update + delete + preview.
 * Backed by emailTemplatesApi → /v1/outbound/email-templates.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  emailTemplatesApi,
  type EmailTemplate,
  type EmailTemplateInput,
  type EmailTemplatePage,
  type EmailTemplatePreview,
} from '@/services/crm/email-templates-api';

const listKey = (params?: Record<string, unknown>) => ['email-templates', params ?? {}] as const;
const detailKey = (id: string) => ['email-template', id] as const;

export const useEmailTemplates = (params?: { search?: string; is_active?: boolean; per_page?: number; page?: number }) =>
  useQuery<EmailTemplatePage>({
    queryKey: listKey(params),
    queryFn: () => emailTemplatesApi.list(params),
  });

export const useEmailTemplate = (id: string | undefined) =>
  useQuery<EmailTemplate>({
    queryKey: detailKey(id ?? ''),
    queryFn: () => emailTemplatesApi.get(id as string),
    enabled: !!id,
  });

export const useCreateEmailTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EmailTemplateInput): Promise<EmailTemplate> => emailTemplatesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['email-templates'] }),
  });
};

export const useUpdateEmailTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmailTemplateInput> }): Promise<EmailTemplate> =>
      emailTemplatesApi.update(id, data),
    onSuccess: (template) => {
      qc.invalidateQueries({ queryKey: ['email-templates'] });
      qc.invalidateQueries({ queryKey: detailKey(template.id) });
    },
  });
};

export const useDeleteEmailTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string): Promise<void> => emailTemplatesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['email-templates'] }),
  });
};

export const usePreviewEmailTemplate = () =>
  useMutation({
    mutationFn: ({
      subject,
      html_content,
      text_content,
      variables,
    }: {
      subject: string;
      html_content: string;
      text_content?: string | null;
      variables: Record<string, string>;
    }): Promise<EmailTemplatePreview> =>
      emailTemplatesApi.previewRaw({ subject, html_content, text_content }, variables),
  });
