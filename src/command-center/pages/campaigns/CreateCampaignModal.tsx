import { useMemo, useState } from 'react';
import { Mail, Phone, MessageSquare, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateOutboundCampaign } from '@/hooks/useOutboundCampaigns';
import type {
  AbWinnerMetric,
  CampaignVariantInput,
  CreateOutboundCampaignInput,
  OutboundCampaignType,
  RecipientSegments,
} from '@/services/crm/outbound-campaigns-api';

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the new campaign id after a successful create. */
  onCreated?: (campaignId: string) => void;
}

type StepKey = 'audience' | 'content' | 'schedule' | 'review';

const STEPS: { key: StepKey; label: string }[] = [
  { key: 'audience', label: 'Audience' },
  { key: 'content', label: 'Content' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'review', label: 'Review' },
];

const TYPE_OPTIONS: { value: OutboundCampaignType; label: string; icon: typeof Mail }[] = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone', icon: Phone },
  { value: 'sms', label: 'SMS', icon: MessageSquare },
];

const PIPELINE_STAGES = ['HOOK', 'ENGAGEMENT', 'SALES', 'RETENTION', 'CHURNED'];

const fieldLabel = 'text-sm font-medium text-[var(--nexus-text-primary)]';
const fieldClass =
  'w-full rounded-lg border border-[var(--nexus-card-border)] bg-transparent px-3 py-2 text-sm text-[var(--nexus-text-primary)] placeholder:text-[var(--nexus-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--nexus-accent-primary)]';

