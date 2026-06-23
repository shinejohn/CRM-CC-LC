import { AlertCircle, Loader2, Trophy } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  useDeclareCampaignWinner,
  useOutboundCampaignAnalytics,
} from '@/hooks/useOutboundCampaigns';
import type {
  CampaignVariantStats,
  OutboundCampaign,
} from '@/services/crm/outbound-campaigns-api';

interface CampaignAnalyticsPanelProps {
  campaign: OutboundCampaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pct = (value: number): string => `${value.toFixed(1)}%`;

export function CampaignAnalyticsPanel({ campaign, open, onOpenChange }: CampaignAnalyticsPanelProps) {
  const activeId = open ? campaign?.id ?? null : null;
  const { data, isLoading, isError } = useOutboundCampaignAnalytics(activeId);
  const declareWinner = useDeclareCampaignWinner(activeId);

  const isEmail = campaign?.type === 'email';
  const isVoice = campaign?.type === 'phone';
  const variants = data?.variants ?? [];
  const hasVariants = variants.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto bg-[var(--nexus-bg-page)] border-[var(--nexus-card-border)]"
      >
        <SheetHeader>
          <SheetTitle className="text-[var(--nexus-text-primary)]">
            {campaign?.name ?? 'Campaign'}
          </SheetTitle>
          <SheetDescription className="text-[var(--nexus-text-secondary)]">
            {campaign ? `${campaign.type} campaign · ${campaign.status}` : ''}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-[var(--nexus-text-tertiary)]">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading analytics...
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="w-8 h-8 text-[var(--nexus-accent-danger)] mb-3" />
              <p className="text-sm text-[var(--nexus-text-secondary)]">
                Couldn’t load analytics for this campaign.
              </p>
            </div>
          )}

          {data && !isLoading && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Recipients" value={data.total_recipients} />
                <Stat label="Sent" value={data.sent_count} />
                <Stat label="Delivered" value={data.delivered_count} />
                <Stat label="Failed" value={data.failed_count} />
                {isEmail && <Stat label="Opened" value={data.opened_count} />}
                {isEmail && <Stat label="Clicked" value={data.clicked_count} />}
                <Stat label="Replied" value={data.replied_count} />
                {isVoice && <Stat label="Answered" value={data.answered_count} />}
                {isVoice && <Stat label="Voicemail" value={data.voicemail_count} />}
              </div>

              <div className="space-y-2 rounded-lg border border-[var(--nexus-card-border)] px-4 py-3">
                <Rate label="Delivery rate" value={pct(data.delivery_rate)} />
                {isEmail && <Rate label="Open rate" value={pct(data.open_rate)} />}
                {isEmail && <Rate label="Click rate" value={pct(data.click_rate)} />}
              </div>

              {hasVariants && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[var(--nexus-text-primary)]">
                      A/B variants
                    </h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={declareWinner.isPending}
                      onClick={() => declareWinner.mutate(data.ab_winner_metric ?? undefined)}
                      className="border-[var(--nexus-card-border)] text-[var(--nexus-text-secondary)] hover:bg-[var(--nexus-bg-secondary)]"
                    >
                      <Trophy className="w-3.5 h-3.5 mr-1.5" />
                      {declareWinner.isPending ? 'Deciding…' : 'Declare winner'}
                    </Button>
                  </div>
                  {data.ab_winner_metric && (
                    <p className="text-xs text-[var(--nexus-text-tertiary)]">
                      Winner is decided by{' '}
                      {data.ab_winner_metric === 'open_rate' ? 'open rate' : 'click rate'}.
                    </p>
                  )}
                  <div className="space-y-2">
                    {variants.map((variant) => (
                      <VariantRow key={variant.id} variant={variant} isEmail={isEmail} />
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(data.status_breakdown).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-[var(--nexus-text-primary)]">
                    Recipient status
                  </h4>
                  <div className="space-y-1.5">
                    {Object.entries(data.status_breakdown).map(([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between text-sm text-[var(--nexus-text-secondary)]"
                      >
                        <span className="capitalize">{status}</span>
                        <span className="font-medium text-[var(--nexus-text-primary)]">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function VariantRow({
  variant,
  isEmail,
}: {
  variant: CampaignVariantStats;
  isEmail: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${
        variant.is_winner
          ? 'border-emerald-500 bg-emerald-500/5'
          : 'border-[var(--nexus-card-border)]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--nexus-text-primary)]">
            Variant {variant.label}
          </span>
          {variant.is_winner && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-500">
              <Trophy className="w-3 h-3" aria-hidden="true" /> Winner
            </span>
          )}
        </div>
        <span className="text-xs text-[var(--nexus-text-tertiary)]">{variant.weight}% split</span>
      </div>
      {variant.subject && (
        <p className="mt-1 truncate text-xs text-[var(--nexus-text-secondary)]">
          {variant.subject}
        </p>
      )}
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-[var(--nexus-text-tertiary)]">Sent</p>
          <p className="font-medium text-[var(--nexus-text-primary)]">{variant.sent_count}</p>
        </div>
        {isEmail && (
          <div>
            <p className="text-[var(--nexus-text-tertiary)]">Open rate</p>
            <p className="font-medium text-[var(--nexus-text-primary)]">
              {pct(variant.open_rate)}
            </p>
          </div>
        )}
        {isEmail && (
          <div>
            <p className="text-[var(--nexus-text-tertiary)]">Click rate</p>
            <p className="font-medium text-[var(--nexus-text-primary)]">
              {pct(variant.click_rate)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--nexus-card-border)] px-3 py-2.5">
      <p className="text-xs text-[var(--nexus-text-tertiary)]">{label}</p>
      <p className="text-lg font-semibold text-[var(--nexus-text-primary)]">{value}</p>
    </div>
  );
}

function Rate({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--nexus-text-secondary)]">{label}</span>
      <span className="font-semibold text-[var(--nexus-text-primary)]">{value}</span>
    </div>
  );
}
