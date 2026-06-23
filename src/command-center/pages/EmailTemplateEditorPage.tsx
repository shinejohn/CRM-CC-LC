import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Save, AlertCircle, Code, Eye } from 'lucide-react';
import { PageHeader, DataCard } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  useEmailTemplate,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  usePreviewEmailTemplate,
} from '@/hooks/useEmailTemplates';
import {
  KNOWN_VARIABLES,
  SAMPLE_VARIABLES,
  type EmailTemplatePreview,
} from '@/services/crm/email-templates-api';

interface FormState {
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  subject: '',
  html_content: '<p>Hi {{customer_name}},</p>\n<p></p>\n<p>— The Day.News team</p>',
  text_content: '',
  is_active: true,
};

export function EmailTemplateEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const templateId = isNew ? undefined : id;

  const { data: existing, isLoading, isError } = useEmailTemplate(templateId);
  const createTemplate = useCreateEmailTemplate();
  const updateTemplate = useUpdateEmailTemplate();
  const previewMutation = usePreviewEmailTemplate();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [preview, setPreview] = useState<EmailTemplatePreview | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const lastFocused = useRef<'subject' | 'body'>('body');

  // Hydrate form when an existing template loads.
  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        subject: existing.subject,
        html_content: existing.html_content,
        text_content: existing.text_content ?? '',
        is_active: existing.is_active,
      });
    }
  }, [existing]);

  // Debounced live preview via the server render endpoint.
  const { subject, html_content, text_content } = form;
  useEffect(() => {
    if (!subject && !html_content) {
      setPreview(null);
      return;
    }
    const handle = window.setTimeout(() => {
      previewMutation.mutate(
        {
          subject,
          html_content,
          text_content: text_content || undefined,
          variables: SAMPLE_VARIABLES,
        },
        { onSuccess: setPreview },
      );
    }, 400);
    return () => window.clearTimeout(handle);
    // previewMutation is stable from TanStack; intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, html_content, text_content]);

  const usedVariables = useMemo(() => {
    const haystack = `${form.subject} ${form.html_content} ${form.text_content}`;
    return KNOWN_VARIABLES.filter((v) => haystack.includes(`{{${v}}}`));
  }, [form.subject, form.html_content, form.text_content]);

  const insertVariable = (variable: string) => {
    const token = `{{${variable}}}`;
    if (lastFocused.current === 'subject') {
      const el = subjectRef.current;
      const start = el?.selectionStart ?? form.subject.length;
      const end = el?.selectionEnd ?? form.subject.length;
      const next = form.subject.slice(0, start) + token + form.subject.slice(end);
      setForm((f) => ({ ...f, subject: next }));
      requestAnimationFrame(() => {
        el?.focus();
        el?.setSelectionRange(start + token.length, start + token.length);
      });
    } else {
      const el = bodyRef.current;
      const start = el?.selectionStart ?? form.html_content.length;
      const end = el?.selectionEnd ?? form.html_content.length;
      const next = form.html_content.slice(0, start) + token + form.html_content.slice(end);
      setForm((f) => ({ ...f, html_content: next }));
      requestAnimationFrame(() => {
        el?.focus();
        el?.setSelectionRange(start + token.length, start + token.length);
      });
    }
  };

  const canSave = form.name.trim() && form.subject.trim() && form.html_content.trim();

  const handleSave = async () => {
    if (!canSave) return;
    setSaveError(null);
    const payload = {
      name: form.name.trim(),
      subject: form.subject.trim(),
      html_content: form.html_content,
      text_content: form.text_content.trim() || null,
      variables: usedVariables,
      is_active: form.is_active,
    };
    try {
      if (isNew) {
        await createTemplate.mutateAsync(payload);
      } else {
        await updateTemplate.mutateAsync({ id: templateId as string, data: payload });
      }
      navigate('/command-center/attract/templates');
    } catch {
      setSaveError('Could not save the template. Check the fields and try again.');
    }
  };

  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  if (!isNew && isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Email Template" icon={Mail} />
        <DataCard>
          <div className="h-64 animate-pulse rounded-lg bg-[var(--nexus-bg-secondary)]" />
        </DataCard>
      </div>
    );
  }

  if (!isNew && isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Email Template" icon={Mail} />
        <DataCard>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="w-8 h-8 text-[var(--nexus-accent-danger)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--nexus-text-primary)] mb-2">
              Couldn’t load this template
            </h3>
            <Button type="button" variant="outline" onClick={() => navigate('/command-center/attract/templates')}>
              Back to templates
            </Button>
          </div>
        </DataCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? 'New Email Template' : 'Edit Email Template'}
        subtitle="Compose with variables and preview the rendered email"
        icon={Mail}
        actions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/command-center/attract/templates')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!canSave || isSaving}
              className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] border-none"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving…' : 'Save Template'}
            </Button>
          </div>
        }
      />

      {saveError && (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--nexus-accent-danger)] bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-[var(--nexus-accent-danger)]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <DataCard>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="tpl-name">Template name</Label>
                <Input
                  id="tpl-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Welcome — Community Launch"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tpl-subject">Subject line</Label>
                <Input
                  id="tpl-subject"
                  ref={subjectRef}
                  value={form.subject}
                  onFocus={() => {
                    lastFocused.current = 'subject';
                  }}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. Welcome to {{business_name}}"
                />
              </div>

              {/* Variable picker */}
              <div className="space-y-1.5">
                <Label>Insert variable</Label>
                <div className="flex flex-wrap gap-1.5">
                  {KNOWN_VARIABLES.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => insertVariable(variable)}
                      aria-label={`Insert variable ${variable}`}
                      className="px-2 py-1 rounded-md font-mono text-xs bg-[var(--nexus-bg-secondary)] border border-[var(--nexus-card-border)] text-[var(--nexus-text-secondary)] hover:border-[var(--nexus-accent-primary)] hover:text-[var(--nexus-accent-primary)] transition-colors"
                    >
                      {`{{${variable}}}`}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[var(--nexus-text-tertiary)]">
                  Click to insert at the cursor in the focused field (subject or body).
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tpl-html" className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5" />
                  HTML body
                </Label>
                <textarea
                  id="tpl-html"
                  ref={bodyRef}
                  value={form.html_content}
                  onFocus={() => {
                    lastFocused.current = 'body';
                  }}
                  onChange={(e) => setForm((f) => ({ ...f, html_content: e.target.value }))}
                  spellCheck={false}
                  rows={12}
                  className="w-full rounded-lg bg-[var(--nexus-card-bg)] border border-[var(--nexus-card-border)] p-3 font-mono text-xs leading-relaxed text-[var(--nexus-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)]"
                  placeholder="<p>Hi {{customer_name}}, …</p>"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tpl-text">Plain text body (optional)</Label>
                <textarea
                  id="tpl-text"
                  value={form.text_content}
                  onChange={(e) => setForm((f) => ({ ...f, text_content: e.target.value }))}
                  spellCheck={false}
                  rows={4}
                  className="w-full rounded-lg bg-[var(--nexus-card-bg)] border border-[var(--nexus-card-border)] p-3 font-mono text-xs leading-relaxed text-[var(--nexus-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)]"
                  placeholder="Plain-text fallback…"
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="tpl-active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, is_active: checked }))}
                  aria-label="Template active"
                />
                <Label htmlFor="tpl-active">Active</Label>
              </div>
            </div>
          </DataCard>
        </motion.div>

        {/* Live preview */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <DataCard>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--nexus-text-primary)]">
                <Eye className="w-4 h-4" />
                Live preview
                <span className="text-xs font-normal text-[var(--nexus-text-tertiary)]">(sample data)</span>
              </div>

              <div className="rounded-lg border border-[var(--nexus-card-border)] overflow-hidden">
                <div className="border-b border-[var(--nexus-card-border)] bg-[var(--nexus-bg-secondary)] px-4 py-2">
                  <div className="text-[10px] uppercase tracking-wide text-[var(--nexus-text-tertiary)]">Subject</div>
                  <div className="text-sm font-medium text-[var(--nexus-text-primary)]">
                    {preview?.subject || form.subject || '—'}
                  </div>
                </div>
                <div
                  className="bg-white px-4 py-4 text-sm text-gray-800 min-h-[260px] overflow-auto"
                  // Preview HTML is operator-authored template content rendered with sample data.
                  dangerouslySetInnerHTML={{ __html: preview?.html ?? form.html_content }}
                />
              </div>

              {usedVariables.length > 0 && (
                <div className="text-xs text-[var(--nexus-text-tertiary)]">
                  Variables in use:{' '}
                  <span className="font-mono text-[var(--nexus-text-secondary)]">
                    {usedVariables.map((v) => `{{${v}}}`).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </DataCard>
        </motion.div>
      </div>
    </div>
  );
}