export function CreateCampaignModal({ open, onOpenChange, onCreated }: CreateCampaignModalProps) {
  const createCampaign = useCreateOutboundCampaign();

  const [stepIndex, setStepIndex] = useState(0);

  // Audience
  const [name, setName] = useState('');
  const [type, setType] = useState<OutboundCampaignType>('email');
  const [pipelineStage, setPipelineStage] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [requireContact, setRequireContact] = useState(true);

  // Content
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // A/B testing
  const [abEnabled, setAbEnabled] = useState(false);
  const [winnerMetric, setWinnerMetric] = useState<AbWinnerMetric>('open_rate');
  const [splitA, setSplitA] = useState(50);
  const [variantASubject, setVariantASubject] = useState('');
  const [variantAMessage, setVariantAMessage] = useState('');
  const [variantBSubject, setVariantBSubject] = useState('');
  const [variantBMessage, setVariantBMessage] = useState('');

  // Schedule
  const [scheduledAt, setScheduledAt] = useState('');

  const [error, setError] = useState<string | null>(null);

  const step = STEPS[stepIndex];

  const segments = useMemo<RecipientSegments>(() => {
    const seg: RecipientSegments = {};
    if (pipelineStage) seg.pipeline_stage = pipelineStage;
    if (stateCode.trim()) seg.state = stateCode.trim().toUpperCase();
    if (requireContact) {
      if (type === 'email') seg.has_email = true;
      else seg.has_phone = true;
    }
    return seg;
  }, [pipelineStage, stateCode, requireContact, type]);

  const reset = () => {
    setStepIndex(0);
    setName('');
    setType('email');
    setPipelineStage('');
    setStateCode('');
    setRequireContact(true);
    setSubject('');
    setMessage('');
    setAbEnabled(false);
    setWinnerMetric('open_rate');
    setSplitA(50);
    setVariantASubject('');
    setVariantAMessage('');
    setVariantBSubject('');
    setVariantBMessage('');
    setScheduledAt('');
    setError(null);
  };

  const close = () => {
    if (createCampaign.isPending) return;
    reset();
    onOpenChange(false);
  };

  const validateStep = (key: StepKey): string | null => {
    if (key === 'audience' && name.trim() === '') return 'Give the campaign a name.';
    if (key === 'content') {
      if (type === 'email' && subject.trim() === '') return 'A subject line is required for email campaigns.';
      if (message.trim() === '') return 'The message body cannot be empty.';
      if (abEnabled) {
        if (variantAMessage.trim() === '' || variantBMessage.trim() === '')
          return 'Both variants need a message.';
        if (type === 'email' && (variantASubject.trim() === '' || variantBSubject.trim() === ''))
          return 'Both variants need a subject line for email campaigns.';
      }
    }
    return null;
  };

  const goNext = () => {
    const validationError = validateStep(step.key);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  };

  const goBack = () => {
    setError(null);
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const handleSubmit = async () => {
    // Re-validate the steps that have hard requirements.
    const audienceErr = validateStep('audience');
    const contentErr = validateStep('content');
    const firstError = audienceErr ?? contentErr;
    if (firstError) {
      setError(firstError);
      return;
    }

    const payload: CreateOutboundCampaignInput = {
      name: name.trim(),
      type,
      message: message.trim(),
    };
    if (type === 'email') payload.subject = subject.trim();
    if (scheduledAt) payload.scheduled_at = new Date(scheduledAt).toISOString();
    if (Object.keys(segments).length > 0) payload.recipient_segments = segments;

    if (abEnabled) {
      const variantA: CampaignVariantInput = {
        label: 'A',
        message: variantAMessage.trim(),
        weight: splitA,
      };
      const variantB: CampaignVariantInput = {
        label: 'B',
        message: variantBMessage.trim(),
        weight: 100 - splitA,
      };
      if (type === 'email') {
        variantA.subject = variantASubject.trim();
        variantB.subject = variantBSubject.trim();
      }
      payload.ab_test_enabled = true;
      payload.ab_winner_metric = winnerMetric;
      payload.variants = [variantA, variantB];
    }

    try {
      const campaign = await createCampaign.mutateAsync(payload);
      reset();
      onOpenChange(false);
      onCreated?.(campaign.id);
    } catch (err) {
      const messageText =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Failed to create campaign. Please try again.';
      setError(messageText);
    }
  };

  const segmentSummary = useMemo(() => {
    const parts: string[] = [];
    if (segments.pipeline_stage) parts.push(`Stage: ${segments.pipeline_stage}`);
    if (segments.state) parts.push(`State: ${segments.state}`);
    if (segments.has_email) parts.push('Has email');
    if (segments.has_phone) parts.push('Has phone');
    return parts.length > 0 ? parts.join(' · ') : 'All customers in tenant';
  }, [segments]);

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--nexus-bg-page)] border-[var(--nexus-card-border)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--nexus-text-primary)]">New Campaign</DialogTitle>
          <DialogDescription className="text-[var(--nexus-text-secondary)]">
            Build an outbound campaign. It is saved as a draft until you start it.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-2 py-2" aria-label="Campaign builder steps">
          {STEPS.map((s, i) => {
            const done = i < stepIndex;
            const current = i === stepIndex;
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                    current
                      ? 'bg-[var(--nexus-accent-primary)] text-white'
                      : done
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[var(--nexus-bg-secondary)] text-[var(--nexus-text-tertiary)]'
                  }`}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span
                  className={`text-sm ${
                    current
                      ? 'font-medium text-[var(--nexus-text-primary)]'
                      : 'text-[var(--nexus-text-tertiary)]'
                  }`}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="mx-1 text-[var(--nexus-text-tertiary)]">/</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-5 py-2">
          {step.key === 'audience' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="campaign-name" className={fieldLabel}>
                  Campaign name
                </label>
                <Input
                  id="campaign-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. June re-engagement blast"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-1.5">
                <span className={fieldLabel}>Channel</span>
                <div className="grid grid-cols-3 gap-2">
                  {TYPE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = type === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setType(opt.value)}
                        aria-pressed={active}
                        className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm transition-colors ${
                          active
                            ? 'border-[var(--nexus-accent-primary)] bg-[var(--nexus-bg-secondary)] text-[var(--nexus-text-primary)]'
                            : 'border-[var(--nexus-card-border)] text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="campaign-stage" className={fieldLabel}>
                    Pipeline stage
                  </label>
                  <select
                    id="campaign-stage"
                    value={pipelineStage}
                    onChange={(e) => setPipelineStage(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Any stage</option>
                    {PIPELINE_STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="campaign-state" className={fieldLabel}>
                    State (optional)
                  </label>
                  <Input
                    id="campaign-state"
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    placeholder="e.g. CA"
                    maxLength={2}
                    autoComplete="off"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-[var(--nexus-text-secondary)]">
                <input
                  type="checkbox"
                  checked={requireContact}
                  onChange={(e) => setRequireContact(e.target.checked)}
                  className="rounded border-[var(--nexus-card-border)]"
                />
                Only include customers with a {type === 'email' ? 'valid email' : 'phone number'}
              </label>

              <p className="text-xs text-[var(--nexus-text-tertiary)]">
                Audience: {segmentSummary}. The exact recipient count is resolved by the
                backend when the campaign starts.
              </p>
            </div>
          )}

          {step.key === 'content' && (
            <div className="space-y-4">
              {type === 'email' && (
                <div className="space-y-1.5">
                  <label htmlFor="campaign-subject" className={fieldLabel}>
                    Subject line
                  </label>
                  <Input
                    id="campaign-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Your subject line"
                    maxLength={255}
                    autoComplete="off"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label htmlFor="campaign-message" className={fieldLabel}>
                  Message
                </label>
                <textarea
                  id="campaign-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={type === 'email' ? 8 : 4}
                  placeholder={
                    type === 'sms'
                      ? 'Keep it short — SMS messages are limited.'
                      : 'Write your message...'
                  }
                  className={fieldClass}
                />
                {abEnabled && (
                  <p className="text-xs text-[var(--nexus-text-tertiary)]">
                    This is the default content. With A/B testing on, recipients receive
                    Variant A or B below instead.
                  </p>
                )}
              </div>

              {/* A/B test toggle */}
              <div className="flex items-center justify-between rounded-lg border border-[var(--nexus-card-border)] px-4 py-3">
                <div>
                  <span className={fieldLabel}>A/B test</span>
                  <p className="text-xs text-[var(--nexus-text-tertiary)]">
                    Split the audience between two versions and pick a winner.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={abEnabled}
                  aria-label="Toggle A/B testing"
                  onClick={() => setAbEnabled((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    abEnabled
                      ? 'bg-[var(--nexus-accent-primary)]'
                      : 'bg-[var(--nexus-bg-secondary)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      abEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {abEnabled && (
                <div className="space-y-4">
                  <VariantEditor
                    title="Variant A"
                    showSubject={type === 'email'}
                    subject={variantASubject}
                    onSubject={setVariantASubject}
                    message={variantAMessage}
                    onMessage={setVariantAMessage}
                    fieldClass={fieldClass}
                    fieldLabel={fieldLabel}
                  />
                  <VariantEditor
                    title="Variant B"
                    showSubject={type === 'email'}
                    subject={variantBSubject}
                    onSubject={setVariantBSubject}
                    message={variantBMessage}
                    onMessage={setVariantBMessage}
                    fieldClass={fieldClass}
                    fieldLabel={fieldLabel}
                  />

                  <div className="space-y-1.5">
                    <label htmlFor="ab-split" className={fieldLabel}>
                      Split: {splitA}% A / {100 - splitA}% B
                    </label>
                    <input
                      id="ab-split"
                      type="range"
                      min={10}
                      max={90}
                      step={5}
                      value={splitA}
                      onChange={(e) => setSplitA(Number(e.target.value))}
                      className="w-full"
                      aria-label="Audience split percentage for Variant A"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="ab-metric" className={fieldLabel}>
                      Winner decided by
                    </label>
                    <select
                      id="ab-metric"
                      value={winnerMetric}
                      onChange={(e) => setWinnerMetric(e.target.value as AbWinnerMetric)}
                      className={fieldClass}
                    >
                      <option value="open_rate">Open rate</option>
                      <option value="click_rate">Click rate</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {step.key === 'schedule' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="campaign-schedule" className={fieldLabel}>
                  Send time (optional)
                </label>
                <Input
                  id="campaign-schedule"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
                <p className="text-xs text-[var(--nexus-text-tertiary)]">
                  Leave blank to save as a draft and start it manually. A scheduled time
                  marks the campaign as scheduled.
                </p>
              </div>
            </div>
          )}

          {step.key === 'review' && (
            <div className="space-y-3 rounded-lg border border-[var(--nexus-card-border)] px-4 py-3">
              <ReviewRow label="Name" value={name || '—'} />
              <ReviewRow label="Channel" value={type} />
              <ReviewRow label="Audience" value={segmentSummary} />
              {type === 'email' && <ReviewRow label="Subject" value={subject || '—'} />}
              <ReviewRow
                label="Message"
                value={message ? `${message.slice(0, 120)}${message.length > 120 ? '…' : ''}` : '—'}
              />
              {abEnabled && (
                <ReviewRow
                  label="A/B test"
                  value={`${splitA}% A / ${100 - splitA}% B · winner by ${winnerMetric === 'open_rate' ? 'open rate' : 'click rate'}`}
                />
              )}
              <ReviewRow
                label="Schedule"
                value={scheduledAt ? new Date(scheduledAt).toLocaleString() : 'Save as draft'}
              />
            </div>
          )}

          {error && <p className="text-sm text-[var(--nexus-accent-danger)]">{error}</p>}
        </div>

        <DialogFooter className="flex gap-3 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={stepIndex === 0 ? close : goBack}
            disabled={createCampaign.isPending}
            className="border-[var(--nexus-card-border)] text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]"
          >
            {stepIndex === 0 ? 'Cancel' : 'Back'}
          </Button>
          {step.key === 'review' ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={createCampaign.isPending}
              className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] border-none"
            >
              {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={goNext}
              className="bg-[var(--nexus-button-bg)] text-white hover:bg-[var(--nexus-button-hover)] border-none"
            >
              Next
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface VariantEditorProps {
  title: string;
  showSubject: boolean;
  subject: string;
  onSubject: (value: string) => void;
  message: string;
  onMessage: (value: string) => void;
  fieldClass: string;
  fieldLabel: string;
}

function VariantEditor({
  title,
  showSubject,
  subject,
  onSubject,
  message,
  onMessage,
  fieldClass,
  fieldLabel,
}: VariantEditorProps) {
  const idBase = title.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-3 rounded-lg border border-[var(--nexus-card-border)] px-4 py-3">
      <h4 className="text-sm font-semibold text-[var(--nexus-text-primary)]">{title}</h4>
      {showSubject && (
        <div className="space-y-1.5">
          <label htmlFor={`${idBase}-subject`} className={fieldLabel}>
            Subject line
          </label>
          <Input
            id={`${idBase}-subject`}
            value={subject}
            onChange={(e) => onSubject(e.target.value)}
            placeholder={`${title} subject`}
            maxLength={255}
            autoComplete="off"
          />
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor={`${idBase}-message`} className={fieldLabel}>
          Message
        </label>
        <textarea
          id={`${idBase}-message`}
          value={message}
          onChange={(e) => onMessage(e.target.value)}
          rows={4}
          placeholder={`${title} message`}
          className={fieldClass}
        />
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-[var(--nexus-text-tertiary)]">{label}</span>
      <span className="text-right text-[var(--nexus-text-primary)] max-w-[70%]">{value}</span>
    </div>
  );
}
