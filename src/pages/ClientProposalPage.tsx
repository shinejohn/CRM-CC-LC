import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import {
  CheckCircle2Icon,
  XCircleIcon,
  FileTextIcon,
  Loader2Icon,
  AlertTriangleIcon,
} from 'lucide-react';
import {
  publicQuotesApi,
  PublicQuoteApiError,
  type PublicQuote,
} from '../services/publicQuotesApi';

type ViewState = 'loading' | 'ready' | 'not-found' | 'error';
type ActionState = 'idle' | 'confirm-accept' | 'confirm-decline' | 'submitting';
type Outcome = 'none' | 'accepted' | 'declined';

function formatCurrency(value: string | number | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : value ?? 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number.isFinite(num) ? (num as number) : 0);
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const ClientProposalPage = () => {
  const { token } = useParams<{ token: string }>();

  const [viewState, setViewState] = useState<ViewState>(token ? 'loading' : 'not-found');
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [actionState, setActionState] = useState<ActionState>('idle');
  const [actionError, setActionError] = useState<string>('');
  const [outcome, setOutcome] = useState<Outcome>('none');
  const [declineReason, setDeclineReason] = useState<string>('');

  const loadQuote = useCallback(async (quoteToken: string) => {
    setViewState('loading');
    try {
      const res = await publicQuotesApi.get(quoteToken);
      setQuote(res.data);
      if (res.data.status === 'accepted') setOutcome('accepted');
      else if (res.data.status === 'declined') setOutcome('declined');
      setViewState('ready');
    } catch (err) {
      if (err instanceof PublicQuoteApiError && err.status === 404) {
        setViewState('not-found');
        return;
      }
      setErrorMessage(
        err instanceof Error ? err.message : 'We could not load this proposal.'
      );
      setViewState('error');
    }
  }, []);

  useEffect(() => {
    if (token) void loadQuote(token);
    else setViewState('not-found');
  }, [token, loadQuote]);

  const handleAccept = useCallback(async () => {
    if (!token) return;
    setActionState('submitting');
    setActionError('');
    try {
      const res = await publicQuotesApi.accept(token);
      setQuote(res.data);
      setOutcome('accepted');
      setActionState('idle');
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'We could not accept this proposal.'
      );
      setActionState('confirm-accept');
    }
  }, [token]);

  const handleDecline = useCallback(async () => {
    if (!token) return;
    setActionState('submitting');
    setActionError('');
    try {
      const res = await publicQuotesApi.decline(token, declineReason.trim() || undefined);
      setQuote(res.data);
      setOutcome('declined');
      setActionState('idle');
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'We could not decline this proposal.'
      );
      setActionState('confirm-decline');
    }
  }, [token, declineReason]);

  // ---- Loading ----
  if (viewState === 'loading') {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <Loader2Icon className="h-8 w-8 animate-spin mb-4" aria-hidden="true" />
          <p>Loading your proposal…</p>
        </div>
      </Shell>
    );
  }

  // ---- Not found / no token ----
  if (viewState === 'not-found') {
    return (
      <Shell>
        <StatusPanel
          icon={<FileTextIcon className="h-10 w-10 text-slate-400" aria-hidden="true" />}
          title="Proposal not found"
          message={
            token
              ? 'This proposal link is invalid or has been removed. Please check the link or contact us for a new one.'
              : 'No proposal was specified. Please use the secure link provided to you.'
          }
        />
      </Shell>
    );
  }

  // ---- Error ----
  if (viewState === 'error') {
    return (
      <Shell>
        <StatusPanel
          icon={<AlertTriangleIcon className="h-10 w-10 text-amber-500" aria-hidden="true" />}
          title="Something went wrong"
          message={errorMessage}
          action={
            token ? (
              <button
                type="button"
                onClick={() => void loadQuote(token)}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Try again
              </button>
            ) : undefined
          }
        />
      </Shell>
    );
  }

  if (!quote) return null;

  const isExpired = quote.is_expired || quote.status === 'expired';
  const isClosed = outcome !== 'none' || quote.status === 'accepted' || quote.status === 'declined';
  const canAct = quote.status === 'sent' && !isExpired && outcome === 'none';

  return (
    <Shell>
      {/* Header */}
      <header className="border-b border-slate-200 pb-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-indigo-600">Proposal</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              {quote.quote_number}
            </h1>
            {quote.business_name && (
              <p className="text-slate-600 mt-1">Prepared for {quote.business_name}</p>
            )}
          </div>
          <QuoteStatusBadge status={quote.status} isExpired={isExpired} />
        </div>
        {quote.valid_until && (
          <p className="text-sm text-slate-500 mt-3">
            Valid until {formatDate(quote.valid_until)}
          </p>
        )}
      </header>

      {/* Outcome banners */}
      {outcome === 'accepted' && (
        <Banner tone="success" icon={<CheckCircle2Icon className="h-5 w-5" aria-hidden="true" />}>
          <p className="font-semibold">Proposal accepted — thank you!</p>
          <p className="text-sm mt-0.5">
            An invoice has been created and our team will be in touch with next steps.
          </p>
        </Banner>
      )}
      {outcome === 'declined' && (
        <Banner tone="neutral" icon={<XCircleIcon className="h-5 w-5" aria-hidden="true" />}>
          <p className="font-semibold">Proposal declined</p>
          <p className="text-sm mt-0.5">
            Thank you for letting us know. Please reach out if anything changes.
          </p>
        </Banner>
      )}
      {isExpired && outcome === 'none' && (
        <Banner tone="warning" icon={<AlertTriangleIcon className="h-5 w-5" aria-hidden="true" />}>
          <p className="font-semibold">This proposal has expired</p>
          <p className="text-sm mt-0.5">
            Please contact us for an updated proposal.
          </p>
        </Banner>
      )}

      {/* Line items */}
      <section aria-label="Line items" className="mb-6">
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600">
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium text-right">Qty</th>
                <th className="px-4 py-3 font-medium text-right">Unit price</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quote.items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    No line items
                  </td>
                </tr>
              ) : (
                quote.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-slate-800">{item.description}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-800 font-medium">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Totals */}
      <section aria-label="Totals" className="flex justify-end mb-6">
        <dl className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Subtotal</dt>
            <dd className="text-slate-800">{formatCurrency(quote.subtotal)}</dd>
          </div>
          {Number(quote.discount) > 0 && (
            <div className="flex justify-between">
              <dt className="text-slate-500">Discount</dt>
              <dd className="text-slate-800">−{formatCurrency(quote.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-slate-500">
              Tax{Number(quote.tax_rate) > 0 ? ` (${Number(quote.tax_rate)}%)` : ''}
            </dt>
            <dd className="text-slate-800">{formatCurrency(quote.tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
            <dt className="text-slate-900">Total</dt>
            <dd className="text-slate-900">{formatCurrency(quote.total)}</dd>
          </div>
        </dl>
      </section>

      {/* Notes */}
      {quote.notes && (
        <section aria-label="Notes" className="mb-6">
          <h2 className="text-sm font-medium text-slate-700 mb-1">Notes</h2>
          <p className="text-sm text-slate-600 whitespace-pre-line">{quote.notes}</p>
        </section>
      )}

      {/* Actions */}
      {canAct && actionState !== 'confirm-accept' && actionState !== 'confirm-decline' && (
        <div className="flex flex-col sm:flex-row gap-3 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={() => {
              setActionError('');
              setActionState('confirm-accept');
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            <CheckCircle2Icon className="h-5 w-5" aria-hidden="true" />
            Accept proposal
          </button>
          <button
            type="button"
            onClick={() => {
              setActionError('');
              setActionState('confirm-decline');
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            <XCircleIcon className="h-5 w-5" aria-hidden="true" />
            Decline
          </button>
        </div>
      )}

      {/* Confirm accept */}
      {actionState === 'confirm-accept' && (
        <ConfirmBlock
          title="Accept this proposal?"
          description="Accepting will generate an invoice and notify our team to begin work."
          error={actionError}
          confirmLabel="Yes, accept"
          confirmTone="emerald"
          submitting={false}
          onConfirm={() => void handleAccept()}
          onCancel={() => setActionState('idle')}
        />
      )}

      {/* Confirm decline */}
      {actionState === 'confirm-decline' && (
        <ConfirmBlock
          title="Decline this proposal?"
          description="You can optionally tell us why."
          error={actionError}
          confirmLabel="Yes, decline"
          confirmTone="slate"
          submitting={false}
          onConfirm={() => void handleDecline()}
          onCancel={() => setActionState('idle')}
        >
          <label htmlFor="decline-reason" className="sr-only">
            Reason for declining
          </label>
          <textarea
            id="decline-reason"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            rows={3}
            placeholder="Reason (optional)"
            className="w-full mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </ConfirmBlock>
      )}

      {/* Submitting */}
      {actionState === 'submitting' && (
        <div className="flex items-center justify-center gap-2 border-t border-slate-200 pt-6 text-slate-500">
          <Loader2Icon className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>Processing…</span>
        </div>
      )}

      {isClosed && actionState === 'idle' && !canAct && outcome === 'none' && (
        <p className="text-sm text-slate-400 border-t border-slate-200 pt-6">
          This proposal is no longer open for a response.
        </p>
      )}
    </Shell>
  );
};

// ---------- Presentational helpers ----------

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <main className="mx-auto max-w-3xl bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10">
        {children}
      </main>
    </div>
  );
}

function StatusPanel({
  icon,
  title,
  message,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-16">
      <div className="mb-4">{icon}</div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">{title}</h1>
      <p className="text-slate-600 max-w-md mb-6">{message}</p>
      {action}
    </div>
  );
}

function QuoteStatusBadge({ status, isExpired }: { status: string; isExpired: boolean }) {
  const effective = isExpired && status === 'sent' ? 'expired' : status;
  const styles: Record<string, string> = {
    sent: 'bg-blue-50 text-blue-700 border-blue-200',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    declined: 'bg-slate-100 text-slate-600 border-slate-200',
    expired: 'bg-amber-50 text-amber-700 border-amber-200',
    draft: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  const label: Record<string, string> = {
    sent: 'Awaiting response',
    accepted: 'Accepted',
    declined: 'Declined',
    expired: 'Expired',
    draft: 'Draft',
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
        styles[effective] ?? styles.draft
      }`}
    >
      {label[effective] ?? effective}
    </span>
  );
}

function Banner({
  tone,
  icon,
  children,
}: {
  tone: 'success' | 'warning' | 'neutral';
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 mb-6 ${tones[tone]}`} role="status">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>{children}</div>
    </div>
  );
}

function ConfirmBlock({
  title,
  description,
  error,
  confirmLabel,
  confirmTone,
  onConfirm,
  onCancel,
  children,
}: {
  title: string;
  description: string;
  error?: string;
  confirmLabel: string;
  confirmTone: 'emerald' | 'slate';
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}) {
  const confirmStyles =
    confirmTone === 'emerald'
      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
      : 'bg-slate-800 hover:bg-slate-900 text-white';
  return (
    <div className="border-t border-slate-200 pt-6">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-600 mt-1">{description}</p>
      {children}
      {error && (
        <p className="text-sm text-red-600 mt-3" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={onConfirm}
          className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${confirmStyles}`}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
